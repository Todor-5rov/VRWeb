import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

export class DDoSSimulation {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.simulationGroup = new THREE.Group();
    this.users = [];
    this.server = null;
    this.attacker = null;
    this.requests = [];
    this.responses = [];
    this.isRunning = false;
    this.serverHealth = 1.0; // 1.0 = healthy, 0.0 = overloaded
    this.originalServerColor = 0x00aaff;
    this.attackStarted = false;
    this.requestId = 0;
    this.responseId = 0;

    // Prevention controls
    this.rateLimitEnabled = false;
    this.rateLimitThreshold = 10; // requests per second
    this.loadBalancingEnabled = false;
    this.servers = [];
    this.currentServerIndex = 0;
    this.requestCounts = new Map(); // Track requests per source
    this.lastRequestTime = new Map();

    // Track entities and connections for proper cleanup
    this.allUsers = [];
    this.connectionLines = [];
    this.entityLabels = [];
    this.userServerAssignments = new Map(); // Track which user connects to which server
    this.attackerConnectionLines = []; // Track attacker connection lines

    // Enhanced color scheme for better visibility
    this.colors = {
      server: {
        healthy: 0x00aaff,
        warning: 0xff8800,
        critical: 0xff2244,
      },
      user: 0x44ff88,
      attacker: 0xff4444,
      background: 0x0f0f23,
      requests: {
        normal: 0x88ff44,
        attack: 0xff6666,
      },
      responses: {
        normal: 0x44ffaa,
        delayed: 0xffaa44,
        failed: 0xff4444,
      },
    };

    // Enhanced educational content
    this.educationalContent = {
      title: "Interactive DDoS Attack Prevention Lab",
      description:
        "Learn how DDoS attacks work and practice implementing real-world prevention techniques. This simulation demonstrates both attack scenarios and defense mechanisms used by cybersecurity professionals.",

      whatIsDDoS: {
        title: "What is a DDoS Attack?",
        content: [
          "DDoS (Distributed Denial of Service) attacks flood servers with fake traffic",
          "Attackers use botnets - networks of compromised computers",
          "Goal: Make websites/services unavailable to legitimate users",
          "Can cause millions in damages and reputation loss",
        ],
      },

      howItWorks: {
        title: "Attack Mechanics",
        content: [
          "1. Attacker compromises multiple devices (creates botnet)",
          "2. All devices simultaneously send requests to target server",
          "3. Server resources (CPU, memory, bandwidth) get exhausted",
          "4. Legitimate users cannot access the service",
          "5. Business operations and revenue are disrupted",
        ],
      },

      defenseStrategies: {
        title: "Defense Strategies You'll Practice",
        content: [
          "Rate Limiting: Restrict requests per IP address per time period",
          "Load Balancing: Distribute traffic across multiple servers",
          "Traffic Analysis: Monitor patterns to detect anomalies",
          "Blacklisting: Block known malicious IP addresses",
          "CDN Protection: Use services like Cloudflare or AWS Shield",
        ],
      },

      realWorldImpact: {
        title: "Real-World Impact",
        content: [
          "GitHub (2018): 1.35 Tbps attack, largest ever recorded",
          "Dyn DNS (2016): Took down Twitter, Netflix, Reddit for hours",
          "Estonia (2007): Entire country's internet infrastructure attacked",
          "Average cost: $2.5 million per attack for businesses",
          "Attacks increasing 31% year-over-year globally",
        ],
      },

      labInstructions: {
        title: "Lab Instructions",
        content: [
          "1. Observe normal traffic flow between users and server",
          "2. Watch what happens when DDoS attack begins",
          "3. Try enabling Rate Limiting to block excessive requests",
          "4. Add Load Balancers to distribute traffic load",
          "5. Experiment with different settings to find optimal protection",
          "6. Notice how server health improves with each defense",
        ],
      },
    };
  }

  init() {
    // Create simulation scene with enhanced background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.colors.background);

    // Add fog for depth perception
    this.scene.fog = new THREE.Fog(this.colors.background, 10, 50);

    // Camera setup for better 3D viewing
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(8, 6, 10);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup with enhanced settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add VR-like orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.autoRotate = false;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 20;
    this.controls.minPolarAngle = Math.PI / 6;
    this.controls.maxPolarAngle = Math.PI - Math.PI / 6;

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0x404080, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);

    // Add rim lighting
    const rimLight = new THREE.DirectionalLight(0x44aaff, 0.8);
    rimLight.position.set(-5, 3, -5);
    this.scene.add(rimLight);

    // Add point light for dramatic effect
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 20);
    pointLight.position.set(0, 8, 0);
    pointLight.castShadow = true;
    this.scene.add(pointLight);

    this.scene.add(this.simulationGroup);

    this.createSimulationElements();
    this.createUI();

    return this.renderer.domElement;
  }

  createSimulationElements() {
    // Create the first server at origin
    this.createServer(0);

    // Create initial users (2 per server)
    this.createUsersForCurrentServers();

    // Create enhanced attacker - initially hidden, positioned opposite to users
    const attackerGeometry = new THREE.SphereGeometry(0.5, 20, 20);
    const attackerMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.attacker,
      metalness: 0.8,
      roughness: 0.2,
      emissive: this.colors.attacker,
      emissiveIntensity: 0.2,
    });
    this.attacker = new THREE.Mesh(attackerGeometry, attackerMaterial);
    this.attacker.position.set(0, 0, 6); // Front position, opposite to users who are at negative Z
    this.attacker.visible = false;
    this.attacker.castShadow = true;
    this.attacker.receiveShadow = true;
    this.simulationGroup.add(this.attacker);

    // Add attacker glow effect
    const attackerGlowGeometry = new THREE.SphereGeometry(0.6, 20, 20);
    const attackerGlowMaterial = new THREE.MeshBasicMaterial({
      color: this.colors.attacker,
      transparent: true,
      opacity: 0.3,
    });
    const attackerGlow = new THREE.Mesh(
      attackerGlowGeometry,
      attackerGlowMaterial
    );
    this.attacker.add(attackerGlow);

    // Create a platform/ground for better spatial reference
    const platformGeometry = new THREE.CylinderGeometry(12, 12, 0.1, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x222244,
      metalness: 0.1,
      roughness: 0.9,
      transparent: true,
      opacity: 0.3,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(0, -1.5, 0);
    platform.receiveShadow = true;
    this.simulationGroup.add(platform);
  }

  createServer(index) {
    // LAYOUT SCHEME: Servers positioned in horizontal line at center (Z=0)
    // Server spacing: 2.5 units apart on X-axis
    const serverSpacing = 2.5;
    const totalServers = this.servers.length + 1; // Including the one being created
    const startX = -((totalServers - 1) * serverSpacing) / 2;
    const serverX = startX + index * serverSpacing;

    const serverGeometry = new THREE.CylinderGeometry(0.6, 0.7, 2.0, 12);
    const serverMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.server.healthy,
      metalness: 0.7,
      roughness: 0.3,
      emissive: this.colors.server.healthy,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 1.0,
    });
    const server = new THREE.Mesh(serverGeometry, serverMaterial);
    server.position.set(serverX, 0, 0); // Always at Z=0 (center line)
    server.castShadow = true;
    server.receiveShadow = true;
    server.userData = {
      health: 1.0,
      requestCount: 0,
      maxCapacity: 10, // Requests per second this server can handle
      currentLoad: 0, // Current requests being processed
      lastLoadReset: Date.now(),
    };
    this.simulationGroup.add(server);

    if (index === 0) {
      this.server = server;
      this.servers = [server];
    } else {
      this.servers.push(server);
    }

    // Add server glow effect
    const serverGlowGeometry = new THREE.CylinderGeometry(0.65, 0.75, 2.1, 12);
    const serverGlowMaterial = new THREE.MeshBasicMaterial({
      color: this.colors.server.healthy,
      transparent: true,
      opacity: 0.2,
    });
    const serverGlow = new THREE.Mesh(serverGlowGeometry, serverGlowMaterial);
    server.add(serverGlow);

    // Add server label
    const serverLabel = this.createLabel(
      `SERVER ${index + 1}`,
      server.position.clone().add(new THREE.Vector3(0, 1.8, 0)),
      0xffffff
    );
    this.entityLabels.push({
      type: "server",
      index: index,
      label: serverLabel,
    });

    return server;
  }

  createUsersForCurrentServers() {
    // LAYOUT SCHEME: Users positioned in back semicircle (Z < 0)
    // 2 users per server, evenly distributed in semicircle from Z=-3 to Z=-7
    const usersPerServer = 2;
    const totalUsers = usersPerServer * this.servers.length;

    // Clear existing users first
    this.clearAllUsers();

    // Position users in back semicircle (Z negative)
    const radius = 5;
    const startAngle = Math.PI * 1.25; // 225 degrees (back-left)
    const endAngle = Math.PI * 1.75; // 315 degrees (back-right)
    const angleRange = endAngle - startAngle;

    for (let i = 0; i < totalUsers; i++) {
      const angle = startAngle + (i / (totalUsers - 1)) * angleRange;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const position = new THREE.Vector3(x, 0, z);

      const user = this.createUser(i, position);

      // Assign user to server (round-robin)
      const serverIndex = i % this.servers.length;
      this.userServerAssignments.set(user, serverIndex);

      // Create connection line to assigned server
      const connectionLine = this.createConnectionLine(
        position,
        this.servers[serverIndex].position,
        this.colors.user
      );
      this.connectionLines.push({
        line: connectionLine,
        user: user,
        serverIndex: serverIndex,
      });
    }
  }

  createUser(index, position) {
    const userGeometry = new THREE.SphereGeometry(0.4, 20, 20);
    const userMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.user,
      metalness: 0.2,
      roughness: 0.4,
      emissive: this.colors.user,
      emissiveIntensity: 0.05,
    });
    const user = new THREE.Mesh(userGeometry, userMaterial);
    user.position.copy(position);
    user.castShadow = true;
    user.receiveShadow = true;
    this.simulationGroup.add(user);
    this.users.push(user);
    this.allUsers.push(user);

    // Add user glow
    const userGlowGeometry = new THREE.SphereGeometry(0.45, 20, 20);
    const userGlowMaterial = new THREE.MeshBasicMaterial({
      color: this.colors.user,
      transparent: true,
      opacity: 0.15,
    });
    const userGlow = new THREE.Mesh(userGlowGeometry, userGlowMaterial);
    user.add(userGlow);

    // Add user label
    const userLabel = this.createLabel(
      `USER ${index + 1}`,
      position.clone().add(new THREE.Vector3(0, 1.0, 0)),
      this.colors.user
    );
    this.entityLabels.push({ type: "user", index: index, label: userLabel });

    return user;
  }

  clearAllUsers() {
    // Remove all existing users and their connections
    this.allUsers.forEach((user) => {
      this.simulationGroup.remove(user);
    });

    // Clear connection lines
    this.connectionLines.forEach(({ line }) => {
      this.simulationGroup.remove(line);
    });

    // Clear user labels
    this.entityLabels
      .filter((entry) => entry.type === "user")
      .forEach((entry) => {
        this.simulationGroup.remove(entry.label);
      });

    // Clear arrays
    this.users = [];
    this.allUsers = [];
    this.connectionLines = [];
    this.userServerAssignments.clear();
    this.entityLabels = this.entityLabels.filter(
      (entry) => entry.type !== "user"
    );
  }

  createLabel(text, position, color) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 64;

    context.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
    context.font = "Bold 24px Arial";
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

  createConnectionLine(start, end, color) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      linewidth: 3,
    });
    const line = new THREE.Line(geometry, material);
    this.simulationGroup.add(line);

    return line;
  }

  createUI() {
    // Create educational panel with interactive controls
    const panel = document.createElement("div");
    panel.id = "ddos-education-panel";
    panel.innerHTML = `
      <div class="ddos-panel">
        <h2>${this.educationalContent.title}</h2>
        <p>${this.educationalContent.description}</p>
        
        <!-- Educational Content (First) -->
        <div class="education-section">
          <button class="education-toggle" id="education-toggle">📚 Learn About DDoS Attacks (Read First!)</button>
          <div class="education-content" id="education-content" style="display: block;">
            
            <div class="edu-section">
              <h4>${this.educationalContent.whatIsDDoS.title}</h4>
              <ul>
                ${this.educationalContent.whatIsDDoS.content
                  .map((item) => `<li>${item}</li>`)
                  .join("")}
              </ul>
            </div>
            
            <div class="edu-section">
              <h4>${this.educationalContent.howItWorks.title}</h4>
              <ul>
                ${this.educationalContent.howItWorks.content
                  .map((item) => `<li>${item}</li>`)
                  .join("")}
              </ul>
            </div>
            
            <div class="edu-section">
              <h4>${this.educationalContent.defenseStrategies.title}</h4>
              <ul>
                ${this.educationalContent.defenseStrategies.content
                  .map((item) => `<li>${item}</li>`)
                  .join("")}
              </ul>
            </div>
            
            <div class="edu-section">
              <h4>${this.educationalContent.realWorldImpact.title}</h4>
              <ul>
                ${this.educationalContent.realWorldImpact.content
                  .map((item) => `<li>${item}</li>`)
                  .join("")}
              </ul>
            </div>
            
            <div class="edu-section">
              <h4>${this.educationalContent.labInstructions.title}</h4>
              <ul>
                ${this.educationalContent.labInstructions.content
                  .map((item) => `<li>${item}</li>`)
                  .join("")}
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Attack Controls -->
        <div class="control-section">
          <h3>🎮 Attack Controls</h3>
          <div class="control-group">
            <button id="start-attack-btn" class="control-btn start-btn">Start DDoS Attack</button>
            <button id="stop-attack-btn" class="control-btn stop-btn" disabled>Stop Attack</button>
          </div>
          <div class="attack-intensity">
            <label>Attack Intensity: <span id="intensity-value">High</span></label>
            <input type="range" id="attack-intensity" min="1" max="10" value="5">
          </div>
        </div>

        <!-- Defense Controls -->
        <div class="control-section">
          <h3>🛡️ Defense Mechanisms</h3>
          
          <div class="defense-control">
            <label class="checkbox-label">
              <input type="checkbox" id="rate-limit-toggle"> Enable Rate Limiting
            </label>
            <div class="rate-limit-config" id="rate-limit-config" style="display: none;">
              <label>Max Requests/sec: <span id="rate-limit-value">10</span></label>
              <input type="range" id="rate-limit-slider" min="5" max="50" value="10">
            </div>
          </div>
          
          <div class="defense-control">
            <label class="checkbox-label">
              <input type="checkbox" id="load-balancer-toggle"> Enable Load Balancing
            </label>
            <div class="load-balancer-config" id="load-balancer-config" style="display: none;">
              <label>Server Count: <span id="server-count">1</span></label>
              <input type="range" id="server-count-slider" min="1" max="5" value="1">
              <button id="add-server-btn" class="small-btn">Add Server</button>
            </div>
          </div>
                  </div>

          <!-- Server Capacity Control -->
          <div class="defense-control">
            <h4>⚙️ Server Configuration</h4>
            <div class="capacity-config">
              <label for="server-capacity">Server Capacity: <span id="capacity-value-display">10</span> req/s</label>
              <input type="range" id="server-capacity" min="5" max="50" value="10" step="5">
              <small style="color: #aaa;">Higher capacity = more requests before overload</small>
            </div>
          </div>

        <!-- Status Dashboard -->
        <div class="status-section">
          <h3>📊 System Status</h3>
          <div class="status-grid">
            <div class="status-item">
              <label>Server Health:</label>
              <span id="health-value" class="status-value">100%</span>
            </div>
            <div class="status-item">
              <label>Server Load:</label>
              <span id="load-value" class="status-value">0%</span>
            </div>
            <div class="status-item">
              <label>Active Requests:</label>
              <span id="request-value" class="status-value">0</span>
            </div>
            <div class="status-item">
              <label>Blocked Requests:</label>
              <span id="blocked-value" class="status-value">0</span>
            </div>
            <div class="status-item">
              <label>Load Balanced:</label>
              <span id="balanced-value" class="status-value">0</span>
            </div>
            <div class="status-item">
              <label>Server Capacity:</label>
              <span id="capacity-value" class="status-value">10 req/s</span>
            </div>
          </div>
        </div>



        <button id="close-simulation" class="close-btn">Close Lab</button>
      </div>
    `;

    // Add enhanced styles
    const style = document.createElement("style");
    style.textContent = `
      #ddos-education-panel {
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
      
      .ddos-panel h2 {
        color: #ff8800;
        margin-top: 0;
        text-align: center;
        font-size: 18px;
      }
      
      .ddos-panel h3 {
        color: #44aaff;
        margin: 15px 0 10px 0;
        font-size: 16px;
      }
      
      .ddos-panel h4 {
        color: #ffaa44;
        margin: 10px 0 5px 0;
        font-size: 14px;
      }
      
      /* Control Sections */
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
      
      /* Defense Controls */
      .defense-control {
        margin: 15px 0;
        padding: 10px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 5px;
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
      
      .rate-limit-config, .load-balancer-config, .capacity-config {
        margin-top: 10px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
      }
      
      /* Sliders */
      input[type="range"] {
        width: 100%;
        margin: 5px 0;
        height: 6px;
        border-radius: 3px;
        background: #333;
        outline: none;
      }
      
      input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #44aaff;
        cursor: pointer;
      }
      
      .attack-intensity {
        margin: 10px 0;
      }
      
      /* Status Dashboard */
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
      
      /* Educational Content */
      .education-toggle {
        width: 100%;
        background: rgba(255, 136, 0, 0.2);
        color: #ff8800;
        border: 1px solid rgba(255, 136, 0, 0.5);
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
      }
      
      .education-toggle:hover {
        background: rgba(255, 136, 0, 0.3);
      }
      
      .education-content {
        margin-top: 10px;
      }
      
      .edu-section {
        margin: 15px 0;
        padding: 10px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 5px;
      }
      
      .edu-section ul {
        margin: 5px 0;
        padding-left: 20px;
      }
      
      .edu-section li {
        margin: 5px 0;
        line-height: 1.4;
        font-size: 13px;
      }
      
      .small-btn {
        background: #44aaff;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
        margin-top: 5px;
      }
      
      .small-btn:hover {
        background: #66ccff;
      }
      
      .close-btn {
        background: #ff4444;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        margin-top: 20px;
        width: 100%;
        transition: all 0.2s;
      }
      
      .close-btn:hover {
        background: #ff6666;
        transform: translateY(-1px);
      }
      
      /* Scrollbar styling */
      #ddos-education-panel::-webkit-scrollbar {
        width: 8px;
      }
      
      #ddos-education-panel::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }
      
      #ddos-education-panel::-webkit-scrollbar-thumb {
        background: rgba(255, 136, 0, 0.5);
        border-radius: 4px;
      }
      
      #ddos-education-panel::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 136, 0, 0.7);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(panel);

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Attack controls
    document
      .getElementById("start-attack-btn")
      .addEventListener("click", () => {
        this.startDDoSAttack();
        document.getElementById("start-attack-btn").disabled = true;
        document.getElementById("stop-attack-btn").disabled = false;
      });

    document.getElementById("stop-attack-btn").addEventListener("click", () => {
      this.stopDDoSAttack();
      document.getElementById("start-attack-btn").disabled = false;
      document.getElementById("stop-attack-btn").disabled = true;
    });

    // Attack intensity slider
    document
      .getElementById("attack-intensity")
      .addEventListener("input", (e) => {
        const value = parseInt(e.target.value);
        const intensityText = [
          "Very Low",
          "Low",
          "Low-Med",
          "Medium",
          "Med-High",
          "High",
          "Very High",
          "Extreme",
          "Maximum",
          "Overwhelming",
        ][value - 1];
        document.getElementById("intensity-value").textContent = intensityText;
        this.attackIntensity = value;
      });

    // Rate limiting controls
    document
      .getElementById("rate-limit-toggle")
      .addEventListener("change", (e) => {
        this.rateLimitEnabled = e.target.checked;
        document.getElementById("rate-limit-config").style.display = e.target
          .checked
          ? "block"
          : "none";
      });

    document
      .getElementById("rate-limit-slider")
      .addEventListener("input", (e) => {
        this.rateLimitThreshold = parseInt(e.target.value);
        document.getElementById("rate-limit-value").textContent =
          e.target.value;
      });

    // Load balancing controls
    document
      .getElementById("load-balancer-toggle")
      .addEventListener("change", (e) => {
        this.loadBalancingEnabled = e.target.checked;
        document.getElementById("load-balancer-config").style.display = e.target
          .checked
          ? "block"
          : "none";
        // Note: User must manually adjust server count for load balancing to be effective
      });

    document
      .getElementById("server-count-slider")
      .addEventListener("input", (e) => {
        const targetCount = parseInt(e.target.value);
        document.getElementById("server-count").textContent = targetCount;
        this.adjustServerCount(targetCount);
      });

    document.getElementById("add-server-btn").addEventListener("click", () => {
      this.addServer();
      const currentCount = this.servers.length;
      document.getElementById("server-count").textContent = currentCount;
      document.getElementById("server-count-slider").value = currentCount;
    });

    // Server capacity slider
    document
      .getElementById("server-capacity")
      .addEventListener("input", (e) => {
        const capacity = parseInt(e.target.value);
        document.getElementById("capacity-value-display").textContent =
          capacity;
        // Update all servers with new capacity
        this.servers.forEach((server) => {
          server.userData.maxCapacity = capacity;
        });
      });

    // Educational content toggle
    document
      .getElementById("education-toggle")
      .addEventListener("click", () => {
        const content = document.getElementById("education-content");
        const isVisible = content.style.display !== "none";
        content.style.display = isVisible ? "none" : "block";
        document.getElementById("education-toggle").textContent = isVisible
          ? "📚 Learn More About DDoS"
          : "📚 Hide Educational Content";
      });

    // Close button
    document
      .getElementById("close-simulation")
      .addEventListener("click", () => {
        this.close();
      });
  }

  startSimulation() {
    this.isRunning = true;
    this.animate();
    this.attackIntensity = 5;
    this.blockedRequests = 0;
    this.balancedRequests = 0;

    // Start normal user traffic
    this.startNormalTraffic();

    // Don't auto-start attack - let user control it
    console.log(
      "DDoS Lab ready! Use controls to start attack and enable defenses."
    );
  }

  startNormalTraffic() {
    const sendNormalRequest = () => {
      if (!this.isRunning) return;

      // Random user sends request to their assigned server
      const user =
        this.allUsers[Math.floor(Math.random() * this.allUsers.length)];
      const assignedServerIndex = this.userServerAssignments.get(user);

      // Only send if the assigned server still exists
      if (assignedServerIndex < this.servers.length) {
        this.sendRequestToSpecificServer(
          user.position,
          this.colors.requests.normal,
          false,
          assignedServerIndex
        );
      }

      // Schedule next request
      setTimeout(sendNormalRequest, 1000 + Math.random() * 2000);
    };

    sendNormalRequest();
  }

  startDDoSAttack() {
    if (!this.isRunning) return;

    this.attackStarted = true;

    // Show attacker
    this.attacker.visible = true;

    // Add attacker label only if not already added
    const existingAttackerLabel = this.entityLabels.find(
      (entry) => entry.type === "attacker"
    );
    if (!existingAttackerLabel) {
      const attackerLabel = this.createLabel(
        "ATTACKER",
        this.attacker.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
        this.colors.attacker
      );
      this.entityLabels.push({
        type: "attacker",
        index: 0,
        label: attackerLabel,
      });
    }

    // Create connection lines to all servers
    this.updateAttackerConnections();

    // Start flooding with requests based on intensity
    const floodServer = () => {
      if (!this.isRunning || !this.attackStarted) return;

      // Send multiple requests rapidly based on attack intensity
      const requestCount = this.attackIntensity;
      const requestDelay = Math.max(20, 200 - this.attackIntensity * 15);

      for (let i = 0; i < requestCount; i++) {
        setTimeout(() => {
          this.sendRequest(
            this.attacker.position,
            this.colors.requests.attack,
            true
          );
        }, i * 30);
      }

      // Continue flooding with intensity-based timing
      setTimeout(floodServer, requestDelay);
    };

    floodServer();
  }

  stopDDoSAttack() {
    this.attackStarted = false;
    console.log("DDoS attack stopped by user.");
  }

  addServer() {
    if (this.servers.length >= 5) return;

    // Create new server using systematic positioning
    const newServer = this.createServer(this.servers.length);

    // Reposition all servers to maintain centered layout
    this.repositionAllServers();

    // Recreate all users with proper distribution
    this.createUsersForCurrentServers();

    // Update attacker connections if visible
    this.updateAttackerConnections();

    console.log(`Added server ${this.servers.length}. Load balancing active.`);
  }

  repositionAllServers() {
    // LAYOUT SCHEME: Keep servers centered on X-axis, always at Z=0
    const totalServers = this.servers.length;
    const serverSpacing = 2.5;
    const startX = -((totalServers - 1) * serverSpacing) / 2;

    this.servers.forEach((server, index) => {
      const newX = startX + index * serverSpacing;
      server.position.set(newX, 0, 0); // Always Z=0

      // Update server label position
      const labelEntry = this.entityLabels.find(
        (entry) => entry.type === "server" && entry.index === index
      );
      if (labelEntry) {
        labelEntry.label.position.copy(
          server.position.clone().add(new THREE.Vector3(0, 1.8, 0))
        );
      }
    });
  }

  updateAttackerConnections() {
    // Clean approach: Store attacker connection lines for proper cleanup
    if (this.attackerConnectionLines) {
      this.attackerConnectionLines.forEach((line) => {
        this.simulationGroup.remove(line);
      });
    }
    this.attackerConnectionLines = [];

    // Create new connections to all servers if attacker is visible
    if (this.attacker.visible) {
      this.servers.forEach((server) => {
        const connectionLine = this.createConnectionLine(
          this.attacker.position,
          server.position,
          this.colors.attacker
        );
        this.attackerConnectionLines.push(connectionLine);
      });
    }
  }

  adjustServerCount(targetCount) {
    while (this.servers.length < targetCount && this.servers.length < 5) {
      this.addServer();
    }
    while (this.servers.length > targetCount && this.servers.length > 1) {
      this.removeServer();
    }
  }

  removeServer() {
    if (this.servers.length <= 1) return;

    const serverIndex = this.servers.length - 1;
    const serverToRemove = this.servers.pop();

    // Remove server from scene
    this.simulationGroup.remove(serverToRemove);

    // Remove server label
    const serverLabelIndex = this.entityLabels.findIndex(
      (entry) => entry.type === "server" && entry.index === serverIndex
    );
    if (serverLabelIndex !== -1) {
      const labelEntry = this.entityLabels[serverLabelIndex];
      this.simulationGroup.remove(labelEntry.label);
      this.entityLabels.splice(serverLabelIndex, 1);
    }

    // Reposition remaining servers to maintain centered layout
    this.repositionAllServers();

    // Recreate all users with proper distribution (this handles everything cleanly)
    this.createUsersForCurrentServers();

    // Update attacker connections
    this.updateAttackerConnections();

    console.log(`Removed server. ${this.servers.length} servers remaining.`);
  }

  checkRateLimit(sourcePosition) {
    if (!this.rateLimitEnabled) return true;

    const sourceKey = `${sourcePosition.x}_${sourcePosition.z}`;
    const now = Date.now();
    const lastTime = this.lastRequestTime.get(sourceKey) || 0;
    const timeDiff = now - lastTime;

    if (timeDiff < 1000 / this.rateLimitThreshold) {
      this.blockedRequests++;
      return false; // Rate limited
    }

    this.lastRequestTime.set(sourceKey, now);
    return true;
  }

  getTargetServer() {
    if (!this.loadBalancingEnabled || this.servers.length === 1) {
      return this.servers[0];
    }

    // Round-robin load balancing
    const server = this.servers[this.currentServerIndex];
    this.currentServerIndex =
      (this.currentServerIndex + 1) % this.servers.length;
    this.balancedRequests++;
    return server;
  }

  sendRequestToSpecificServer(
    fromPosition,
    color,
    isAttack = false,
    serverIndex = null
  ) {
    // Check rate limiting
    if (!this.checkRateLimit(fromPosition)) {
      // Request blocked by rate limiting
      this.showBlockedRequest(fromPosition);
      this.updateUI();
      return;
    }

    // Get target server (specific server or load balanced)
    const targetServer =
      serverIndex !== null ? this.servers[serverIndex] : this.getTargetServer();

    this.createAndSendRequest(fromPosition, color, isAttack, targetServer);
  }

  sendRequest(fromPosition, color, isAttack = false) {
    // Check rate limiting
    if (!this.checkRateLimit(fromPosition)) {
      // Request blocked by rate limiting
      this.showBlockedRequest(fromPosition);
      this.updateUI();
      return;
    }

    // Get target server (load balancing)
    const targetServer = this.getTargetServer();

    this.createAndSendRequest(fromPosition, color, isAttack, targetServer);
  }

  createAndSendRequest(fromPosition, color, isAttack, targetServer) {
    const requestGeometry = new THREE.SphereGeometry(0.12, 12, 12);
    const requestMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.2,
    });
    const request = new THREE.Mesh(requestGeometry, requestMaterial);
    request.position.copy(fromPosition);
    request.castShadow = true;

    const requestData = {
      id: this.requestId++,
      mesh: request,
      targetPosition: targetServer.position.clone(),
      targetServer: targetServer,
      sourcePosition: fromPosition.clone(), // Store where request came from
      speed: 2,
      isAttack: isAttack,
      color: color,
    };

    this.requests.push(requestData);
    this.simulationGroup.add(request);

    // Update target server load and health based on capacity
    this.updateServerLoad(targetServer, isAttack);

    this.updateAllServersAppearance();
    this.updateUI();
  }

  showBlockedRequest(fromPosition) {
    // Show a red X to indicate blocked request
    const blockedGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const blockedMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    });
    const blocked = new THREE.Mesh(blockedGeometry, blockedMaterial);
    blocked.position.copy(fromPosition);
    blocked.position.y += 0.5;
    this.simulationGroup.add(blocked);

    // Remove after short time
    setTimeout(() => {
      this.simulationGroup.remove(blocked);
    }, 500);
  }

  sendResponse(fromServer, toPosition, color) {
    const responseGeometry = new THREE.SphereGeometry(0.1, 12, 12);
    const responseMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.2,
      metalness: 0.1,
      roughness: 0.3,
    });
    const response = new THREE.Mesh(responseGeometry, responseMaterial);
    response.position.copy(fromServer.position);
    response.castShadow = true;

    const responseData = {
      id: this.responseId++,
      mesh: response,
      targetPosition: toPosition.clone(),
      speed: 2,
      color: color,
    };

    this.responses.push(responseData);
    this.simulationGroup.add(response);
  }

  updateServerLoad(server, isAttack) {
    const now = Date.now();

    // Reset load counter every second
    if (now - server.userData.lastLoadReset >= 1000) {
      server.userData.currentLoad = 0;
      server.userData.lastLoadReset = now;
    }

    // Increment current load
    server.userData.currentLoad++;
    server.userData.requestCount++;

    // Calculate load percentage
    const loadPercentage =
      server.userData.currentLoad / server.userData.maxCapacity;

    // Update health based on load capacity
    if (loadPercentage <= 1.0) {
      // Server can handle the load - maintain or improve health
      if (server.userData.health < 1.0) {
        server.userData.health = Math.min(1.0, server.userData.health + 0.01);
      }
    } else if (loadPercentage <= 1.5) {
      // Server is overloaded but managing - slight degradation
      server.userData.health = Math.max(0.3, server.userData.health - 0.02);
    } else {
      // Server is severely overloaded - significant degradation
      server.userData.health = Math.max(0.0, server.userData.health - 0.05);
    }

    // Store load percentage for UI display
    server.userData.loadPercentage = Math.round(loadPercentage * 100);
  }

  updateServerAppearance(server) {
    const health = server.userData.health;
    const loadPercentage = server.userData.loadPercentage || 0;

    // Determine server state based on both health and current load
    let serverState;
    if (loadPercentage <= 100 && health > 0.7) {
      serverState = "healthy";
    } else if (loadPercentage <= 150 && health > 0.3) {
      serverState = "warning";
    } else {
      serverState = "critical";
    }

    if (serverState === "healthy") {
      // Healthy - Blue color, normal operation
      server.material.color.setHex(this.colors.server.healthy);
      server.material.emissive.setHex(this.colors.server.healthy);
      server.material.emissiveIntensity = 0.1;
      server.material.opacity = 1.0;

      // Update glow effect
      if (server.children[0]) {
        server.children[0].material.color.setHex(this.colors.server.healthy);
        server.children[0].material.opacity = 0.2;
      }
    } else if (serverState === "warning") {
      // Warning - Orange color, handling load but stressed
      server.material.color.setHex(this.colors.server.warning);
      server.material.emissive.setHex(this.colors.server.warning);
      server.material.emissiveIntensity = 0.2;
      server.material.opacity = 1.0;

      // Update glow effect
      if (server.children[0]) {
        server.children[0].material.color.setHex(this.colors.server.warning);
        server.children[0].material.opacity = 0.3;
      }
    } else {
      // Critical - Red color with flashing, overloaded
      server.material.color.setHex(this.colors.server.critical);
      server.material.emissive.setHex(this.colors.server.critical);
      server.material.emissiveIntensity = 0.4;

      // Make server flash when overloaded
      const flash = Math.sin(Date.now() * 0.02) * 0.4 + 0.6;
      server.material.opacity = flash;

      // Update glow effect with flashing
      if (server.children[0]) {
        server.children[0].material.color.setHex(this.colors.server.critical);
        server.children[0].material.opacity = flash * 0.5;
      }
    }

    // Force material update
    server.material.needsUpdate = true;
    if (server.children[0]) {
      server.children[0].material.needsUpdate = true;
    }
  }

  updateAllServersAppearance() {
    this.servers.forEach((server) => {
      this.updateServerAppearance(server);
    });

    // Update main server health for backward compatibility
    this.serverHealth = this.servers[0].userData.health;
  }

  updateUI() {
    const healthElement = document.getElementById("health-value");
    const loadElement = document.getElementById("load-value");
    const requestElement = document.getElementById("request-value");
    const blockedElement = document.getElementById("blocked-value");
    const balancedElement = document.getElementById("balanced-value");
    const capacityElement = document.getElementById("capacity-value");

    if (healthElement) {
      // Calculate average server health
      const avgHealth =
        this.servers.reduce((sum, server) => sum + server.userData.health, 0) /
        this.servers.length;
      const healthPercent = Math.round(avgHealth * 100);
      healthElement.textContent = `${healthPercent}%`;

      if (healthPercent > 70) {
        healthElement.style.color = "#44ff44";
      } else if (healthPercent > 30) {
        healthElement.style.color = "#ffaa44";
      } else {
        healthElement.style.color = "#ff4444";
      }
    }

    if (loadElement) {
      // Calculate average server load
      const avgLoad =
        this.servers.reduce(
          (sum, server) => sum + (server.userData.loadPercentage || 0),
          0
        ) / this.servers.length;
      const loadPercent = Math.round(avgLoad);
      loadElement.textContent = `${loadPercent}%`;

      if (loadPercent <= 100) {
        loadElement.style.color = "#44ff44";
      } else if (loadPercent <= 150) {
        loadElement.style.color = "#ffaa44";
      } else {
        loadElement.style.color = "#ff4444";
      }
    }

    if (requestElement) {
      requestElement.textContent = this.requests.length.toString();
    }

    if (blockedElement) {
      blockedElement.textContent = this.blockedRequests.toString();
      blockedElement.style.color =
        this.blockedRequests > 0 ? "#ff4444" : "#44ff44";
    }

    if (balancedElement) {
      balancedElement.textContent = this.balancedRequests.toString();
      balancedElement.style.color =
        this.balancedRequests > 0 ? "#44aaff" : "#888";
    }

    if (capacityElement && this.servers.length > 0) {
      const capacity = this.servers[0].userData.maxCapacity;
      capacityElement.textContent = `${capacity} req/s`;
    }
  }

  animate() {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.animate());

    // Update controls for smooth camera movement
    if (this.controls) {
      this.controls.update();
    }

    // Add subtle rotation animations to entities
    if (this.server) {
      this.server.rotation.y += 0.005;
    }

    this.users.forEach((user, index) => {
      user.rotation.y += 0.01 + index * 0.002;
    });

    if (this.attacker && this.attacker.visible) {
      this.attacker.rotation.y -= 0.02;
      this.attacker.rotation.x = Math.sin(Date.now() * 0.003) * 0.1;
    }

    // Update server appearance every frame for smooth transitions
    this.updateAllServersAppearance();

    // Update requests
    this.requests = this.requests.filter((request) => {
      const direction = new THREE.Vector3()
        .subVectors(request.targetPosition, request.mesh.position)
        .normalize();

      request.mesh.position.add(
        direction.multiplyScalar(request.speed * 0.016)
      );

      // Check if request reached server
      if (request.mesh.position.distanceTo(request.targetPosition) < 0.2) {
        this.simulationGroup.remove(request.mesh);

        // Send response if the specific target server is healthy enough
        const targetServerHealth = request.targetServer.userData.health;
        if (targetServerHealth > 0.1) {
          let responseColor;
          if (request.isAttack) {
            responseColor = this.colors.responses.failed;
          } else if (targetServerHealth > 0.5) {
            responseColor = this.colors.responses.normal;
          } else {
            responseColor = this.colors.responses.delayed;
          }

          // Send response back to the exact source position
          const responseTarget = request.sourcePosition;

          setTimeout(() => {
            this.sendResponse(
              request.targetServer,
              responseTarget,
              responseColor
            );
          }, 500 + Math.random() * 1000);
        }

        return false;
      }

      return true;
    });

    // Update responses
    this.responses = this.responses.filter((response) => {
      const direction = new THREE.Vector3()
        .subVectors(response.targetPosition, response.mesh.position)
        .normalize();

      response.mesh.position.add(
        direction.multiplyScalar(response.speed * 0.016)
      );

      // Check if response reached target
      if (response.mesh.position.distanceTo(response.targetPosition) < 0.2) {
        this.simulationGroup.remove(response.mesh);
        return false;
      }

      return true;
    });

    this.renderer.render(this.scene, this.camera);
  }

  close() {
    this.isRunning = false;

    // Clean up tracking arrays
    this.allUsers = [];
    this.connectionLines = [];
    this.entityLabels = [];
    this.userServerAssignments.clear();
    this.attackerConnectionLines = [];

    // Remove UI
    const panel = document.getElementById("ddos-education-panel");
    if (panel) {
      panel.remove();
    }

    // Remove renderer from DOM
    if (this.renderer && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Cleanup
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Dispatch close event
    window.dispatchEvent(new CustomEvent("ddosSimulationClosed"));
  }

  handleResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
}
