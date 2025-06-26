import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

export class CyberSecurityQuiz {
  constructor() {
    this.currentQuizType = null;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.totalQuestions = 0;
    this.userAnswers = [];
    this.isRunning = false;

    // 3D Scene properties
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.quizGroup = new THREE.Group();
    this.questionPanels = [];
    this.optionMeshes = [];
    this.selectedOption = null;

    // Quiz data for different attack types - simplified for non-technical users
    this.quizData = {
      "Man-in-the-Middle": {
        title: "🕵️ Someone Listening to Your Conversations",
        description:
          "Learn how criminals can spy on your internet activity and how to stay safe!",
        icon: "🕵️",
        color: "#aa44ff",
        questions: [
          {
            id: 1,
            type: "multiple-choice",
            question:
              "You're at a coffee shop and see two WiFi networks: 'CoffeeShop_WiFi' and 'Free_WiFi'. Which one should you connect to?",
            options: [
              "Free_WiFi - because it's free!",
              "CoffeeShop_WiFi - because it's the coffee shop's official network",
              "Both are the same, so either one is fine",
              "Neither - I should use my phone's data instead",
            ],
            correct: 1,
            explanation:
              "✅ Correct! The coffee shop's official network is safer. 'Free_WiFi' could be a fake network created by criminals to steal your information. Always ask the staff which network is theirs before connecting.",
            difficulty: "easy",
            scenario: "☕ Coffee Shop WiFi",
          },
          {
            id: 2,
            type: "multiple-choice",
            question:
              "What's the main benefit of using a VPN (a privacy app) when you're on public WiFi?",
            options: [
              "It makes your internet faster",
              "It only hides where you are in the world",
              "It scrambles all your internet activity so spies can't read it",
              "It blocks all dangerous websites automatically",
            ],
            correct: 2,
            explanation:
              "✅ Exactly right! A VPN is like putting your internet activity in a locked, invisible tunnel. Even if someone is spying on the WiFi, they can only see scrambled, unreadable data instead of your actual browsing.",
            difficulty: "medium",
            scenario: "🔐 Privacy Protection",
          },
          {
            id: 3,
            type: "scenario",
            question:
              "You're checking your bank account on public WiFi when your browser suddenly shows a big warning saying 'This connection is not secure.' What should you do?",
            options: [
              "Click 'Continue anyway' - these warnings usually don't matter",
              "Close the browser immediately and wait until I'm on a safe network",
              "Try opening the bank website in a different browser",
              "Keep going but don't enter my password",
            ],
            correct: 1,
            explanation:
              "✅ Smart choice! Security warnings about banking websites are serious red flags. Someone might be trying to steal your banking information. Always stop immediately and wait until you're on a network you trust, like your home WiFi.",
            difficulty: "hard",
            scenario: "🏦 Banking Warning",
          },
          {
            id: 4,
            type: "multiple-choice",
            question:
              "A criminal is trying to trick your computer into thinking their computer is your internet router. What are they trying to do?",
            options: [
              "Make your computer think they're your printer",
              "Make all your internet activity go through their computer first",
              "Make your computer think they're your antivirus",
              "Make your computer think they're part of Windows",
            ],
            correct: 1,
            explanation:
              "✅ Correct! This trick makes your computer send all internet activity to the criminal's computer first, like having all your mail go to a spy before reaching you. This lets them read everything you do online.",
            difficulty: "hard",
            scenario: "🌐 Internet Hijacking",
          },
        ],
      },

      Phishing: {
        title: "🎣 Fake Emails and Websites",
        description:
          "Learn how to spot fake emails and websites that try to trick you into giving away your passwords and personal information!",
        icon: "🎣",
        color: "#0088ff",
        questions: [
          {
            id: 1,
            type: "multiple-choice",
            question:
              "You get an email saying 'Your PayPal account will be closed in 24 hours! Click here to save it.' What should you do first?",
            options: [
              "Click the link right away to save my account",
              "Look at who sent the email - is it really from PayPal?",
              "Forward it to my friends to warn them",
              "Reply to ask for more information",
            ],
            correct: 1,
            explanation:
              "✅ Smart thinking! Always check who sent the email first. Real PayPal emails come from addresses ending in @paypal.com, not from Gmail or other random email services. Criminals often use fake email addresses to trick people.",
            difficulty: "easy",
            scenario: "📧 Suspicious Email",
          },
          {
            id: 2,
            type: "scenario",
            question:
              "Which of these email addresses would you trust for a message from your bank?",
            options: [
              "security@gmail.com",
              "noreply@chasebank.com",
              "chase-security@secure-banking.net",
              "notifications@ch4se.com",
            ],
            correct: 1,
            explanation:
              "✅ Correct! Only the second option uses the real bank's website address. The others are tricks criminals use: using popular email services like Gmail, fake websites that sound official, or spelling the bank name wrong (like 'ch4se' instead of 'chase').",
            difficulty: "medium",
            scenario: "🏦 Email Address Check",
          },
          {
            id: 3,
            type: "true-false",
            question:
              "If an email knows my real name and some details about my account, it must be real and safe.",
            correct: false,
            explanation:
              "❌ Not true! Criminals often steal personal information from data breaches or find it on social media to make their fake emails look more convincing. Just because they know your name doesn't mean the email is real.",
            difficulty: "medium",
            scenario: "🎭 Personal Information Tricks",
          },
          {
            id: 4,
            type: "multiple-choice",
            question:
              "You get a suspicious email claiming to be from your bank. What's the safest way to check if it's real?",
            options: [
              "Click the link in the email to verify",
              "Call the phone number given in the email",
              "Open a new browser tab and go to your bank's website yourself",
              "Reply to the email asking if it's real",
            ],
            correct: 2,
            explanation:
              "✅ Perfect! Never trust links or phone numbers from suspicious emails. Instead, open your browser and type your bank's website address yourself, or call the number from your bank card or statement. This way you know you're talking to the real bank.",
            difficulty: "easy",
            scenario: "✅ Safe Verification",
          },
          {
            id: 5,
            type: "scenario",
            question:
              "You're shopping online and find a website that looks exactly like Amazon, but the web address says 'amazom.com'. What is this?",
            options: [
              "Amazon's official partner website",
              "A fake website designed to steal my information",
              "Amazon's mobile version",
              "Amazon's website for my country",
            ],
            correct: 1,
            explanation:
              "✅ You spotted the trick! This is a fake website that looks like Amazon but has a slightly different web address ('amazom' instead of 'amazon'). Criminals create these to steal your login information and credit card details.",
            difficulty: "medium",
            scenario: "🌐 Fake Website Spotting",
          },
        ],
      },

      Ransomware: {
        title: "🔐 File-Locking Viruses",
        description:
          "Learn about viruses that lock your files and demand money, and how to protect yourself from losing everything!",
        icon: "🔐",
        color: "#ff0000",
        questions: [
          {
            id: 1,
            type: "multiple-choice",
            question:
              "Your computer suddenly shows a scary message saying 'All your files are locked! Pay us $500 to get them back!' What should you do first?",
            options: [
              "Pay the money immediately to get my files back",
              "Unplug the computer from the internet and turn it off right away",
              "Try to find and delete the virus program",
              "Restart the computer to see if the message goes away",
            ],
            correct: 1,
            explanation:
              "✅ Exactly right! Unplug from the internet immediately to stop the virus from locking more files or spreading to other devices in your home. Never pay the criminals - most people who pay never get their files back anyway.",
            difficulty: "easy",
            scenario: "🚨 Virus Attack",
          },
          {
            id: 2,
            type: "true-false",
            question:
              "If I pay the criminals the money they're asking for, I'm guaranteed to get all my files back.",
            correct: false,
            explanation:
              "❌ Unfortunately not true! Studies show that only about 6 out of 10 people who pay actually get their files back, and many only get some files back. These are criminals - they have no reason to keep their promises once they have your money.",
            difficulty: "easy",
            scenario: "💰 Payment Reality",
          },
          {
            id: 3,
            type: "multiple-choice",
            question:
              "What's the best way to protect yourself from losing all your files to these file-locking viruses?",
            options: [
              "Buy the most expensive antivirus software",
              "Make regular backup copies of my important files on an external drive",
              "Use a Mac computer instead of Windows",
              "Only download apps from official app stores",
            ],
            correct: 1,
            explanation:
              "✅ Perfect! Regular backups are your best protection. If a virus locks your files, you can just restore them from your backup. Make sure to disconnect your backup drive when not using it, so the virus can't lock those files too.",
            difficulty: "medium",
            scenario: "🛡️ Best Protection",
          },
          {
            id: 4,
            type: "scenario",
            question:
              "You get an email with a file attached called 'Invoice_March.pdf.exe'. What's wrong with this file?",
            options: [
              "PDF files should never be sent by email",
              "The file has two file types (.pdf.exe), which means it's actually a program pretending to be a document",
              "March invoices should only be sent in April",
              "The filename is too long to be safe",
            ],
            correct: 1,
            explanation:
              "✅ Great catch! This is a classic trick. The file looks like a PDF document, but the '.exe' at the end means it's actually a program that could contain a virus. Real PDF files only end with '.pdf'.",
            difficulty: "medium",
            scenario: "📎 Suspicious File",
          },
          {
            id: 5,
            type: "multiple-choice",
            question:
              "How do most file-locking viruses get onto people's computers in the first place?",
            options: [
              "Through email attachments and links that people click on",
              "They automatically download from websites",
              "Through USB drives found in parking lots",
              "Criminals break into computers directly over the internet",
            ],
            correct: 0,
            explanation:
              "✅ Correct! Over 90% of these viruses spread through email attachments and links that people click on. The criminals trick people into downloading the virus themselves by making fake emails that look important or urgent.",
            difficulty: "hard",
            scenario: "🚪 How Viruses Spread",
          },
        ],
      },
    };
  }

  init(attackType) {
    console.log(
      "🎓 CyberSecurityQuiz.init() called with attackType:",
      attackType
    );
    console.log("🎓 Available quiz types:", Object.keys(this.quizData));

    this.currentQuizType = attackType;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.userAnswers = [];
    this.isRunning = true;

    const quizConfig = this.quizData[attackType];
    if (!quizConfig) {
      console.error(
        "❌ Quiz configuration not found for attack type:",
        attackType
      );
      throw new Error(`Quiz not available for attack type: ${attackType}`);
    }

    console.log("🎓 Quiz config found:", quizConfig.title);
    this.totalQuestions = quizConfig.questions.length;

    try {
      // Create 3D scene for VR support with floating panel behind Earth
      this.create3DQuizScene();
      console.log("🎓 3D quiz scene created successfully");

      this.createFloating3DPanel(quizConfig);
      console.log("🎓 3D floating panel created successfully");

      this.showQuestion(0);
      console.log("🎓 First question shown successfully");

      console.log(
        "🎓 Returning renderer DOM element:",
        this.renderer.domElement
      );
      return this.renderer.domElement;
    } catch (error) {
      console.error("❌ Error during quiz initialization:", error);
      throw error;
    }
  }

  create3DQuizScene() {
    // Create 3D scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);

    // Camera setup - position behind Earth for quiz space
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Position camera behind Earth (positive Z) looking at quiz panel
    this.camera.position.set(0, 0, 15);
    this.camera.lookAt(0, 0, 0);

    // Renderer with VR support
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.xr.enabled = true; // Enable VR

    // Controls for quiz interaction - restrict movement to keep quiz visible
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0, 0);
    this.controls.minDistance = 8;
    this.controls.maxDistance = 25;
    this.controls.enablePan = true;

    // Allow full rotation to explore the space
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;

    // Lighting for quiz space
    const ambientLight = new THREE.AmbientLight(0x404080, 0.8);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 10);
    this.scene.add(directionalLight);

    // Add quiz group to scene
    this.scene.add(this.quizGroup);

    // Create starfield background for depth
    this.createStarfield();

    // Start render loop
    this.animate();
  }

  createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      sizeAttenuation: false,
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  createFloating3DPanel(config) {
    this.quizConfig = config;

    // Create the main quiz panel as a 3D plane floating behind Earth - even wider for better readability
    const panelWidth = 22;
    const panelHeight = 16;

    // Create canvas for rendering quiz content - even higher resolution for better text
    this.canvas = document.createElement("canvas");
    this.canvas.width = 2200;
    this.canvas.height = 1600;
    this.ctx = this.canvas.getContext("2d");

    // Create texture from canvas
    this.canvasTexture = new THREE.CanvasTexture(this.canvas);
    this.canvasTexture.minFilter = THREE.LinearFilter;
    this.canvasTexture.magFilter = THREE.LinearFilter;

    // Create 3D panel geometry and material
    const panelGeometry = new THREE.PlaneGeometry(panelWidth, panelHeight);
    const panelMaterial = new THREE.MeshStandardMaterial({
      map: this.canvasTexture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });

    this.quizPanel3D = new THREE.Mesh(panelGeometry, panelMaterial);
    this.quizPanel3D.position.set(0, 0, -8); // Position behind Earth
    this.quizGroup.add(this.quizPanel3D);

    // Add subtle glow effect
    const glowGeometry = new THREE.PlaneGeometry(
      panelWidth + 0.5,
      panelHeight + 0.5
    );
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x44aaff,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = -0.01;
    this.quizPanel3D.add(glow);

    // Create return to Earth button as separate 3D element
    this.createReturn3DButton();

    // Setup raycasting for interactions
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.setupClickHandling();
  }

  createReturn3DButton() {
    // Create a small 3D button in top-right corner
    const buttonGeometry = new THREE.PlaneGeometry(2, 0.8);

    // Create canvas for button
    const buttonCanvas = document.createElement("canvas");
    buttonCanvas.width = 400;
    buttonCanvas.height = 160;
    const buttonCtx = buttonCanvas.getContext("2d");

    // Draw button
    buttonCtx.fillStyle = "#44aaff";
    buttonCtx.fillRect(0, 0, 400, 160);
    buttonCtx.fillStyle = "#ffffff";
    buttonCtx.font = "bold 40px Arial";
    buttonCtx.textAlign = "center";
    buttonCtx.fillText("🌍 Return to Earth", 200, 100);

    const buttonTexture = new THREE.CanvasTexture(buttonCanvas);
    const buttonMaterial = new THREE.MeshBasicMaterial({
      map: buttonTexture,
      transparent: true,
    });

    this.returnButton3D = new THREE.Mesh(buttonGeometry, buttonMaterial);
    this.returnButton3D.position.set(9, 7, 0.01); // Adjusted for wider panel (22 units)
    this.returnButton3D.userData = { type: "returnButton" };
    this.quizPanel3D.add(this.returnButton3D);
  }

  setupClickHandling() {
    this.renderer.domElement.addEventListener("click", (event) => {
      this.handleClick(event);
    });
  }

  createQuizEnvironment() {
    // Create a subtle starfield background (different from main Earth view)
    this.createQuizStarfield();

    // Create a floating platform for the quiz
    this.createQuizPlatform();

    // Add subtle ambient particles
    this.createAmbientParticles();
  }

  createQuizStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 200;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100; // x
      positions[i + 1] = (Math.random() - 0.5) * 100; // y
      positions[i + 2] = (Math.random() - 0.5) * 100; // z
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);
  }

  createQuizPlatform() {
    // Create a subtle circular platform for the quiz panel to "rest" on
    const platformGeometry = new THREE.CylinderGeometry(4, 4, 0.1, 32);
    const platformMaterial = new THREE.MeshBasicMaterial({
      color: 0x2a2a4a,
      transparent: true,
      opacity: 0.3,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(0, -2, 0);
    this.scene.add(platform);
  }

  createAmbientParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 15; // x
      positions[i + 1] = (Math.random() - 0.5) * 10; // y
      positions[i + 2] = (Math.random() - 0.5) * 15; // z
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x6644aa,
      size: 0.03,
      transparent: true,
      opacity: 0.4,
    });

    this.ambientParticles = new THREE.Points(
      particleGeometry,
      particleMaterial
    );
    this.scene.add(this.ambientParticles);
  }

  createQuizUI(config) {
    // Create single integrated quiz panel
    this.createIntegratedQuizPanel(config);
    this.setupVRControls();
  }

  createIntegratedQuizPanel(config) {
    // Create one large panel that contains everything
    const panelWidth = 6;
    const panelHeight = 8;

    const panelGeometry = new THREE.PlaneGeometry(panelWidth, panelHeight);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;

    this.mainCanvas = canvas;
    this.mainContext = canvas.getContext("2d");

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    this.mainQuizPanel = new THREE.Mesh(panelGeometry, material);
    this.mainQuizPanel.position.set(0, 0, 0);
    this.quizGroup.add(this.mainQuizPanel);

    // Store config for rendering
    this.quizConfig = config;

    // Create option click areas (invisible meshes for interaction)
    this.createOptionClickAreas();

    // Create navigation click areas
    this.createNavigationClickAreas();
  }

  createOptionClickAreas() {
    this.optionClickAreas = [];

    // Create 4 invisible click areas for options
    for (let i = 0; i < 4; i++) {
      const clickGeometry = new THREE.PlaneGeometry(5.5, 0.8);
      const clickMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
      });
      const clickArea = new THREE.Mesh(clickGeometry, clickMaterial);

      // Position click areas to match where options will be drawn
      clickArea.position.set(0, 1.5 - i * 1, 0.01); // Slightly in front of main panel
      clickArea.userData = {
        type: "option",
        index: i,
      };

      this.optionClickAreas.push(clickArea);
      this.quizGroup.add(clickArea);
    }
  }

  createNavigationClickAreas() {
    // Submit button click area
    const submitGeometry = new THREE.PlaneGeometry(2, 0.6);
    const submitMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });
    this.submitClickArea = new THREE.Mesh(submitGeometry, submitMaterial);
    this.submitClickArea.position.set(-1.5, -3.2, 0.01);
    this.submitClickArea.userData = {
      type: "submit",
    };
    this.quizGroup.add(this.submitClickArea);

    // Next/Close button click area
    const nextGeometry = new THREE.PlaneGeometry(2, 0.6);
    const nextMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });
    this.nextClickArea = new THREE.Mesh(nextGeometry, nextMaterial);
    this.nextClickArea.position.set(1.5, -3.2, 0.01);
    this.nextClickArea.userData = {
      type: "next",
    };
    this.quizGroup.add(this.nextClickArea);
  }

  setupVRControls() {
    // Add raycaster for VR/mouse interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Mouse events for desktop
    this.renderer.domElement.addEventListener("click", (event) => {
      this.handleClick(event);
    });

    // VR controller events would be added here
    // this.renderer.xr.addEventListener('sessionstart', () => {
    //   // Setup VR controllers
    // });
  }

  handleClick(event) {
    // Convert mouse position to normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check for intersections with the quiz panel
    const intersects = this.raycaster.intersectObject(this.quizPanel3D);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const uv = intersection.uv;

      // Convert UV coordinates to canvas coordinates
      const canvasX = uv.x * this.canvas.width;
      const canvasY = (1 - uv.y) * this.canvas.height; // Flip Y coordinate

      // Check if click is on return button
      if (this.returnButton3D) {
        const returnIntersects = this.raycaster.intersectObject(
          this.returnButton3D
        );
        if (returnIntersects.length > 0) {
          this.close();
          return;
        }
      }

      // Check option areas
      if (this.optionAreas) {
        for (const area of this.optionAreas) {
          if (
            canvasX >= area.x &&
            canvasX <= area.x + area.width &&
            canvasY >= area.y &&
            canvasY <= area.y + area.height
          ) {
            if (!this.answerSubmitted) {
              this.selectedAnswer = area.index;
              this.render3DQuizPanel();
            }
            return;
          }
        }
      }

      // Check button areas
      if (this.buttonAreas) {
        for (const area of this.buttonAreas) {
          if (
            canvasX >= area.x &&
            canvasX <= area.x + area.width &&
            canvasY >= area.y &&
            canvasY <= area.y + area.height
          ) {
            if (area.type === "submit" && area.enabled) {
              this.submitAnswer();
            } else if (area.type === "next" && area.enabled) {
              this.handleNextQuestion();
            } else if (area.type === "close" && area.enabled) {
              this.close();
            }
            return;
          }
        }
      }
    }
  }

  submitAnswer() {
    if (this.selectedAnswer === null || this.answerSubmitted) {
      return;
    }

    this.answerSubmitted = true;
    this.userAnswers.push(this.selectedAnswer);

    // Check if answer is correct
    if (this.selectedAnswer === this.currentQuestion.correct) {
      this.score++;
    }

    // Enable next question after a short delay
    setTimeout(() => {
      this.waitingForNext = true;
      this.render3DQuizPanel();
    }, 1000);

    // Re-render to show feedback
    this.render3DQuizPanel();
  }

  handleNextQuestion() {
    this.waitingForNext = false;

    if (this.currentQuestionIndex < this.totalQuestions - 1) {
      this.currentQuestionIndex++;
      this.showQuestion(this.currentQuestionIndex);
    } else {
      this.showingResults = true;
      this.renderResultsPanel();
    }
  }

  renderResultsPanel() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const config = this.quizConfig;
    const percentage = Math.round((this.score / this.totalQuestions) * 100);

    // Clear canvas
    ctx.fillStyle = "#1a1a3a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = "#4a4a6a";
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    let yPos = 120;

    // Draw header
    ctx.fillStyle = "#2a2a4a";
    ctx.fillRect(100, yPos - 60, canvas.width - 200, 140);

    ctx.fillStyle = "#ff8800";
    ctx.font = "bold 80px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🎓 Quiz Complete!", canvas.width / 2, yPos);
    yPos += 60;

    ctx.fillStyle = "#cccccc";
    ctx.font = "36px Arial";
    ctx.fillText(config.title, canvas.width / 2, yPos);
    yPos += 120;

    // Draw score section
    let emoji = "";
    let scoreMessage = "";

    if (percentage >= 90) {
      emoji = "🏆";
      scoreMessage = "Outstanding! You're a cybersecurity expert!";
    } else if (percentage >= 70) {
      emoji = "🎉";
      scoreMessage = "Great job! You have solid security knowledge.";
    } else if (percentage >= 50) {
      emoji = "👍";
      scoreMessage = "Good effort! Keep learning to improve your security.";
    } else {
      emoji = "📚";
      scoreMessage = "Keep studying! Cybersecurity knowledge takes practice.";
    }

    // Large score display
    ctx.fillStyle = "#44aaff";
    ctx.font = "bold 120px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${emoji} ${percentage}%`, canvas.width / 2, yPos);
    yPos += 80;

    // Score message
    ctx.fillStyle = "#ffffff";
    ctx.font = "40px Arial";
    const messageLines = this.wrapText(ctx, scoreMessage, canvas.width - 200);
    for (let i = 0; i < messageLines.length; i++) {
      ctx.fillText(messageLines[i], canvas.width / 2, yPos);
      yPos += 50;
    }
    yPos += 60;

    // Stats section
    ctx.fillStyle = "#2a2a4a";
    ctx.fillRect(100, yPos, canvas.width - 200, 240);

    ctx.strokeStyle = "#44aaff";
    ctx.lineWidth = 6;
    ctx.strokeRect(100, yPos, canvas.width - 200, 240);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("📊 Quiz Summary", canvas.width / 2, yPos + 50);

    ctx.font = "32px Arial";
    ctx.textAlign = "left";
    ctx.fillText(
      `Correct Answers: ${this.score} out of ${this.totalQuestions}`,
      140,
      yPos + 100
    );
    ctx.fillText(`Topic: ${config.title}`, 140, yPos + 140);
    ctx.fillText(`Difficulty Level: Mixed`, 140, yPos + 180);
    ctx.fillText(`Time Spent: Interactive Learning`, 140, yPos + 220);
    yPos += 280;

    // Key takeaways section
    ctx.fillStyle = "#2a4a2a";
    ctx.fillRect(100, yPos, canvas.width - 200, 360);

    ctx.strokeStyle = "#44aa44";
    ctx.lineWidth = 6;
    ctx.strokeRect(100, yPos, canvas.width - 200, 360);

    ctx.fillStyle = "#66cc66";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🎯 Key Takeaways", canvas.width / 2, yPos + 50);

    // Takeaways text
    const takeaways = this.generateTakeawaysText();
    ctx.fillStyle = "#ffffff";
    ctx.font = "28px Arial";
    ctx.textAlign = "left";

    const lines = takeaways.split("\n");
    let takeawayY = yPos + 100;
    for (const line of lines) {
      if (line.trim()) {
        ctx.fillText(line, 140, takeawayY);
        takeawayY += 40;
      }
    }
    yPos += 400;

    // Close button
    ctx.fillStyle = "#aa44aa";
    ctx.fillRect(canvas.width / 2 - 200, yPos, 400, 100);
    ctx.strokeStyle = "#cc66cc";
    ctx.lineWidth = 6;
    ctx.strokeRect(canvas.width / 2 - 200, yPos, 400, 100);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🚀 Close Quiz", canvas.width / 2, yPos + 65);

    // Store button area for click detection
    this.buttonAreas = [
      {
        x: canvas.width / 2 - 200,
        y: yPos,
        width: 400,
        height: 100,
        type: "close",
        enabled: true,
      },
    ];

    // Update texture
    this.canvasTexture.needsUpdate = true;
  }

  generateTakeawaysText() {
    if (this.currentQuizType === "Man-in-the-Middle") {
      return `• Always verify network names with staff before connecting
• Use VPNs on public networks for extra protection  
• Pay attention to certificate warnings - they're serious
• Avoid banking and sensitive activities on public WiFi`;
    } else if (this.currentQuizType === "Phishing") {
      return `• Always check sender email addresses carefully
• Go directly to websites instead of clicking email links
• Personal information in emails doesn't guarantee legitimacy
• When in doubt, contact the company through official channels`;
    } else if (this.currentQuizType === "Ransomware") {
      return `• Regular offline backups are your best defense
• Never pay ransoms - there's no guarantee of file recovery
• Be suspicious of email attachments with double extensions
• Disconnect immediately if you suspect infection`;
    }

    return `• Stay vigilant and think before clicking
• Keep software updated and use strong passwords
• Trust your instincts - if something feels wrong, investigate
• Cybersecurity is everyone's responsibility`;
  }

  animate() {
    if (!this.isRunning) return;

    this.renderer.setAnimationLoop(() => {
      if (this.controls) {
        this.controls.update();
      }

      // Animate ambient particles
      if (this.ambientParticles) {
        this.ambientParticles.rotation.y += 0.002;
        this.ambientParticles.rotation.x += 0.001;
      }

      this.renderer.render(this.scene, this.camera);
    });
  }

  // Simplified container creation for compatibility
  createLegacyContainer() {
    const container = document.createElement("div");
    container.id = "quiz-container";
    container.innerHTML = `
      <div class="quiz-panel">
        <!-- Header -->
        <div class="quiz-header">
          <div class="quiz-title">
            <span class="quiz-icon">${config.icon}</span>
            <h2>${config.title}</h2>
          </div>
          <div class="quiz-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
            <span class="progress-text" id="progress-text">1 of ${this.totalQuestions}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="quiz-description">
          <p>${config.description}</p>
        </div>

        <!-- Question Area -->
        <div class="question-container" id="question-container">
          <!-- Questions will be dynamically inserted here -->
        </div>

        <!-- Navigation -->
        <div class="quiz-navigation">
          <button class="quiz-btn secondary" id="hint-btn">💡 Hint</button>
          <div class="nav-buttons">
            <button class="quiz-btn primary" id="submit-btn" disabled>Submit Answer</button>
          </div>
        </div>

        <!-- Results Area (Hidden initially) -->
        <div class="results-container" id="results-container" style="display: none;">
          <!-- Results will be shown here -->
        </div>

        <!-- Close Button -->
        <button class="close-btn" id="close-quiz">✕ Close Quiz</button>
      </div>
    `;

    // Add comprehensive styles
    const style = document.createElement("style");
    style.textContent = `
      #quiz-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', Arial, sans-serif;
        overflow-y: auto;
      }

      .quiz-panel {
        background: rgba(0, 0, 0, 0.95);
        border-radius: 20px;
        padding: 30px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        border: 2px solid rgba(255, 136, 0, 0.3);
        box-shadow: 0 0 50px rgba(255, 136, 0, 0.2);
        position: relative;
      }

      .quiz-header {
        text-align: center;
        margin-bottom: 25px;
        border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 20px;
      }

      .quiz-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        margin-bottom: 15px;
      }

      .quiz-icon {
        font-size: 2.5em;
      }

      .quiz-title h2 {
        color: #ff8800;
        margin: 0;
        font-size: 1.8em;
      }

      .quiz-progress {
        display: flex;
        align-items: center;
        gap: 15px;
        justify-content: center;
      }

      .progress-bar {
        width: 300px;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #44aaff, #ff8800);
        width: 0%;
        transition: width 0.3s ease;
      }

      .progress-text {
        color: #aaa;
        font-size: 14px;
        font-weight: bold;
      }

      .quiz-description {
        background: rgba(255, 136, 0, 0.1);
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 25px;
        border-left: 4px solid #ff8800;
      }

      .quiz-description p {
        color: #fff;
        margin: 0;
        line-height: 1.5;
      }

      .question-container {
        margin-bottom: 25px;
      }

      .question-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 25px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .question-scenario {
        background: rgba(68, 170, 255, 0.1);
        color: #44aaff;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        display: inline-block;
        margin-bottom: 15px;
        border: 1px solid rgba(68, 170, 255, 0.3);
      }

      .question-text {
        color: #fff;
        font-size: 1.2em;
        line-height: 1.6;
        margin-bottom: 20px;
        font-weight: 500;
      }

      .options-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .option-button {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 15px 20px;
        color: #fff;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: left;
        font-size: 16px;
        position: relative;
        overflow: hidden;
      }

      .option-button:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(68, 170, 255, 0.5);
        transform: translateX(5px);
      }

      .option-button.selected {
        background: rgba(68, 170, 255, 0.2);
        border-color: #44aaff;
        color: #44aaff;
        font-weight: bold;
      }

      .option-button.correct {
        background: rgba(68, 255, 68, 0.2);
        border-color: #44ff44;
        color: #44ff44;
      }

      .option-button.incorrect {
        background: rgba(255, 68, 68, 0.2);
        border-color: #ff4444;
        color: #ff4444;
      }

      .option-button.disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .true-false-container {
        display: flex;
        gap: 15px;
        justify-content: center;
      }

      .true-false-container .option-button {
        flex: 1;
        text-align: center;
        font-size: 1.2em;
        font-weight: bold;
      }

      .quiz-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 25px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .nav-buttons {
        display: flex;
        gap: 15px;
      }

      .quiz-btn {
        padding: 12px 25px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
        transition: all 0.3s ease;
      }

      .quiz-btn.primary {
        background: #44aaff;
        color: white;
      }

      .quiz-btn.primary:hover:not(:disabled) {
        background: #66ccff;
        transform: translateY(-2px);
      }

      .quiz-btn.primary:disabled {
        background: #666;
        cursor: not-allowed;
        opacity: 0.5;
      }

      .quiz-btn.secondary {
        background: rgba(255, 136, 0, 0.2);
        color: #ff8800;
        border: 1px solid rgba(255, 136, 0, 0.5);
      }

      .quiz-btn.secondary:hover {
        background: rgba(255, 136, 0, 0.3);
      }

      .explanation-panel {
        background: rgba(255, 136, 0, 0.1);
        border: 1px solid rgba(255, 136, 0, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
        animation: slideDown 0.3s ease;
      }

      .explanation-header {
        color: #ff8800;
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 1.1em;
      }

      .explanation-text {
        color: #fff;
        line-height: 1.6;
      }

      .results-container {
        text-align: center;
        padding: 30px;
      }

      .final-score {
        font-size: 3em;
        color: #44aaff;
        margin-bottom: 20px;
        font-weight: bold;
      }

      .score-message {
        font-size: 1.3em;
        margin-bottom: 25px;
        color: #fff;
      }

      .score-breakdown {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
      }

      .close-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(255, 68, 68, 0.2);
        color: #ff4444;
        border: 1px solid rgba(255, 68, 68, 0.5);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.3s ease;
      }

      .close-btn:hover {
        background: rgba(255, 68, 68, 0.4);
        transform: scale(1.1);
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .hint-panel {
        background: rgba(68, 170, 255, 0.1);
        border: 1px solid rgba(68, 170, 255, 0.3);
        border-radius: 12px;
        padding: 15px;
        margin-top: 15px;
        animation: slideDown 0.3s ease;
      }

      .hint-header {
        color: #44aaff;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .hint-text {
        color: #fff;
        font-size: 14px;
        line-height: 1.5;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .quiz-panel {
          width: 95%;
          padding: 20px;
          margin: 10px;
        }
        
        .quiz-title h2 {
          font-size: 1.4em;
        }
        
        .progress-bar {
          width: 200px;
        }
        
        .quiz-navigation {
          flex-direction: column;
          gap: 15px;
        }
        
        .true-false-container {
          flex-direction: column;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(container);

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Submit button
    document.getElementById("submit-btn").addEventListener("click", () => {
      this.submitAnswer();
    });

    // Hint button
    document.getElementById("hint-btn").addEventListener("click", () => {
      this.showHint();
    });

    // Close button
    document.getElementById("close-quiz").addEventListener("click", () => {
      this.close();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (!this.isRunning) return;

      if (e.key === "Enter") {
        const submitBtn = document.getElementById("submit-btn");
        if (!submitBtn.disabled) {
          this.submitAnswer();
        }
      } else if (e.key === "Escape") {
        this.close();
      } else if (e.key >= "1" && e.key <= "4") {
        // Quick select options with number keys
        const optionIndex = parseInt(e.key) - 1;
        const options = document.querySelectorAll(".option-button");
        if (options[optionIndex]) {
          this.selectOption(optionIndex);
        }
      }
    });
  }

  showQuestion(questionIndex) {
    const config = this.quizData[this.currentQuizType];
    const question = config.questions[questionIndex];

    this.currentQuestion = question;
    this.selectedAnswer = null;
    this.answerSubmitted = false;
    this.waitingForNext = false;
    this.showingResults = false;

    // Render the 3D canvas quiz panel
    this.render3DQuizPanel();
  }

  render3DQuizPanel() {
    const question = this.currentQuestion;
    const config = this.quizConfig;
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Clear canvas
    ctx.fillStyle = "#1a1a3a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = "#4a4a6a";
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    let yPos = 80;

    // Draw header
    ctx.fillStyle = "#ff8800";
    ctx.font = "bold 80px Arial";
    ctx.textAlign = "center";
    ctx.fillText(config.title, canvas.width / 2, yPos);
    yPos += 60;

    ctx.fillStyle = "#cccccc";
    ctx.font = "40px Arial";
    ctx.fillText(config.description, canvas.width / 2, yPos);
    yPos += 90;

    // Draw progress bar
    const progressWidth = canvas.width - 160;
    const progressHeight = 30;
    const progressX = 80;

    ctx.fillStyle = "#333";
    ctx.fillRect(progressX, yPos, progressWidth, progressHeight);

    const progressFill =
      (progressWidth * (this.currentQuestionIndex + 1)) / this.totalQuestions;
    ctx.fillStyle = "#44aaff";
    ctx.fillRect(progressX, yPos, progressFill, progressHeight);
    yPos += 50;

    ctx.fillStyle = "#ffffff";
    ctx.font = "36px Arial";
    ctx.fillText(
      `Question ${this.currentQuestionIndex + 1} of ${this.totalQuestions}`,
      canvas.width / 2,
      yPos
    );
    yPos += 80;

    // Draw scenario tag
    ctx.fillStyle = "#44aaff";
    ctx.fillRect(100, yPos - 40, 400, 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "left";
    ctx.fillText(question.scenario, 110, yPos - 8);
    yPos += 80;

    // Draw question with text wrapping
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px Arial";
    ctx.textAlign = "center";

    // Wrap question text
    const maxWidth = canvas.width - 200; // Leave margins
    const lines = this.wrapText(ctx, question.question, maxWidth);

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], canvas.width / 2, yPos);
      yPos += 65; // Line spacing
    }
    yPos += 50; // Extra space after question

    // Draw options
    const options =
      question.type === "true-false"
        ? ["✅ True", "❌ False"]
        : question.options;

    // Store option areas for click detection
    this.optionAreas = [];

    options.forEach((option, index) => {
      // Calculate option height based on text wrapping
      ctx.font = "40px Arial";
      const optionMaxWidth = canvas.width - 240; // Leave more margin for text
      const optionLines = this.wrapText(ctx, option, optionMaxWidth);
      const optionHeight = Math.max(110, optionLines.length * 50 + 50); // Dynamic height
      const optionY = yPos;

      // Determine option color based on state
      let bgColor = "#2a2a4a";
      let borderColor = "#555";

      if (this.selectedAnswer === index) {
        bgColor = "#44aaff";
        borderColor = "#66ccff";
      }

      if (this.answerSubmitted) {
        if (index === question.correct) {
          bgColor = "#44aa44";
          borderColor = "#66cc66";
        } else if (
          index === this.selectedAnswer &&
          index !== question.correct
        ) {
          bgColor = "#aa4444";
          borderColor = "#cc6666";
        } else {
          bgColor = "#333";
          borderColor = "#555";
        }
      }

      // Draw option background
      ctx.fillStyle = bgColor;
      ctx.fillRect(100, optionY, canvas.width - 200, optionHeight);

      // Draw option border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(100, optionY, canvas.width - 200, optionHeight);

      // Draw option text with wrapping
      ctx.fillStyle = "#ffffff";
      ctx.font = "40px Arial";
      ctx.textAlign = "left";

      let textY = optionY + 45;
      for (let i = 0; i < optionLines.length; i++) {
        ctx.fillText(optionLines[i], 120, textY);
        textY += 50;
      }

      // Store click area
      this.optionAreas.push({
        x: 100,
        y: optionY,
        width: canvas.width - 200,
        height: optionHeight,
        index: index,
      });

      yPos += optionHeight + 30;
    });

    yPos += 40;

    // Draw feedback if answer submitted
    if (this.answerSubmitted) {
      const isCorrect = this.selectedAnswer === question.correct;

      // Calculate feedback height based on explanation text
      ctx.font = "32px Arial";
      const explanationMaxWidth = canvas.width - 240;
      const explanationLines = this.wrapText(
        ctx,
        question.explanation,
        explanationMaxWidth
      );
      const feedbackHeight = Math.max(220, explanationLines.length * 45 + 140);

      ctx.fillStyle = isCorrect ? "#2a4a2a" : "#4a2a2a";
      ctx.fillRect(100, yPos, canvas.width - 200, feedbackHeight);

      ctx.strokeStyle = isCorrect ? "#44aa44" : "#aa4444";
      ctx.lineWidth = 6;
      ctx.strokeRect(100, yPos, canvas.width - 200, feedbackHeight);

      ctx.fillStyle = isCorrect ? "#66cc66" : "#cc6666";
      ctx.font = "bold 46px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        isCorrect ? "✅ Correct!" : "💡 Learn:",
        canvas.width / 2,
        yPos + 60
      );

      // Draw explanation with text wrapping
      ctx.fillStyle = "#ffffff";
      ctx.font = "32px Arial";
      ctx.textAlign = "center";

      let explanationY = yPos + 120;
      for (let i = 0; i < explanationLines.length; i++) {
        ctx.fillText(explanationLines[i], canvas.width / 2, explanationY);
        explanationY += 45;
      }

      yPos += feedbackHeight + 40;
    }

    // Draw navigation buttons
    yPos += 40;

    // Store button areas for click detection
    this.buttonAreas = [];

    if (!this.answerSubmitted) {
      // Submit button
      const submitEnabled = this.selectedAnswer !== null;
      ctx.fillStyle = submitEnabled ? "#44aaff" : "#666";
      ctx.fillRect(100, yPos, 350, 100);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Submit Answer", 275, yPos + 65);

      this.buttonAreas.push({
        x: 100,
        y: yPos,
        width: 350,
        height: 100,
        type: "submit",
        enabled: submitEnabled,
      });
    } else {
      // Next button
      ctx.fillStyle = "#aa44aa";
      ctx.fillRect(canvas.width - 450, yPos, 350, 100);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px Arial";
      ctx.textAlign = "center";
      const nextText =
        this.currentQuestionIndex < this.totalQuestions - 1
          ? "Next Question"
          : "See Results";
      ctx.fillText(nextText, canvas.width - 275, yPos + 65);

      this.buttonAreas.push({
        x: canvas.width - 450,
        y: yPos,
        width: 350,
        height: 100,
        type: "next",
        enabled: true,
      });
    }

    // Update texture
    this.canvasTexture.needsUpdate = true;
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  close() {
    this.isRunning = false;

    // Stop animation loop
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
    }

    // Clean up 3D scene
    if (this.scene) {
      this.scene.clear();
    }

    // Remove renderer from DOM
    if (this.renderer && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Dispose of resources
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Dispatch close event
    window.dispatchEvent(new CustomEvent("cyberSecurityQuizClosed"));
  }

  handleResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
}

// ... existing code ...
