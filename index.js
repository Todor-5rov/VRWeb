import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";
import {
  locations,
  createLocationMarker,
  animateLocationMarker,
} from "./src/getLocationMarker.js";
import { CyberAttackSystem } from "./src/getCyberAttackLines.js";
import { DDoSSimulation } from "./src/getDDoSSimulation.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
scene.add(earthGroup);
new OrbitControls(camera, renderer.domElement);
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load("./textures/05_earthcloudmaptrans.jpg"),
  // alphaTest: 0.3,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

// Create location markers for all cities
const locationMarkers = [];
locations.forEach((location) => {
  const marker = createLocationMarker(location, 1.015); // Slightly above the Earth surface
  earthGroup.add(marker);
  locationMarkers.push(marker);
});

// Initialize cyber attack system
const cyberAttackSystem = new CyberAttackSystem(1.015);
cyberAttackSystem.init(earthGroup, locations);

const stars = getStarfield({ numStars: 2000 });
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

function animate() {
  requestAnimationFrame(animate);

  // Rotate the entire Earth group instead of individual components
  earthGroup.rotation.y += 0.002;

  // Clouds rotate slightly faster for realistic effect
  cloudsMesh.rotation.y += 0.0003; // Additional rotation for clouds

  stars.rotation.y -= 0.0002;

  // Animate location markers (no need to rotate them individually now)
  locationMarkers.forEach((marker) => {
    animateLocationMarker(marker);
  });

  // Update cyber attack system
  cyberAttackSystem.update();

  renderer.render(scene, camera);
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);

// Add keyboard controls for manual attack triggering
function handleKeyPress(event) {
  switch (event.key.toLowerCase()) {
    case "a":
      // Trigger a random attack
      cyberAttackSystem.startRandomAttack();
      break;
    case "n":
      // Trigger attack from New York to Tokyo
      cyberAttackSystem.triggerAttack("New York", "Tokyo");
      break;
    case "l":
      // Trigger attack from London to Beijing
      cyberAttackSystem.triggerAttack("London", "Beijing");
      break;
    case "s":
      // Trigger attack from Sydney to Moscow
      cyberAttackSystem.triggerAttack("Sydney", "Moscow");
      break;
    case "d":
      // Trigger a DDoS attack specifically
      cyberAttackSystem.triggerDDoSAttack();
      break;
  }
}
window.addEventListener("keydown", handleKeyPress, false);

// Add instructions to console
console.log("Cyber Attack Controls:");
console.log("Press 'A' - Trigger random attack");
console.log("Press 'D' - Trigger DDoS attack");
console.log("Press 'N' - New York → Tokyo");
console.log("Press 'L' - London → Beijing");
console.log("Press 'S' - Sydney → Moscow");

// Attack Log UI Management
class AttackLogUI {
  constructor(cyberAttackSystem) {
    this.attackList = document.getElementById("attackList");
    this.cyberAttackSystem = cyberAttackSystem;
    this.currentSelectedAttack = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener("cyberAttackLogged", (event) => {
      this.addAttackToLog(event.detail);
    });

    window.addEventListener("cyberAttackCompleted", (event) => {
      this.updateAttackStatus(event.detail);
    });
  }

  addAttackToLog(attack) {
    // Remove the "monitoring" message if it exists
    const monitoring = this.attackList.querySelector('[style*="color: #888"]');
    if (monitoring) {
      monitoring.remove();
    }

    const attackElement = document.createElement("div");
    attackElement.className = `attack-entry active clickable ${attack.crimeType
      .toLowerCase()
      .replace(" ", "-")}`;
    attackElement.id = `attack-${attack.id}`;

    const timeStr = attack.timestamp.toLocaleTimeString();

    // Find the attack type details
    const attackType = this.cyberAttackSystem.cyberCrimeTypes.find(
      (type) => type.name === attack.crimeType
    );

    // Debug logging
    console.log("📝 addAttackToLog - attack.crimeType:", attack.crimeType);
    console.log("📝 addAttackToLog - found attackType:", attackType);
    console.log(
      "📝 Available crime types:",
      this.cyberAttackSystem.cyberCrimeTypes.map((t) => t.name)
    );

    attackElement.innerHTML = `
      <div class="attack-route">${attack.from} → ${attack.to}</div>
      <div class="attack-type">${attackType?.icon || "⚠️"} ${
      attack.crimeType
    }</div>
      <div class="attack-meta">
        ${timeStr} • Status: <span class="status">Active</span>
      </div>
    `;

    // Add click handler for DDoS attacks
    attackElement.addEventListener("click", () => {
      console.log("Attack clicked:", attack);

      // Check if this is a DDoS attack
      if (attack.crimeType === "DDoS Attack") {
        this.launchDDoSSimulation();
      }
    });

    // Add to the top of the list
    this.attackList.insertBefore(attackElement, this.attackList.firstChild);

    // Keep only last 20 entries in UI
    const entries = this.attackList.querySelectorAll(".attack-entry");
    if (entries.length > 20) {
      entries[entries.length - 1].remove();
    }
  }

  updateAttackStatus(attack) {
    const attackElement = document.getElementById(`attack-${attack.id}`);
    if (attackElement) {
      attackElement.classList.remove("active");
      attackElement.classList.add("completed");

      const statusSpan = attackElement.querySelector(".status");
      if (statusSpan) {
        statusSpan.textContent = "Completed";
        statusSpan.style.color = "#4ade80";
      }
    }
  }

  launchDDoSSimulation() {
    // Hide the main earth visualization
    document.body.style.overflow = "hidden";
    const earthCanvas = document.querySelector("canvas");
    if (earthCanvas) {
      earthCanvas.style.display = "none";
    }

    // Hide UI panels
    const instructions = document.getElementById("instructions");
    const attackLog = document.getElementById("attackLog");
    if (instructions) instructions.style.display = "none";
    if (attackLog) attackLog.style.display = "none";

    // Create and start DDoS simulation
    const ddosSimulation = new DDoSSimulation();
    const simulationCanvas = ddosSimulation.init();
    document.body.appendChild(simulationCanvas);
    ddosSimulation.startSimulation();

    // Handle simulation close
    window.addEventListener(
      "ddosSimulationClosed",
      () => {
        // Restore main visualization
        if (earthCanvas) {
          earthCanvas.style.display = "block";
        }
        if (instructions) instructions.style.display = "block";
        if (attackLog) attackLog.style.display = "block";
        document.body.style.overflow = "auto";
      },
      { once: true }
    );

    // Handle window resize for simulation
    const handleResize = () => ddosSimulation.handleResize();
    window.addEventListener("resize", handleResize);

    window.addEventListener(
      "ddosSimulationClosed",
      () => {
        window.removeEventListener("resize", handleResize);
      },
      { once: true }
    );
  }
}

// Initialize attack log UI
const attackLogUI = new AttackLogUI(cyberAttackSystem);
