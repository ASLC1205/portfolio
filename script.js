document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation elements ---
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinksList = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');

  // --- Theme Toggle elements ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // --- Form elements ---
  const contactForm = document.getElementById('contact-form');

  // ==========================================
  // 1. Mobile Menu Toggle
  // ==========================================
  if (menuToggle && navLinksList) {
    menuToggle.addEventListener('click', () => {
      navLinksList.classList.toggle('active');
      // Toggle menu icon state (optional, can morph or change SVG)
      const isExpanded = navLinksList.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinksList.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', false);
      });
    });
  }

  // ==========================================
  // 2. Sticky Header & Scroll Spy (Active Links)
  // ==========================================
  const handleScroll = () => {
    // Sticky Header class toggling
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll Spy: Update active link based on scroll position
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120; // Offset for header height
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Run once on load
  handleScroll();

  // ==========================================
  // 3. Dark/Light Theme Switching
  // ==========================================
  // Load saved theme or default to system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  htmlElement.setAttribute('data-theme', initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // ==========================================
  // 4. Skills Progress Bar Animation on Scroll
  // ==========================================
  const progressBars = document.querySelectorAll('.animate-progress');

  const animateSkills = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width');
        bar.style.width = width;
        // Stop observing this element once animated
        observer.unobserve(bar);
      }
    });
  };

  // Setup intersection observer
  const skillObserver = new IntersectionObserver(animateSkills, {
    root: null, // viewport
    threshold: 0.1, // trigger when 10% visible
    rootMargin: '0px 0px -50px 0px' // offset trigger point slightly
  });

  progressBars.forEach(bar => {
    skillObserver.observe(bar);
  });

  // ==========================================
  // 5. Contact Form Submission Handling (Telegram Background Notification)
  // ==========================================
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve form values
      const firstName = document.getElementById('first-name').value.trim();
      const lastName = document.getElementById('last-name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const message = document.getElementById('message').value.trim();

      // Basic validation check
      if (!firstName || !lastName || !email || !message) {
        alert('Please fill out all required fields.');
        return;
      }

      // TELEGRAM BOT CONFIGURATION
      // 1. Create a bot by messaging @BotFather on Telegram and copy the API Token
      // 2. Find your Chat ID by messaging @GetIDBot or @userinfobot on Telegram
      const botToken = "8538263353:AAGnJ4N0pt_8Jzfn_CsUxI06XVRXP6YS7n4"; 
      const chatId = "5751263547";

      // Formulate formatted message text (supports markdown)
      const fullName = `${firstName} ${lastName}`;
      const textMessage = 
        `*New Portfolio Inquiry*\n\n` +
        `👤 *Name:* ${fullName}\n` +
        `✉️ *Email:* ${email}\n` +
        `📞 *Phone:* ${phone || 'Not provided'}\n\n` +
        `📝 *Message:* ${message}`;

      // Encode the text message for URL safety
      const encodedMessage = encodeURIComponent(textMessage);
      
      // Show sending state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending Message...';
      submitBtn.disabled = true;

      // If Telegram is configured, send silently in the background
      if (botToken && botToken.trim() !== "" && chatId && chatId.trim() !== "") {
        const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=Markdown`;
        
        fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
            if (data.ok) {
              alert(`Thank you, ${firstName}! Your message has been sent successfully.`);
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
              contactForm.reset();
            } else {
              console.error('Telegram API error response:', data);
              throw new Error(data.description || 'Unknown Telegram Error');
            }
          })
          .catch((err) => {
            console.error('Telegram background delivery failed:', err);
            // Fallback to WhatsApp direct redirect if Telegram fails
            alert('Silent message delivery failed. Redirecting to WhatsApp...');
            const whatsappNumber = "916301132889";
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            contactForm.reset();
          });
      } else {
        // Fallback: If Telegram is not configured, redirect to direct WhatsApp click-to-chat
        const whatsappNumber = "916301132889";
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        contactForm.reset();
      }
    });
  }

  // ==========================================
  // 6. Interactive QA & AI Console Simulation
  // ==========================================
  const sdetTabBtn = document.getElementById('btn-sdet-tab');
  const yoloTabBtn = document.getElementById('btn-yolo-tab');
  const sdetTabContent = document.getElementById('tab-sdet');
  const yoloTabContent = document.getElementById('tab-yolo');
  
  const runSdetBtn = document.getElementById('run-sdet-btn');
  const runYoloBtn = document.getElementById('run-yolo-btn');
  
  const sdetLogLines = document.getElementById('sdet-log-lines');
  const yoloContainer = document.getElementById('yolo-container');
  const yoloJson = document.getElementById('yolo-json');

  // Tab switching logic
  if (sdetTabBtn && yoloTabBtn) {
    sdetTabBtn.addEventListener('click', () => {
      sdetTabBtn.classList.add('active');
      yoloTabBtn.classList.remove('active');
      sdetTabContent.classList.add('active');
      yoloTabContent.classList.remove('active');
    });

    yoloTabBtn.addEventListener('click', () => {
      yoloTabBtn.classList.add('active');
      sdetTabBtn.classList.remove('active');
      yoloTabContent.classList.add('active');
      sdetTabContent.classList.remove('active');
    });
  }

  // SDET logs simulation array
  const sdetLogs = [
    { text: "[INFO] Connecting to remote Selenium WebDriver node...", type: "info" },
    { text: "[INFO] Grid capabilities matching: {browser: Chrome, headless: true}", type: "info" },
    { text: "[PASS] Test 1: Navigation check - Portfolio resolved (145ms)", type: "pass" },
    { text: "[PASS] Test 2: UI Responsiveness check - Mobile hamburger view toggle", type: "pass" },
    { text: "[PASS] Test 3: Element visibility state verification - Social profiles", type: "pass" },
    { text: "[PASS] Test 4: Form Input values injection & email format check - OK", type: "pass" },
    { text: "[WARN] Implicit wait statement found in Page Object Model; optimized using Explicit Dynamic wait.", type: "warn" },
    { text: "[PASS] Test 5: Verify JIRA API integration hook - Defect logs sync verified", type: "pass" },
    { text: "[PASS] Test 6: Database integration test for User record - OK", type: "pass" },
    { text: "[INFO] Tear Down: Disconnecting Selenium Grid node. Passing reports to JUnit output stream.", type: "info" },
    { text: "--------------------------------------------------------------------------------", type: "info" },
    { text: "[SUCCESS] Execution complete. 6/6 tests PASSED in 1.34s.", type: "bold" }
  ];

  // Run SDET Suite Simulation
  if (runSdetBtn && sdetLogLines) {
    runSdetBtn.addEventListener('click', () => {
      runSdetBtn.disabled = true;
      runSdetBtn.textContent = 'Executing Tests...';
      sdetLogLines.innerHTML = '';
      
      let lineIndex = 0;
      
      const printNextLine = () => {
        if (lineIndex < sdetLogs.length) {
          const log = sdetLogs[lineIndex];
          const div = document.createElement('div');
          div.className = `log-entry ${log.type}`;
          div.textContent = log.text;
          sdetLogLines.appendChild(div);
          
          // Auto scroll terminal output
          const outputDiv = document.getElementById('sdet-log');
          if (outputDiv) {
            outputDiv.scrollTop = outputDiv.scrollHeight;
          }
          
          lineIndex++;
          setTimeout(printNextLine, 220); // 220ms per line print
        } else {
          runSdetBtn.disabled = false;
          runSdetBtn.textContent = 'Run Test Suite';
        }
      };
      
      printNextLine();
    });
  }

  // Run YOLO Inference Simulation
  if (runYoloBtn && yoloContainer && yoloJson) {
    runYoloBtn.addEventListener('click', () => {
      runYoloBtn.disabled = true;
      runYoloBtn.textContent = 'Analyzing...';
      
      yoloContainer.classList.remove('detected');
      yoloContainer.classList.add('scanning');
      yoloJson.textContent = '// Initializing YOLOv7 weights file...\n// Parsing input stream dimensions: 1920x1080\n// Running real-time inference...';
      
      setTimeout(() => {
        yoloContainer.classList.remove('scanning');
        yoloContainer.classList.add('detected');
        
        const mockJson = {
          "inference_status": "success",
          "model": "YOLOv7-plate-detection",
          "model_resolution": "640x640",
          "fps_inference": 34.2,
          "detections": [
            {
              "class_label": "license-plate",
              "confidence_score": 0.924,
              "text_read": "AP 26 AX 9999",
              "bounding_box": {
                "x_min": 242,
                "y_min": 185,
                "width": 96,
                "height": 32
              }
            }
          ],
          "regression_test_status": "PASSED"
        };
        
        yoloJson.textContent = JSON.stringify(mockJson, null, 2);
        
        runYoloBtn.disabled = false;
        runYoloBtn.textContent = 'Analyze Video Stream';
      }, 2000); // 2 second scan
    });
  }
});
