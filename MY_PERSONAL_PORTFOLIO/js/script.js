/**
 * SANIKA YOGESH MAHAJAN — PORTFOLIO JAVASCRIPT
 * Interactive Logic, Typing Animation, Filter, Modal & Form Validation
 * CodeAlpha Frontend Web Development Internship
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Dynamic Typing Effect in Hero Section
  // -------------------------------------------------------------------------
  const typingElement = document.getElementById('dynamic-typing-text');
  const roles = [
    'Frontend Developer',
    'CodeAlpha Intern',
    'UI/UX Enthusiast',
    'JavaScript Specialist',
    'Responsive Web Designer'
  ];
  
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingDelay = 120;

  function typeEffect() {
    if (!typingElement) return;

    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typingElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingDelay = 60;
    } else {
      typingElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingDelay = 130;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at full word
      typingDelay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingDelay = 400;
    }

    setTimeout(typeEffect, typingDelay);
  }

  typeEffect();

  // -------------------------------------------------------------------------
  // 2. Light / Dark Theme Switcher (Default: Light)
  // -------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const htmlRoot = document.documentElement;

  // Check saved preference or default to light
  const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      showToast(newTheme === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
    });
  }

  function applyTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      }
    }
  }

  // -------------------------------------------------------------------------
  // 3. Navbar Scroll Effect & Active Section Spy
  // -------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // Header shadow on scroll
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // ScrollSpy active link detection
    let currentSection = '';
    const scrollPosition = window.pageYOffset + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // -------------------------------------------------------------------------
  // 4. Mobile Drawer Menu Navigation
  // -------------------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const drawerOverlay = document.getElementById('drawer-overlay');

  function openMenu() {
    navMenu?.classList.add('open');
    drawerOverlay?.classList.add('active');
    hamburgerBtn?.classList.add('active');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu?.classList.remove('open');
    drawerOverlay?.classList.remove('active');
    hamburgerBtn?.classList.remove('active');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburgerBtn?.addEventListener('click', () => {
    const isOpen = navMenu?.classList.contains('open');
    if (isOpen) closeMenu();
    else openMenu();
  });

  drawerOverlay?.addEventListener('click', closeMenu);

  // Smooth Scroll with Header Offset for All Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#' || targetId === '#!') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        closeMenu();
        
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Update URL hash without jumping
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // 5. Projects Filter Tabs
  // -------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active filter button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategories = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || cardCategories.includes(filterValue)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  // 6. Project Modal Case Studies Data & Trigger
  // -------------------------------------------------------------------------
  const projectModal = document.getElementById('project-modal');
  const projectModalTitle = document.getElementById('project-modal-title');
  const projectModalContent = document.getElementById('project-modal-content');
  const closeProjectModalBtn = document.getElementById('close-project-modal');

  const projectDetails = {
    medikiosk: {
      title: 'MediKiosk – AI-Powered Patient Case-Taking Software',
      badge: 'Smart India Hackathon 2025 | Ministry of AYUSH',
      description: 'An end-to-end patient-facing clinical intake system that collects comprehensive medical history through speech and touchscreen interactions, digitizes physical medical records using OCR, and formats structured physician-ready clinical summaries compliant with ABDM/HIS standards.',
      features: [
        'Multilingual voice intake with real-time speech-to-text and adaptive questioning',
        'AYUSH-specific clinical history parameter collection and chronological medical timeline',
        'OCR integration for legacy medical record digitizing and entity extraction',
        'Red-flag symptom detection and physician dashboard with Accept / Edit / Reject workflow'
      ],
      tech: ['React Native', 'React.js', 'Node.js', 'Express.js', 'Speech-to-Text', 'OCR', 'LLM', 'FHIR Standards'],
      liveUrl: '#',
      githubUrl: 'https://github.com/mahajansanika0704-collab'
    },
    vedasetu: {
      title: 'Vedasetu – AI-Powered Internship Intelligence & Management Platform',
      badge: 'Team: AlphaStack',
      description: 'A full-scale ecosystem connecting students, academic faculty mentors, and hiring organizations to orchestrate the entire lifecycle of student internships: discovery, application, compliance verification, and certification.',
      features: [
        'Role-based multi-portal architecture (Student, Faculty, Company, Administrator)',
        'AI recommendation engine matching students with internships based on skill-gap analysis',
        'Geo-tagged photo attendance with live webcam capture and GPS watermarking',
        'Transparent rule-based at-risk student detection and automated AI weekly summary reports',
        'QR-code verifiable certificate issuance upon successful evaluation'
      ],
      tech: ['React.js', 'Node.js', 'Express.js', 'Supabase', 'PostgreSQL', 'AI Recommendation Engine'],
      liveUrl: '#',
      githubUrl: 'https://github.com/mahajansanika0704-collab'
    },
    taskflow: {
      title: 'TaskFlow — Modern Kanban & Productivity Hub',
      badge: 'Productivity Application',
      description: 'TaskFlow is an intuitive productivity dashboard designed for engineering teams and individuals. It mimics advanced project management tools with smooth drag-and-drop mechanics and local persistence.',
      features: [
        'Draggable Kanban columns (To Do, In Progress, Review, Completed)',
        'Local Storage synchronization for uninterrupted state saving',
        'Custom task priority color tags and due date alerts',
        'Search and filter tasks dynamically by assignee or urgency'
      ],
      tech: ['HTML5', 'CSS3 Flexbox/Grid', 'JavaScript (ES6+)', 'Web Storage API'],
      liveUrl: '#',
      githubUrl: 'https://github.com/mahajansanika0704-collab'
    },
    portfolio: {
      title: 'Personal Developer Portfolio Website',
      badge: 'CodeAlpha Task 1',
      description: 'The flagship personal portfolio website created for Sanika Yogesh Mahajan as part of the CodeAlpha Frontend Web Development internship. Demonstrates strong UI/UX principles, accessibility standards, and performant vanilla frontend architecture.',
      features: [
        'Curated modern Light Theme with full Dark Mode switch capability',
        'Interactive Typing animation with custom cursor dynamics',
        'Filterable project gallery with modal case studies',
        'Print-optimized full resume preview modal and direct download',
        'Form validation adhering to modern web guidelines and zero external bloat'
      ],
      tech: ['HTML5 Semantic Markup', 'Modern CSS Variables', 'Vanilla JavaScript', 'Font Awesome 6'],
      liveUrl: '#home',
      githubUrl: 'https://github.com/mahajansanika0704-collab'
    },
    ecommerce: {
      title: 'LuxeStore — Responsive Apparel & Fashion Store',
      badge: 'E-Commerce Frontend',
      description: 'A contemporary e-commerce storefront delivering a luxury shopping experience. Features instant price calculation, dynamic product catalogs, and an animated sliding cart drawer.',
      features: [
        'Interactive sliding side-drawer cart with item count & total cost updates',
        'Multi-category filtering (Men, Women, Accessories, Shoes)',
        'Responsive product cards with zoom-on-hover effect',
        'Instant toast alerts when products are added or removed'
      ],
      tech: ['JavaScript DOM', 'CSS Transitions', 'Flexbox Layout', 'SVG Icons'],
      liveUrl: '#',
      githubUrl: 'https://github.com/mahajansanika0704-collab'
    },
    weather: {
      title: 'SkyCast — Real-time Weather & Forecast Dashboard',
      badge: 'API Integration',
      description: 'A dynamic weather application communicating with live weather REST APIs. Provides comprehensive meteorological insights with clean visuals and responsive design.',
      features: [
        'Current weather conditions, humidity, wind velocity, and UV index',
        '5-Day forecast breakdown with weather condition icons',
        'City search with auto-suggest and browser Geolocation support',
        'Adaptive background gradients matching current time & weather status'
      ],
      tech: ['Async/Await Fetch API', 'JSON Parsing', 'CSS Grid', 'Geolocation API'],
      liveUrl: '#',
      githubUrl: 'https://github.com/mahajansanika0704-collab'
    }
  };

  document.querySelectorAll('.quick-view-btn, .quick-view-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const projectKey = trigger.getAttribute('data-project');
      const data = projectDetails[projectKey];

      if (data && projectModal && projectModalContent) {
        projectModalTitle.textContent = data.title;
        projectModalContent.innerHTML = `
          <div style="margin-bottom: 1.25rem;">
            <span style="display:inline-block; padding: 0.3rem 0.8rem; background: var(--accent-primary-light); color: var(--accent-primary); border-radius: 99px; font-weight: 700; font-size: 0.82rem; margin-bottom: 0.75rem;">
              ${data.badge}
            </span>
            <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">
              ${data.description}
            </p>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-size: 1.05rem; margin-bottom: 0.75rem; color: var(--text-primary); font-weight: 700;">Key Implementation Highlights</h4>
            <ul style="padding-left: 1.25rem; color: var(--text-muted); font-size: 0.92rem; display: flex; flex-direction: column; gap: 0.45rem;">
              ${data.features.map(f => `<li><i class="fa-solid fa-check" style="color: var(--accent-emerald); margin-right: 0.4rem;"></i> ${f}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-bottom: 1.75rem;">
            <h4 style="font-size: 1.05rem; margin-bottom: 0.75rem; color: var(--text-primary); font-weight: 700;">Tech Stack</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${data.tech.map(t => `<span style="font-size: 0.8rem; font-weight: 600; padding: 0.3rem 0.7rem; background: var(--bg-tertiary); border: 1px solid var(--card-border); border-radius: 6px; color: var(--text-primary);">${t}</span>`).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 1rem; padding-top: 1.25rem; border-top: 1px solid var(--card-border);">
            <a href="${data.liveUrl}" class="btn btn-primary">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Live Demonstration</span>
            </a>
            <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
              <i class="fa-brands fa-github"></i>
              <span>View Repository</span>
            </a>
          </div>
        `;
        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeProjectModalBtn?.addEventListener('click', () => {
    projectModal?.classList.remove('active');
    document.body.style.overflow = '';
  });

  projectModal?.addEventListener('click', (e) => {
    if (e.target === projectModal) {
      projectModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // -------------------------------------------------------------------------
  // 7. Resume Modal & Print Preview Trigger
  // -------------------------------------------------------------------------
  const resumeModal = document.getElementById('resume-modal');
  const closeResumeModalBtn = document.getElementById('close-resume-modal');
  const printResumeBtn = document.getElementById('print-resume-btn');

  const resumeTriggers = [
    document.getElementById('view-resume-nav-btn'),
    document.getElementById('hero-resume-btn'),
    document.getElementById('about-open-resume-btn')
  ];

  resumeTriggers.forEach(trigger => {
    trigger?.addEventListener('click', (e) => {
      e.preventDefault();
      resumeModal?.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  closeResumeModalBtn?.addEventListener('click', () => {
    resumeModal?.classList.remove('active');
    document.body.style.overflow = '';
  });

  resumeModal?.addEventListener('click', (e) => {
    if (e.target === resumeModal) {
      resumeModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  printResumeBtn?.addEventListener('click', () => {
    window.print();
  });

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      projectModal?.classList.remove('active');
      resumeModal?.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // -------------------------------------------------------------------------
  // 8. Contact Form Validation & Submission
  // -------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('user-name');
  const emailInput = document.getElementById('user-email');
  const messageInput = document.getElementById('user-message');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      setFieldError(nameInput, true);
      isValid = false;
    } else {
      setFieldError(nameInput, false);
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      setFieldError(emailInput, true);
      isValid = false;
    } else {
      setFieldError(emailInput, false);
    }

    // Validate Message
    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      setFieldError(messageInput, true);
      isValid = false;
    } else {
      setFieldError(messageInput, false);
    }

    if (isValid) {
      const submitBtn = document.getElementById('submit-form-btn');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
        contactForm.reset();
        showToast('🎉 Thank you! Your message has been sent to Sanika successfully.');
      }, 900);
    }
  });

  function setFieldError(inputElement, hasError) {
    const parentGroup = inputElement.closest('.form-group');
    if (parentGroup) {
      if (hasError) parentGroup.classList.add('has-error');
      else parentGroup.classList.remove('has-error');
    }
  }

  // Clear errors on typing
  [nameInput, emailInput, messageInput].forEach(input => {
    input?.addEventListener('input', () => {
      setFieldError(input, false);
    });
  });

  // -------------------------------------------------------------------------
  // 9. One-Click Copy Email to Clipboard
  // -------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const emailText = 'mahajansanika0704@gmail.com';

  copyEmailBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(emailText);
      showToast('📋 Email copied to clipboard: ' + emailText);
      copyEmailBtn.innerHTML = '<i class="fa-solid fa-check" style="color: var(--accent-emerald);"></i>';
      setTimeout(() => {
        copyEmailBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
      }, 2000);
    } catch (err) {
      showToast('Email: ' + emailText);
    }
  });

  // -------------------------------------------------------------------------
  // 10. Toast Notification System
  // -------------------------------------------------------------------------
  function showToast(message, duration = 3500) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check toast-icon"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

});
