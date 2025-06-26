import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

export class MITMSimulation {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.isRunning = false;

    // Entities
    this.user = null;
    this.server = null;
    this.attacker = null;
    this.simulationGroup = new THREE.Group();

    // Communication
    this.packets = [];
    this.packetId = 0;

    // Attack state
    this.mitmActive = false;
    this.encryptionEnabled = false;
    this.vpnEnabled = false;
    this.attackType = "passive"; // passive, active, sslstrip

    // Statistics
    this.totalPackets = 0;
    this.interceptedCount = 0;
    this.modifiedCount = 0;

    // Connection lines
    this.legitimateConnection = null;
    this.attackerConnections = [];

    // Colors
    this.colors = {
      user: 0x4488ff,
      server: 0x44ff44,
      attacker: 0xff4444,
      packets: {
        normal: 0x88ccff,
        encrypted: 0x44ff88,
        intercepted: 0xff8844,
        malicious: 0xff4444,
      },
      connections: {
        legitimate: 0x44ff44,
        compromised: 0xff4444,
      },
    };
  }

  async init() {
    this.createScene();
    this.createEntities();
    this.createUI();
    this.setupEventListeners();
    this.startSimulation();
  }

  createScene() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 8, 12);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Add simulation group
    this.scene.add(this.simulationGroup);

    // Platform
    const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.2, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.3,
      roughness: 0.7,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -0.1;
    platform.receiveShadow = true;
    this.simulationGroup.add(platform);
  }

  createEntities() {
    // Create User (left side)
    this.user = this.createEntity(
      new THREE.Vector3(-4, 0, 0),
      this.colors.user,
      "USER"
    );

    // Create Server (right side)
    this.server = this.createEntity(
      new THREE.Vector3(4, 0, 0),
      this.colors.server,
      "SERVER",
      "box"
    );

    // Create Attacker (center, slightly forward)
    this.attacker = this.createEntity(
      new THREE.Vector3(0, 0, 2),
      this.colors.attacker,
      "ATTACKER"
    );
    this.attacker.visible = false; // Hidden initially

    // Create initial legitimate connection
    this.createLegitimateConnection();
  }

  createEntity(position, color, label, shape = "sphere") {
    let geometry;
    if (shape === "box") {
      geometry = new THREE.BoxGeometry(1, 1.5, 1);
    } else {
      geometry = new THREE.SphereGeometry(0.5, 32, 32);
    }

    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.1,
      metalness: 0.3,
      roughness: 0.4,
    });

    const entity = new THREE.Mesh(geometry, material);
    entity.position.copy(position);
    entity.castShadow = true;
    entity.receiveShadow = true;

    // Add glow effect
    const glowGeometry = geometry.clone();
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.scale.multiplyScalar(1.2);
    entity.add(glow);

    // Add label
    this.createLabel(
      label,
      position.clone().add(new THREE.Vector3(0, 1.2, 0)),
      color
    );

    this.simulationGroup.add(entity);
    return entity;
  }

  createLabel(text, position, color) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 64;

    context.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
    context.font = "bold 24px Arial";
    context.textAlign = "center";
    context.fillText(text, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(2, 0.5, 1);

    this.simulationGroup.add(sprite);
    return sprite;
  }

  createLegitimateConnection() {
    const points = [this.user.position, this.server.position];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: this.colors.connections.legitimate,
      linewidth: 3,
    });
    this.legitimateConnection = new THREE.Line(geometry, material);
    this.simulationGroup.add(this.legitimateConnection);
  }

  createAttackerConnections() {
    // Clear existing attacker connections
    this.attackerConnections.forEach((line) => {
      this.simulationGroup.remove(line);
    });
    this.attackerConnections = [];

    if (this.attacker.visible) {
      // Connection: User → Attacker
      const userToAttacker = [this.user.position, this.attacker.position];
      const userGeometry = new THREE.BufferGeometry().setFromPoints(
        userToAttacker
      );
      const userMaterial = new THREE.LineBasicMaterial({
        color: this.colors.connections.compromised,
        linewidth: 2,
      });
      const userLine = new THREE.Line(userGeometry, userMaterial);
      this.simulationGroup.add(userLine);
      this.attackerConnections.push(userLine);

      // Connection: Attacker → Server
      const attackerToServer = [this.attacker.position, this.server.position];
      const serverGeometry = new THREE.BufferGeometry().setFromPoints(
        attackerToServer
      );
      const serverMaterial = new THREE.LineBasicMaterial({
        color: this.colors.connections.compromised,
        linewidth: 2,
      });
      const serverLine = new THREE.Line(serverGeometry, serverMaterial);
      this.simulationGroup.add(serverLine);
      this.attackerConnections.push(serverLine);

      // Hide legitimate connection
      this.legitimateConnection.visible = false;
    } else {
      // Show legitimate connection
      this.legitimateConnection.visible = true;
    }
  }

  createUI() {
    const panel = document.createElement("div");
    panel.id = "mitm-education-panel";
    panel.className = "mitm-panel";

    panel.innerHTML = `
      <h2>🕵️ Man-in-the-Middle Attack Lab</h2>
      
      <!-- Educational Content (Expanded by default) -->
      <div class="education-section">
        <button id="education-toggle" class="education-toggle">📚 Hide Complete MITM Guide</button>
        <div id="education-content" class="education-content">
          <div class="read-first-notice">
            <h3>📖 Read First! Understanding MITM Attacks</h3>
            <p><em>Start here to understand what you're about to see in the simulation</em></p>
          </div>
          
          <h4>🎯 What is a Man-in-the-Middle Attack?</h4>
          <p>Imagine you're trying to have a private conversation with a friend across a crowded room. A Man-in-the-Middle (MITM) attack is like someone secretly positioning themselves between you two, listening to everything you say, and possibly even changing your messages before they reach your friend.</p>
          
          <p>In computer terms: When your device (like your phone or laptop) tries to communicate with a website or server, an attacker secretly inserts themselves into this communication path. They can then:</p>
          <ul>
            <li><strong>🔍 Eavesdrop:</strong> Read all your messages, passwords, and personal data</li>
            <li><strong>✏️ Modify:</strong> Change what you're sending or what you receive</li>
            <li><strong>🎭 Impersonate:</strong> Pretend to be you or the website you're visiting</li>
          </ul>

          <h4>📡 How Does This Happen in Real Life?</h4>
          
          <div class="scenario-box">
            <h5>☕ Coffee Shop Scenario (Most Common)</h5>
            <p>You connect to "Free_WiFi" at a coffee shop. But this WiFi is actually created by a hacker sitting nearby with a laptop. When you try to check your email or social media:</p>
            <ol>
              <li>Your device sends data to what it thinks is the internet</li>
              <li>The hacker's laptop receives it first (they're the "middle")</li>
              <li>They can read your passwords, then forward the data to the real internet</li>
              <li>You never know anything happened!</li>
            </ol>
          </div>

          <div class="scenario-box">
            <h5>🏠 Home Network Attack</h5>
            <p>Even on your home WiFi, attackers can use "ARP Spoofing" - essentially telling your device "Hey, I'm your router!" Your device believes them and sends all internet traffic through the attacker's computer first.</p>
          </div>

          <div class="scenario-box">
            <h5>🌐 DNS Hijacking</h5>
            <p>When you type "facebook.com", your computer asks a DNS server "Where is Facebook?" A hacker can answer "It's at MY server!" and redirect you to a fake website that looks exactly like Facebook but steals your login.</p>
          </div>

          <h4>🔧 Technical Attack Methods</h4>
          
          <div class="tech-explanation">
            <h5>🎭 Passive Listening</h5>
            <p><strong>What it means:</strong> The attacker just watches and records everything, like a spy with binoculars.</p>
            <p><strong>What they get:</strong> Passwords, messages, browsing history, personal data</p>
            <p><strong>Why it's dangerous:</strong> You'll never know it happened</p>
          </div>

          <div class="tech-explanation">
            <h5>✏️ Active Modification</h5>
            <p><strong>What it means:</strong> The attacker changes your messages or the responses you receive.</p>
            <p><strong>Examples:</strong> 
              <ul>
                <li>You try to visit your bank - they redirect you to a fake bank website</li>
                <li>You send "Transfer $100" - they change it to "Transfer $1000"</li>
                <li>You download software - they replace it with malware</li>
              </ul>
            </p>
          </div>

          <div class="tech-explanation">
            <h5>🔓 SSL Stripping</h5>
            <p><strong>What it means:</strong> Websites use HTTPS (the padlock icon) to encrypt data. Attackers can "strip" this protection, downgrading you to unencrypted HTTP.</p>
            <p><strong>How:</strong> When you type "facebook.com", they redirect you to "http://facebook.com" (no 's') - a fake unencrypted version where they can read everything.</p>
          </div>

          <h4>🛡️ How to Protect Yourself</h4>
          
          <div class="defense-explanation">
            <h5>🔒 HTTPS Encryption (The Padlock)</h5>
            <p><strong>What it does:</strong> Scrambles your data so even if someone intercepts it, they can't read it.</p>
            <p><strong>How to use:</strong> Always look for the padlock icon in your browser. Never enter passwords on sites without it!</p>
            <p><strong>In our simulation:</strong> Watch how encrypted packets (green) can't be read by the attacker, while normal packets (blue) can be intercepted and read.</p>
          </div>

          <div class="defense-explanation">
            <h5>🔐 VPN (Virtual Private Network)</h5>
            <p><strong>What it does:</strong> Creates a secure "tunnel" between your device and a trusted server. Even if someone intercepts your data, they only see encrypted gibberish.</p>
            <p><strong>Think of it like:</strong> Sending a letter in a locked box instead of a regular envelope.</p>
            <p><strong>In our simulation:</strong> When VPN is enabled, the attacker can't intercept anything - all packets go directly through the secure tunnel.</p>
          </div>

          <div class="defense-explanation">
            <h5>📜 Certificate Validation</h5>
            <p><strong>What it does:</strong> Websites prove their identity with digital certificates (like an ID card). Your browser checks if the certificate is real.</p>
            <p><strong>Warning signs:</strong> If you see "This site is not secure" or certificate warnings, don't proceed!</p>
            <p><strong>Why attackers hate this:</strong> They can't easily fake legitimate certificates from trusted companies.</p>
          </div>

          <h4>🎮 Using This Simulation</h4>
          <div class="simulation-guide">
            <h5>Step 1: Watch Normal Communication</h5>
            <p>See how the User and Server normally communicate directly (green line).</p>
            
            <h5>Step 2: Start the Attack</h5>
            <p>Click "Start MITM Attack" - watch the attacker appear and intercept the communication path (red lines).</p>
            
            <h5>Step 3: Experiment with Defenses</h5>
            <p>Toggle HTTPS and VPN to see how they protect against interception. Notice how the statistics change!</p>
            
            <h5>Step 4: Try Different Attack Types</h5>
            <p>Switch between "Passive Listening" and "Active Modification" to see the difference in the visualization.</p>
          </div>

          <h4>🌍 Real-World Impact</h4>
          <p><strong>Why this matters:</strong> MITM attacks are responsible for millions of data breaches annually. Understanding them helps you:</p>
          <ul>
            <li>🏦 Protect your banking and financial information</li>
            <li>🔐 Keep your passwords and personal data safe</li>
            <li>📱 Use public WiFi safely</li>
            <li>🛒 Shop online securely</li>
            <li>💼 Protect your company's sensitive data</li>
          </ul>

          <div class="key-takeaway">
            <h5>🔑 Key Takeaway</h5>
            <p>Always assume someone might be listening on public networks. Use HTTPS, enable VPNs, and pay attention to security warnings. A few seconds of caution can prevent years of problems!</p>
          </div>
        </div>
      </div>

      <!-- Attack Controls -->
      <div class="control-section">
        <h3>⚡ Attack Controls</h3>
        <div class="control-group">
          <button id="start-mitm" class="control-btn start-btn">Start MITM Attack</button>
          <button id="stop-mitm" class="control-btn stop-btn" disabled>Stop Attack</button>
        </div>
        
        <div class="attack-config">
          <label for="attack-type">Attack Type:</label>
          <select id="attack-type">
            <option value="passive">Passive Listening</option>
            <option value="active">Active Modification</option>
            <option value="sslstrip">SSL Stripping</option>
          </select>
        </div>
      </div>

      <!-- Defense Controls -->
      <div class="control-section">
        <h3>🛡️ Defense Mechanisms</h3>
        
        <div class="defense-control">
          <label class="checkbox-label">
            <input type="checkbox" id="encryption-toggle">
            🔒 HTTPS Encryption
          </label>
        </div>
        
        <div class="defense-control">
          <label class="checkbox-label">
            <input type="checkbox" id="cert-validation" checked>
            📜 Certificate Validation
          </label>
        </div>
        
        <div class="defense-control">
          <label class="checkbox-label">
            <input type="checkbox" id="vpn-toggle">
            🔐 VPN Protection
          </label>
        </div>
      </div>

      <!-- Status Dashboard -->
      <div class="status-section">
        <h3>📊 Attack Statistics</h3>
        <div class="status-grid">
          <div class="status-item">
            <label>Total Packets:</label>
            <span id="total-packets" class="status-value">0</span>
          </div>
          <div class="status-item">
            <label>Intercepted:</label>
            <span id="intercepted-packets" class="status-value">0</span>
          </div>
          <div class="status-item">
            <label>Modified:</label>
            <span id="modified-packets" class="status-value">0</span>
          </div>
          <div class="status-item">
            <label>Attack Success:</label>
            <span id="success-rate" class="status-value">0%</span>
          </div>
        </div>
      </div>

      <button id="close-simulation" class="close-btn">Close Lab</button>
    `;

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      #mitm-education-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 420px;
        max-height: 90vh;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        padding: 20px;
        border-radius: 12px;
        z-index: 1000;
        overflow-y: auto;
        font-family: 'Segoe UI', Arial, sans-serif;
        border: 2px solid rgba(255, 136, 0, 0.4);
        box-shadow: 0 0 30px rgba(255, 136, 0, 0.3);
      }
      
      .mitm-panel h2 {
        color: #ff8800;
        margin-top: 0;
        text-align: center;
        font-size: 18px;
      }
      
      .mitm-panel h3 {
        color: #44aaff;
        margin: 15px 0 10px 0;
        font-size: 16px;
      }
      
      .mitm-panel h4 {
        color: #ffaa44;
        margin: 10px 0 5px 0;
        font-size: 14px;
      }
      
      .control-section, .status-section, .education-section {
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
        border-left: 3px solid #44aaff;
      }
      
      .control-group {
        display: flex;
        gap: 10px;
        margin: 10px 0;
      }
      
      .control-btn {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
      }
      
      .start-btn {
        background: #ff4444;
        color: white;
      }
      
      .start-btn:hover:not(:disabled) {
        background: #ff6666;
      }
      
      .stop-btn {
        background: #44aa44;
        color: white;
      }
      
      .stop-btn:hover:not(:disabled) {
        background: #66cc66;
      }
      
      .control-btn:disabled {
        background: #666;
        cursor: not-allowed;
        opacity: 0.5;
      }
      
      .attack-config, .defense-control {
        margin: 10px 0;
        padding: 10px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 5px;
      }
      
      .attack-config select {
        width: 100%;
        padding: 5px;
        margin-top: 5px;
        background: #333;
        color: white;
        border: 1px solid #555;
        border-radius: 3px;
      }
      
      .checkbox-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-weight: bold;
        color: #88ff88;
      }
      
      .checkbox-label input {
        margin-right: 10px;
        transform: scale(1.2);
      }
      
      .status-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      
      .status-item {
        background: rgba(255, 255, 255, 0.05);
        padding: 8px;
        border-radius: 4px;
        text-align: center;
      }
      
      .status-item label {
        display: block;
        font-size: 12px;
        color: #aaa;
      }
      
      .status-value {
        font-weight: bold;
        font-size: 14px;
        color: #44ff44;
      }
      
      .education-toggle {
        width: 100%;
        background: rgba(255, 136, 0, 0.2);
        color: #ff8800;
        border: 1px solid #ff8800;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .education-toggle:hover {
        background: rgba(255, 136, 0, 0.3);
      }
      
      .education-content {
        display: block;
      }
      
      .education-content ul {
        margin: 5px 0;
        padding-left: 20px;
      }
      
      .education-content li {
        margin: 3px 0;
        font-size: 13px;
      }

      .education-content ol {
        margin: 8px 0;
        padding-left: 20px;
      }

      .education-content ol li {
        margin: 5px 0;
        font-size: 13px;
        line-height: 1.4;
      }
      
      .read-first-notice {
        background: rgba(255, 136, 0, 0.15);
        border: 2px solid #ff8800;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .read-first-notice h3 {
        color: #ff8800;
        margin-top: 0;
        margin-bottom: 8px;
      }
      
      .read-first-notice em {
        color: #ffcc88;
        font-size: 14px;
      }
      
      .scenario-box {
        background: rgba(68, 170, 255, 0.1);
        border-left: 4px solid #44aaff;
        padding: 12px;
        margin: 12px 0;
        border-radius: 6px;
      }
      
      .scenario-box h5 {
        color: #44aaff;
        margin-top: 0;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .tech-explanation {
        background: rgba(255, 170, 68, 0.1);
        border-left: 4px solid #ffaa44;
        padding: 12px;
        margin: 12px 0;
        border-radius: 6px;
      }
      
      .tech-explanation h5 {
        color: #ffaa44;
        margin-top: 0;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .defense-explanation {
        background: rgba(68, 255, 136, 0.1);
        border-left: 4px solid #44ff88;
        padding: 12px;
        margin: 12px 0;
        border-radius: 6px;
      }
      
      .defense-explanation h5 {
        color: #44ff88;
        margin-top: 0;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .simulation-guide {
        background: rgba(170, 68, 255, 0.1);
        border-left: 4px solid #aa44ff;
        padding: 12px;
        margin: 12px 0;
        border-radius: 6px;
      }
      
      .simulation-guide h5 {
        color: #aa44ff;
        margin-top: 0;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .key-takeaway {
        background: rgba(255, 68, 68, 0.15);
        border: 2px solid #ff4444;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        text-align: center;
      }
      
      .key-takeaway h5 {
        color: #ff4444;
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 16px;
      }
      
      .key-takeaway p {
        color: #ffaaaa;
        font-weight: bold;
        margin-bottom: 0;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .close-btn {
        width: 100%;
        background: #ff4444;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        margin-top: 20px;
      }
      
      .close-btn:hover {
        background: #ff6666;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(panel);
  }

  setupEventListeners() {
    // Attack controls
    document.getElementById("start-mitm").addEventListener("click", () => {
      this.startMITMAttack();
    });

    document.getElementById("stop-mitm").addEventListener("click", () => {
      this.stopMITMAttack();
    });

    // Attack type selection
    document.getElementById("attack-type").addEventListener("change", (e) => {
      this.attackType = e.target.value;
    });

    // Defense toggles
    document
      .getElementById("encryption-toggle")
      .addEventListener("change", (e) => {
        this.encryptionEnabled = e.target.checked;
      });

    document
      .getElementById("cert-validation")
      .addEventListener("change", (e) => {
        this.certificateValidation = e.target.checked;
      });

    document.getElementById("vpn-toggle").addEventListener("change", (e) => {
      this.vpnEnabled = e.target.checked;
    });

    // Educational content toggle
    document
      .getElementById("education-toggle")
      .addEventListener("click", () => {
        const content = document.getElementById("education-content");
        const isVisible = content.style.display !== "none";
        content.style.display = isVisible ? "none" : "block";
        document.getElementById("education-toggle").textContent = isVisible
          ? "📚 Show Complete MITM Guide"
          : "📚 Hide Complete MITM Guide";
      });

    // Close button
    document
      .getElementById("close-simulation")
      .addEventListener("click", () => {
        this.close();
      });

    // Window resize
    window.addEventListener("resize", () => this.handleResize());
  }

  startSimulation() {
    this.isRunning = true;
    this.animate();

    // Start normal communication
    this.startNormalCommunication();

    console.log(
      "MITM Lab ready! Use controls to start attack and enable defenses."
    );
  }

  startNormalCommunication() {
    const sendPacket = () => {
      if (!this.isRunning) return;

      // Alternate between user→server and server→user
      const isFromUser = Math.random() > 0.5;
      const fromPos = isFromUser ? this.user.position : this.server.position;
      const toPos = isFromUser ? this.server.position : this.user.position;

      this.createPacket(fromPos, toPos, false);

      // Schedule next packet
      setTimeout(sendPacket, 2000 + Math.random() * 3000);
    };

    sendPacket();
  }

  startMITMAttack() {
    this.mitmActive = true;
    this.attacker.visible = true;

    // Update UI
    document.getElementById("start-mitm").disabled = true;
    document.getElementById("stop-mitm").disabled = false;

    // Create attacker connections
    this.createAttackerConnections();

    console.log(`MITM Attack started - Type: ${this.attackType}`);
  }

  stopMITMAttack() {
    this.mitmActive = false;
    this.attacker.visible = false;

    // Update UI
    document.getElementById("start-mitm").disabled = false;
    document.getElementById("stop-mitm").disabled = true;

    // Remove attacker connections
    this.createAttackerConnections();

    console.log("MITM Attack stopped");
  }

  createPacket(fromPos, toPos, isIntercepted = false) {
    // Determine packet color based on encryption and interception
    let color;
    if (isIntercepted) {
      color = this.colors.packets.intercepted;
    } else if (this.encryptionEnabled && !this.vpnEnabled) {
      color = this.colors.packets.encrypted;
    } else {
      color = this.colors.packets.normal;
    }

    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
    });

    const packet = new THREE.Mesh(geometry, material);
    packet.position.copy(fromPos);
    packet.castShadow = true;

    // Determine path based on MITM status
    let targetPos;
    if (this.mitmActive && !this.vpnEnabled) {
      // Packet goes through attacker
      targetPos = this.attacker.position.clone();
    } else {
      // Direct communication
      targetPos = toPos.clone();
    }

    const packetData = {
      id: this.packetId++,
      mesh: packet,
      targetPosition: targetPos,
      finalDestination: toPos.clone(),
      speed: 3,
      isIntercepted: this.mitmActive && !this.vpnEnabled,
      isEncrypted: this.encryptionEnabled,
      fromPos: fromPos.clone(),
      throughAttacker: this.mitmActive && !this.vpnEnabled,
    };

    this.packets.push(packetData);
    this.simulationGroup.add(packet);
    this.totalPackets++;

    if (packetData.isIntercepted) {
      this.interceptedCount++;
    }

    this.updateUI();
  }

  updateUI() {
    document.getElementById("total-packets").textContent = this.totalPackets;
    document.getElementById("intercepted-packets").textContent =
      this.interceptedCount;
    document.getElementById("modified-packets").textContent =
      this.modifiedCount;

    const successRate =
      this.totalPackets > 0
        ? Math.round((this.interceptedCount / this.totalPackets) * 100)
        : 0;
    document.getElementById("success-rate").textContent = `${successRate}%`;

    // Color code the success rate
    const successElement = document.getElementById("success-rate");
    if (successRate === 0) {
      successElement.style.color = "#44ff44";
    } else if (successRate < 50) {
      successElement.style.color = "#ffaa44";
    } else {
      successElement.style.color = "#ff4444";
    }
  }

  animate() {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.animate());

    // Update controls
    if (this.controls) {
      this.controls.update();
    }

    // Rotate entities
    if (this.user) this.user.rotation.y += 0.01;
    if (this.server) this.server.rotation.y += 0.01;
    if (this.attacker && this.attacker.visible) {
      this.attacker.rotation.y -= 0.02;
      this.attacker.rotation.x = Math.sin(Date.now() * 0.003) * 0.1;
    }

    // Update packets
    this.packets = this.packets.filter((packet) => {
      const direction = new THREE.Vector3()
        .subVectors(packet.targetPosition, packet.mesh.position)
        .normalize();

      packet.mesh.position.add(direction.multiplyScalar(packet.speed * 0.016));

      // Check if packet reached target
      if (packet.mesh.position.distanceTo(packet.targetPosition) < 0.2) {
        if (
          packet.throughAttacker &&
          packet.targetPosition.equals(this.attacker.position)
        ) {
          // Packet reached attacker - now send to final destination
          packet.targetPosition = packet.finalDestination;

          // Modify packet if active attack
          if (this.attackType === "active") {
            packet.mesh.material.color.setHex(this.colors.packets.malicious);
            packet.mesh.material.emissive.setHex(this.colors.packets.malicious);
            this.modifiedCount++;
            this.updateUI();
          }

          return true; // Continue packet journey
        } else {
          // Packet reached final destination
          this.simulationGroup.remove(packet.mesh);
          return false;
        }
      }

      return true;
    });

    this.renderer.render(this.scene, this.camera);
  }

  close() {
    this.isRunning = false;

    // Remove UI
    const panel = document.getElementById("mitm-education-panel");
    if (panel) {
      panel.remove();
    }

    // Remove renderer
    if (this.renderer && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Cleanup
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Dispatch close event
    window.dispatchEvent(new CustomEvent("mitmSimulationClosed"));
  }

  handleResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
}
