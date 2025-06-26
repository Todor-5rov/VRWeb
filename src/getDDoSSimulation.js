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

    // Educational content
    this.educationalContent = {
      title: "DDoS Attack Simulation",
      description:
        "A Distributed Denial of Service (DDoS) attack overwhelms a server with massive amounts of traffic from multiple sources, making it unavailable to legitimate users.",
      prevention: [
        "Use DDoS protection services (Cloudflare, AWS Shield)",
        "Implement rate limiting and traffic filtering",
        "Use load balancers to distribute traffic",
        "Monitor network traffic for anomalies",
        "Have incident response plans ready",
      ],
      howItWorks: [
        "Attacker controls a botnet of compromised devices",
        "All devices send requests simultaneously to target server",
        "Server becomes overwhelmed and cannot respond to legitimate users",
        "Service becomes unavailable or extremely slow",
      ],
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
    // Create enhanced server (cylinder with better materials)
    const serverGeometry = new THREE.CylinderGeometry(0.6, 0.7, 2.0, 12);
    const serverMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.server.healthy,
      metalness: 0.7,
      roughness: 0.3,
      emissive: this.colors.server.healthy,
      emissiveIntensity: 0.1,
      transparent: false,
    });
    this.server = new THREE.Mesh(serverGeometry, serverMaterial);
    this.server.position.set(0, 0, 0);
    this.server.castShadow = true;
    this.server.receiveShadow = true;
    this.simulationGroup.add(this.server);

    // Add server glow effect
    const serverGlowGeometry = new THREE.CylinderGeometry(0.65, 0.75, 2.1, 12);
    const serverGlowMaterial = new THREE.MeshBasicMaterial({
      color: this.colors.server.healthy,
      transparent: true,
      opacity: 0.2,
    });
    const serverGlow = new THREE.Mesh(serverGlowGeometry, serverGlowMaterial);
    this.server.add(serverGlow);

    // Add server label with enhanced visibility
    this.createLabel(
      "SERVER",
      this.server.position.clone().add(new THREE.Vector3(0, 1.8, 0)),
      0xffffff
    );

    // Create enhanced legitimate users
    const userPositions = [
      new THREE.Vector3(-5, 0, -3),
      new THREE.Vector3(-5, 0, 3),
    ];

    userPositions.forEach((position, index) => {
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
      this.createLabel(
        `USER ${index + 1}`,
        position.clone().add(new THREE.Vector3(0, 1.0, 0)),
        this.colors.user
      );

      // Create enhanced connection line to server
      this.createConnectionLine(
        position,
        this.server.position,
        this.colors.user
      );
    });

    // Create enhanced attacker - initially hidden
    const attackerGeometry = new THREE.SphereGeometry(0.5, 20, 20);
    const attackerMaterial = new THREE.MeshStandardMaterial({
      color: this.colors.attacker,
      metalness: 0.8,
      roughness: 0.2,
      emissive: this.colors.attacker,
      emissiveIntensity: 0.2,
    });
    this.attacker = new THREE.Mesh(attackerGeometry, attackerMaterial);
    this.attacker.position.set(5, 0, 0);
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
    const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.1, 32);
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
  }

  createUI() {
    // Create educational panel
    const panel = document.createElement("div");
    panel.id = "ddos-education-panel";
    panel.innerHTML = `
      <div class="ddos-panel">
        <h2>${this.educationalContent.title}</h2>
        <p>${this.educationalContent.description}</p>
        
        <div class="ddos-section">
          <h3>How DDoS Attacks Work:</h3>
          <ul>
            ${this.educationalContent.howItWorks
              .map((item) => `<li>${item}</li>`)
              .join("")}
          </ul>
        </div>
        
        <div class="ddos-section">
          <h3>Prevention Methods:</h3>
          <ul>
            ${this.educationalContent.prevention
              .map((item) => `<li>${item}</li>`)
              .join("")}
          </ul>
        </div>
        
        <div class="simulation-status">
          <h3>Simulation Status:</h3>
          <div id="server-health">Server Health: <span id="health-value">100%</span></div>
          <div id="request-count">Active Requests: <span id="request-value">0</span></div>
        </div>
        
        <button id="close-simulation" class="close-btn">Close Simulation</button>
      </div>
    `;

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      #ddos-education-panel {
        position: fixed;
        top: 20px;
        left: 20px;
        width: 400px;
        max-height: 80vh;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        overflow-y: auto;
        font-family: Arial, sans-serif;
      }
      
      .ddos-panel h2 {
        color: #ff8800;
        margin-top: 0;
      }
      
      .ddos-panel h3 {
        color: #44aaff;
        margin-bottom: 10px;
      }
      
      .ddos-section {
        margin: 20px 0;
      }
      
      .ddos-section ul {
        margin: 10px 0;
        padding-left: 20px;
      }
      
      .ddos-section li {
        margin: 5px 0;
        line-height: 1.4;
      }
      
      .simulation-status {
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
      }
      
      #server-health {
        margin: 10px 0;
      }
      
      #health-value {
        font-weight: bold;
        color: #44ff44;
      }
      
      #request-value {
        font-weight: bold;
        color: #ffaa44;
      }
      
      .close-btn {
        background: #ff4444;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        margin-top: 20px;
      }
      
      .close-btn:hover {
        background: #ff6666;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(panel);

    // Add close button handler
    document
      .getElementById("close-simulation")
      .addEventListener("click", () => {
        this.close();
      });
  }

  startSimulation() {
    this.isRunning = true;
    this.animate();

    // Start normal user traffic
    this.startNormalTraffic();

    // Start DDoS attack after 3 seconds
    setTimeout(() => {
      this.startDDoSAttack();
    }, 3000);
  }

  startNormalTraffic() {
    const sendNormalRequest = () => {
      if (!this.isRunning) return;

      // Random user sends request
      const user = this.users[Math.floor(Math.random() * this.users.length)];
      this.sendRequest(user.position, this.colors.requests.normal, false);

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
    this.createLabel(
      "ATTACKER",
      this.attacker.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
      this.colors.attacker
    );
    this.createConnectionLine(
      this.attacker.position,
      this.server.position,
      this.colors.attacker
    );

    // Start flooding with requests
    const floodServer = () => {
      if (!this.isRunning) return;

      // Send multiple requests rapidly
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.sendRequest(
            this.attacker.position,
            this.colors.requests.attack,
            true
          );
        }, i * 50);
      }

      // Continue flooding
      setTimeout(floodServer, 200);
    };

    floodServer();
  }

  sendRequest(fromPosition, color, isAttack = false) {
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
      targetPosition: this.server.position.clone(),
      speed: 2,
      isAttack: isAttack,
      color: color,
    };

    this.requests.push(requestData);
    this.simulationGroup.add(request);

    // Update server health
    if (isAttack) {
      this.serverHealth = Math.max(0, this.serverHealth - 0.02);
    }

    this.updateServerAppearance();
    this.updateUI();
  }

  sendResponse(toPosition, color) {
    const responseGeometry = new THREE.SphereGeometry(0.1, 12, 12);
    const responseMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.2,
      metalness: 0.1,
      roughness: 0.3,
    });
    const response = new THREE.Mesh(responseGeometry, responseMaterial);
    response.position.copy(this.server.position);
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

  updateServerAppearance() {
    if (this.serverHealth > 0.7) {
      this.server.material.color.setHex(this.colors.server.healthy);
      this.server.material.emissive.setHex(this.colors.server.healthy);
      this.server.material.emissiveIntensity = 0.1;
      this.server.material.opacity = 1.0;
    } else if (this.serverHealth > 0.3) {
      this.server.material.color.setHex(this.colors.server.warning);
      this.server.material.emissive.setHex(this.colors.server.warning);
      this.server.material.emissiveIntensity = 0.15;
      this.server.material.opacity = 1.0;
    } else {
      this.server.material.color.setHex(this.colors.server.critical);
      this.server.material.emissive.setHex(this.colors.server.critical);
      this.server.material.emissiveIntensity = 0.3;
      // Make server flash when overloaded
      const flash = Math.sin(Date.now() * 0.015) * 0.3 + 0.7;
      this.server.material.opacity = flash;
    }
  }

  updateUI() {
    const healthElement = document.getElementById("health-value");
    const requestElement = document.getElementById("request-value");

    if (healthElement) {
      const healthPercent = Math.round(this.serverHealth * 100);
      healthElement.textContent = `${healthPercent}%`;

      if (healthPercent > 70) {
        healthElement.style.color = "#44ff44";
      } else if (healthPercent > 30) {
        healthElement.style.color = "#ffaa44";
      } else {
        healthElement.style.color = "#ff4444";
      }
    }

    if (requestElement) {
      requestElement.textContent = this.requests.length.toString();
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

        // Send response if server is healthy enough
        if (this.serverHealth > 0.1) {
          let responseColor;
          if (request.isAttack) {
            responseColor = this.colors.responses.failed;
          } else if (this.serverHealth > 0.5) {
            responseColor = this.colors.responses.normal;
          } else {
            responseColor = this.colors.responses.delayed;
          }

          // Find original position to send response back to
          let responseTarget;
          if (request.isAttack) {
            responseTarget = this.attacker.position;
          } else {
            // Find closest user
            responseTarget = this.users[0].position;
            let minDist = request.mesh.position.distanceTo(
              this.users[0].position
            );
            this.users.forEach((user) => {
              const dist = request.mesh.position.distanceTo(user.position);
              if (dist < minDist) {
                minDist = dist;
                responseTarget = user.position;
              }
            });
          }

          setTimeout(() => {
            this.sendResponse(responseTarget, responseColor);
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
