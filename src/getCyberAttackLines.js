import * as THREE from "three";
import { latLngToVector3 } from "./getLocationMarker.js";

/**
 * Create curved attack lines between cities with animated particles
 */
export class CyberAttackSystem {
  constructor(earthRadius = 1) {
    this.earthRadius = earthRadius;
    this.activeAttacks = [];
    this.earthGroup = null;
    this.attackGroup = new THREE.Group();
    this.attackHistory = [];
    this.cyberCrimeTypes = [
      {
        id: "ransomware",
        name: "Ransomware Attack",
        color: 0xff0000,
        particleColor: 0xff4444,
        description: "Malicious software encrypting data for ransom",
        icon: "🔐",
        vrDescription:
          "Watch how ransomware infiltrates systems, encrypts files, and demands payment",
        demoElements: {
          attacker: { type: "skull", color: 0xff0000 },
          payload: { type: "virus", color: 0xff4444 },
          target: { type: "server", color: 0x666666 },
        },
      },
      {
        id: "phishing",
        name: "Phishing Attack",
        color: 0x0088ff,
        particleColor: 0x44aaff,
        description: "Deceptive emails stealing credentials and personal data",
        icon: "🎣",
        vrDescription:
          "See how fake emails trick users into revealing sensitive information",
        demoElements: {
          attacker: { type: "spider", color: 0x0088ff },
          payload: { type: "email", color: 0x44aaff },
          target: { type: "user", color: 0x00ff88 },
        },
      },
      {
        id: "ddos",
        name: "DDoS Attack",
        color: 0xff8800,
        particleColor: 0xffaa44,
        description: "Distributed denial-of-service overwhelming servers",
        icon: "⚡",
        vrDescription:
          "Experience massive traffic floods paralyzing online services",
        demoElements: {
          attacker: { type: "botnet", color: 0xff8800 },
          payload: { type: "traffic", color: 0xffaa44 },
          target: { type: "server", color: 0x666666 },
        },
      },
      {
        id: "mitm",
        name: "Man-in-the-Middle",
        color: 0xaa44ff,
        particleColor: 0xcc88ff,
        description: "Intercepting and potentially modifying communications",
        icon: "🕵️",
        vrDescription:
          "See how attackers position themselves between communicating parties",
        demoElements: {
          attacker: { type: "spy", color: 0xaa44ff },
          payload: { type: "intercept", color: 0xcc88ff },
          target: { type: "communication", color: 0x44ff88 },
        },
      },
    ];
  }

  /**
   * Initialize the attack system and add it to the earth group
   * @param {THREE.Group} earthGroup - The earth group to attach lines to
   * @param {Array} locations - Array of location objects
   */
  init(earthGroup, locations) {
    this.earthGroup = earthGroup;
    this.locations = locations;
    earthGroup.add(this.attackGroup);

    // Start random attack generation
    this.startRandomAttacks();
  }

  /**
   * Get current position of a city in Earth's local coordinate system
   * Since the attack lines are children of earthGroup, they automatically rotate with Earth
   * @param {Object} location - Location object with latitude/longitude
   * @returns {THREE.Vector3} Local position on Earth
   */
  getCurrentCityPosition(location) {
    // Use the same radius as the city markers (1.015) to ensure alignment
    const localPos = latLngToVector3(
      location.latitude,
      location.longitude,
      1.015
    );

    return localPos;
  }

  /**
   * Create a curved path between two points on the sphere
   * @param {THREE.Vector3} start - Start position
   * @param {THREE.Vector3} end - End position
   * @param {number} height - Height of the curve above the sphere
   * @returns {THREE.CubicBezierCurve3} Curved path
   */
  createCurvedPath(start, end, height = 0.5) {
    // Calculate the midpoint and lift it above the sphere
    const midpoint = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(start.length() + height);

    // Create control points for a smooth curve
    const controlPoint1 = new THREE.Vector3()
      .lerpVectors(start, midpoint, 0.5)
      .normalize()
      .multiplyScalar(start.length() + height * 0.4);

    const controlPoint2 = new THREE.Vector3()
      .lerpVectors(midpoint, end, 0.5)
      .normalize()
      .multiplyScalar(start.length() + height * 0.4);

    return new THREE.CubicBezierCurve3(
      start,
      controlPoint1,
      controlPoint2,
      end
    );
  }

  /**
   * Create an attack line between two cities
   * @param {Object} fromLocation - Source city location
   * @param {Object} toLocation - Target city location
   * @param {Object} crimeType - Type of cyber crime (optional)
   * @returns {Object} Attack line object
   */
  createAttackLine(fromLocation, toLocation, crimeType = null) {
    // Select random crime type if not provided
    if (!crimeType) {
      crimeType =
        this.cyberCrimeTypes[
          Math.floor(Math.random() * this.cyberCrimeTypes.length)
        ];
    }

    // Get current positions
    const startPos = this.getCurrentCityPosition(fromLocation);
    const endPos = this.getCurrentCityPosition(toLocation);

    // Create the curved path
    const curve = this.createCurvedPath(startPos, endPos);

    // Create the line geometry
    const points = curve.getPoints(100);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    // Use crime type color for line
    const lineMaterial = new THREE.LineBasicMaterial({
      color: crimeType.color,
      transparent: true,
      opacity: 0.8,
      linewidth: 5,
    });

    const line = new THREE.Line(lineGeometry, lineMaterial);

    // Create particles for animation - use crime type particle color
    const particleCount = 6;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.018, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: crimeType.particleColor,
        transparent: true,
        opacity: 1.0,
      });

      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.visible = false; // Start invisible
      particles.push(particle);
    }

    const attackLine = {
      id: Date.now() + Math.random(),
      fromLocation,
      toLocation,
      crimeType,
      curve,
      line,
      particles,
      progress: 0,
      duration: 4000, // 4 seconds for better visibility
      startTime: Date.now(),
      isActive: false,
    };

    return attackLine;
  }

  /**
   * Log an attack to the history
   * @param {Object} attack - Attack object to log
   */
  logAttack(attack) {
    const attackRecord = {
      id: attack.id,
      timestamp: new Date(),
      from: attack.fromLocation.name,
      to: attack.toLocation.name,
      crimeType: attack.crimeType.name,
      description: attack.crimeType.description,
      status: "Active",
    };

    this.attackHistory.unshift(attackRecord); // Add to beginning

    // Keep only last 50 attacks
    if (this.attackHistory.length > 50) {
      this.attackHistory = this.attackHistory.slice(0, 50);
    }

    // Dispatch custom event for UI updates
    window.dispatchEvent(
      new CustomEvent("cyberAttackLogged", {
        detail: attackRecord,
      })
    );
  }

  /**
   * Mark an attack as completed in the history
   * @param {string} attackId - ID of the completed attack
   */
  completeAttack(attackId) {
    const record = this.attackHistory.find((r) => r.id === attackId);
    if (record) {
      record.status = "Completed";
      record.completedAt = new Date();

      // Dispatch completion event
      window.dispatchEvent(
        new CustomEvent("cyberAttackCompleted", {
          detail: record,
        })
      );
    }
  }

  /**
   * Start an attack animation between two random cities
   */
  startRandomAttack() {
    if (this.locations.length < 2) return;

    // Pick two random different cities
    const fromIndex = Math.floor(Math.random() * this.locations.length);
    let toIndex = Math.floor(Math.random() * this.locations.length);
    while (toIndex === fromIndex) {
      toIndex = Math.floor(Math.random() * this.locations.length);
    }

    const fromLocation = this.locations[fromIndex];
    const toLocation = this.locations[toIndex];

    const attackLine = this.createAttackLine(fromLocation, toLocation);
    attackLine.isActive = true;

    // Add to scene
    this.attackGroup.add(attackLine.line);
    attackLine.particles.forEach((particle) => {
      this.attackGroup.add(particle);
    });

    this.activeAttacks.push(attackLine);

    // Log only automatic attacks (not manual ones)
    this.logAttack(attackLine);

    console.log(
      `AUTO ${attackLine.crimeType.name}: ${fromLocation.name} → ${toLocation.name}`
    );
  }

  /**
   * Update all active attacks
   */
  update() {
    const currentTime = Date.now();

    this.activeAttacks = this.activeAttacks.filter((attack) => {
      const elapsed = currentTime - attack.startTime;
      const progress = Math.min(elapsed / attack.duration, 1);

      if (progress >= 1) {
        // Mark attack as completed
        this.completeAttack(attack.id);

        // Attack finished, remove from scene
        this.attackGroup.remove(attack.line);
        attack.particles.forEach((particle) => {
          this.attackGroup.remove(particle);
        });

        // Dispose of geometries and materials
        attack.line.geometry.dispose();
        attack.line.material.dispose();
        attack.particles.forEach((particle) => {
          particle.geometry.dispose();
          particle.material.dispose();
        });

        return false; // Remove from active attacks
      }

      // Update particle positions along the curve
      attack.particles.forEach((particle, index) => {
        const particleDelay = index * 0.08; // Staggered launch
        const particleProgress = Math.max(0, progress - particleDelay);

        if (particleProgress > 0 && particleProgress <= 1) {
          particle.visible = true;
          const position = attack.curve.getPoint(Math.min(particleProgress, 1));
          particle.position.copy(position);

          // Particles stay bright until they reach the end
          if (particleProgress < 0.95) {
            particle.material.opacity = 1.0;
            particle.scale.setScalar(
              1.0 + Math.sin(Date.now() * 0.01 + index) * 0.2
            );
          } else {
            // Quick fade out when reaching destination
            const fadeOut = (1 - particleProgress) / 0.05;
            particle.material.opacity = Math.max(0, fadeOut);
            particle.scale.setScalar(1.5 * fadeOut);
          }
        } else if (particleProgress > 1) {
          particle.visible = false;
        }
      });

      // Update line opacity based on progress - more visible
      const lineOpacity = Math.sin(progress * Math.PI) * 0.6 + 0.2;
      attack.line.material.opacity = lineOpacity;

      return true; // Keep in active attacks
    });
  }

  /**
   * Start generating random attacks at intervals
   */
  startRandomAttacks() {
    // Generate attacks every 0.5-2 seconds (very frequent)
    const scheduleNextAttack = () => {
      const delay = 500 + Math.random() * 1500;
      setTimeout(() => {
        this.startRandomAttack();
        scheduleNextAttack();
      }, delay);
    };

    scheduleNextAttack();
  }

  /**
   * Manually trigger an attack between specific cities
   * @param {string} fromCityName - Name of source city
   * @param {string} toCityName - Name of target city
   */
  triggerAttack(fromCityName, toCityName) {
    const fromLocation = this.locations.find(
      (loc) => loc.name === fromCityName
    );
    const toLocation = this.locations.find((loc) => loc.name === toCityName);

    if (fromLocation && toLocation) {
      const attackLine = this.createAttackLine(fromLocation, toLocation);
      attackLine.isActive = true;

      // Add to scene
      this.attackGroup.add(attackLine.line);
      attackLine.particles.forEach((particle) => {
        this.attackGroup.add(particle);
      });

      this.activeAttacks.push(attackLine);

      // Manual attacks are not logged to prevent spam
      console.log(
        `MANUAL ${attackLine.crimeType.name}: ${fromLocation.name} → ${toLocation.name}`
      );
    }
  }

  /**
   * Trigger a specific DDoS attack for testing
   */
  triggerDDoSAttack() {
    if (this.locations.length < 2) return;

    // Find the DDoS crime type
    const ddosCrimeType = this.cyberCrimeTypes.find(
      (type) => type.name === "DDoS Attack"
    );

    if (!ddosCrimeType) {
      console.warn("DDoS Attack crime type not found");
      return;
    }

    // Pick two random different cities
    const fromIndex = Math.floor(Math.random() * this.locations.length);
    let toIndex = Math.floor(Math.random() * this.locations.length);
    while (toIndex === fromIndex) {
      toIndex = Math.floor(Math.random() * this.locations.length);
    }

    const fromLocation = this.locations[fromIndex];
    const toLocation = this.locations[toIndex];

    const attackLine = this.createAttackLine(
      fromLocation,
      toLocation,
      ddosCrimeType
    );
    attackLine.isActive = true;

    // Add to scene
    this.attackGroup.add(attackLine.line);
    attackLine.particles.forEach((particle) => {
      this.attackGroup.add(particle);
    });

    this.activeAttacks.push(attackLine);

    // Log the attack
    this.logAttack(attackLine);

    console.log(
      `MANUAL DDoS Attack: ${fromLocation.name} → ${toLocation.name}`
    );
  }

  /**
   * Trigger a specific MITM attack for testing
   */
  triggerMITMAttack() {
    if (this.locations.length < 2) return;

    // Find the MITM crime type
    const mitmCrimeType = this.cyberCrimeTypes.find(
      (type) => type.name === "Man-in-the-Middle"
    );

    if (!mitmCrimeType) {
      console.warn("Man-in-the-Middle crime type not found");
      return;
    }

    // Pick two random different cities
    const fromIndex = Math.floor(Math.random() * this.locations.length);
    let toIndex = Math.floor(Math.random() * this.locations.length);
    while (toIndex === fromIndex) {
      toIndex = Math.floor(Math.random() * this.locations.length);
    }

    const fromLocation = this.locations[fromIndex];
    const toLocation = this.locations[toIndex];

    const attackLine = this.createAttackLine(
      fromLocation,
      toLocation,
      mitmCrimeType
    );
    attackLine.isActive = true;

    // Add to scene
    this.attackGroup.add(attackLine.line);
    attackLine.particles.forEach((particle) => {
      this.attackGroup.add(particle);
    });

    this.activeAttacks.push(attackLine);

    // Log the attack
    this.logAttack(attackLine);

    console.log(
      `MANUAL MITM Attack: ${fromLocation.name} → ${toLocation.name}`
    );
  }

  /**
   * Trigger a specific Phishing attack for testing
   */
  triggerPhishingAttack() {
    if (this.locations.length < 2) return;

    // Find the Phishing crime type
    const phishingCrimeType = this.cyberCrimeTypes.find(
      (type) => type.name === "Phishing Attack"
    );

    if (!phishingCrimeType) {
      console.warn("Phishing Attack crime type not found");
      return;
    }

    // Pick two random different cities
    const fromIndex = Math.floor(Math.random() * this.locations.length);
    let toIndex = Math.floor(Math.random() * this.locations.length);
    while (toIndex === fromIndex) {
      toIndex = Math.floor(Math.random() * this.locations.length);
    }

    const fromLocation = this.locations[fromIndex];
    const toLocation = this.locations[toIndex];

    const attackLine = this.createAttackLine(
      fromLocation,
      toLocation,
      phishingCrimeType
    );
    attackLine.isActive = true;

    // Add to scene
    this.attackGroup.add(attackLine.line);
    attackLine.particles.forEach((particle) => {
      this.attackGroup.add(particle);
    });

    this.activeAttacks.push(attackLine);

    // Log the attack
    this.logAttack(attackLine);

    console.log(
      `MANUAL Phishing Attack: ${fromLocation.name} → ${toLocation.name}`
    );
  }

  /**
   * Trigger a specific Ransomware attack for testing
   */
  triggerRansomwareAttack() {
    if (this.locations.length < 2) return;

    // Find the Ransomware crime type
    const ransomwareCrimeType = this.cyberCrimeTypes.find(
      (type) => type.name === "Ransomware Attack"
    );

    if (!ransomwareCrimeType) {
      console.warn("Ransomware Attack crime type not found");
      return;
    }

    // Pick two random different cities
    const fromIndex = Math.floor(Math.random() * this.locations.length);
    let toIndex = Math.floor(Math.random() * this.locations.length);
    while (toIndex === fromIndex) {
      toIndex = Math.floor(Math.random() * this.locations.length);
    }

    const fromLocation = this.locations[fromIndex];
    const toLocation = this.locations[toIndex];

    const attackLine = this.createAttackLine(
      fromLocation,
      toLocation,
      ransomwareCrimeType
    );
    attackLine.isActive = true;

    // Add to scene
    this.attackGroup.add(attackLine.line);
    attackLine.particles.forEach((particle) => {
      this.attackGroup.add(particle);
    });

    this.activeAttacks.push(attackLine);

    // Log the attack
    this.logAttack(attackLine);

    console.log(
      `MANUAL Ransomware Attack: ${fromLocation.name} → ${toLocation.name}`
    );
  }

  /**
   * Clean up the attack system
   */
  dispose() {
    this.activeAttacks.forEach((attack) => {
      this.attackGroup.remove(attack.line);
      attack.particles.forEach((particle) => {
        this.attackGroup.remove(particle);
      });

      attack.line.geometry.dispose();
      attack.line.material.dispose();
      attack.particles.forEach((particle) => {
        particle.geometry.dispose();
        particle.material.dispose();
      });
    });

    this.activeAttacks = [];
  }
}
