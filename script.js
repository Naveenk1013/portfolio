// ===============================================
// Modern Futuristic Portfolio - JavaScript
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
  
  // ===============================================
  // Loading Screen
  // ===============================================
  const loaderWrapper = document.querySelector('.loader-wrapper');
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      loaderWrapper.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }, 2500);
  });

  // ===============================================
  // Custom Cursor
  // ===============================================
  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function animateCursor() {
    // Smooth cursor movement
    cursorX += (mouseX - cursorX) * 0.3;
    cursorY += (mouseY - cursorY) * 0.3;
    
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
  
  // Cursor interactions
  const interactiveElements = document.querySelectorAll('a, button, .skill-card, .project-card, .nav-link');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorFollower.classList.add('active');
    });
    
    el.addEventListener('mouseleave', () => {
      cursorFollower.classList.remove('active');
    });
  });

  // ===============================================
  // Particles.js Configuration
  // ===============================================
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#00f7ff'
        },
        shape: {
          type: 'circle'
        },
        opacity: {
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#00f7ff',
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'grab'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 0.5
            }
          },
          push: {
            particles_nb: 4
          }
        }
      },
      retina_detect: true
    });
  }

  // ===============================================
  // Navigation
  // ===============================================
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  
  // Scroll behavior
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add scrolled class
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Hide/show navbar
    if (currentScroll > lastScroll && currentScroll > 100) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    
    lastScroll = currentScroll;
    
    // Active section highlighting
    updateActiveSection();
  });
  
  // Mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
      document.body.style.overflow = navLinksContainer.classList.contains('active') ? 'hidden' : 'auto';
    });
  }
  
  // Smooth scroll for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (navLinksContainer.classList.contains('active')) {
          mobileMenuToggle.classList.remove('active');
          navLinksContainer.classList.remove('active');
          document.body.style.overflow = 'auto';
        }
      }
    });
  });
  
  // Update active section
  function updateActiveSection() {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.pageYOffset + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ===============================================
  // Typing Effect for Hero Section
  // ===============================================
  const typedTextElement = document.querySelector('.typed-text');
  const typedCursor = document.querySelector('.typed-cursor');
  
  const textArray = [
    'M.Sc. Hospitality Administration',
    'HR Specialist',
    'Educational Technology Enthusiast',
    'Web Developer',
    'Creative Designer'
  ];
  
  let textArrayIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  
  function type() {
    const currentText = textArray[textArrayIndex];
    
    if (isDeleting) {
      typedTextElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typedTextElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentText.length) {
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textArrayIndex = (textArrayIndex + 1) % textArray.length;
      typingSpeed = 500;
    }
    
    setTimeout(type, typingSpeed);
  }
  
  if (typedTextElement) {
    setTimeout(type, 1000);
  }

  // ===============================================
  // AOS (Animate On Scroll) Initialization
  // ===============================================
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
      easing: 'ease-in-out'
    });
  }

  // ===============================================
  // Counter Animation for Stats
  // ===============================================
  const statNumbers = document.querySelectorAll('.stat-number');
  
  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };
    
    updateCounter();
  }
  
  // Intersection Observer for counter animation
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        animateCounter(entry.target);
        entry.target.classList.add('counted');
      }
    });
  }, observerOptions);
  
  statNumbers.forEach(stat => {
    counterObserver.observe(stat);
  });

  // ===============================================
  // Parallax Effect for Sections
  // ===============================================
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    // Parallax for hero elements
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');
    
    if (heroContent) {
      heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
    
    if (heroImage) {
      heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
  });

  // ===============================================
  // Magnetic Effect for Cards
  // ===============================================
  const magneticElements = document.querySelectorAll('.skill-card, .project-card, .experience-card, .timeline-content');
  
  magneticElements.forEach(elem => {
    elem.addEventListener('mousemove', (e) => {
      const rect = elem.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;
      
      const moveX = deltaX * 10;
      const moveY = deltaY * 10;
      
      elem.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.02)`;
    });
    
    elem.addEventListener('mouseleave', () => {
      elem.style.transform = 'translate(0, 0) scale(1)';
    });
  });

  // ===============================================
  // 3D Tilt Effect for Project Cards
  // ===============================================
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  // ===============================================
  // Form Handling
  // ===============================================
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(contactForm);
      const formInputs = contactForm.querySelectorAll('.form-input');
      
      // Simple validation
      let isValid = true;
      formInputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = 'var(--secondary)';
        } else {
          input.style.borderColor = 'var(--primary)';
        }
      });
      
      if (isValid) {
        // Show success message
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<span>Message Sent!</span> <i class="fas fa-check"></i>';
        submitBtn.style.background = 'linear-gradient(135deg, #00f093, #00d9ff)';
        
        // Reset form
        setTimeout(() => {
          contactForm.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
        }, 3000);
      }
    });
    
    // Real-time validation
    const formInputs = contactForm.querySelectorAll('.form-input');
    formInputs.forEach(input => {
      input.addEventListener('blur', () => {
        if (!input.value.trim()) {
          input.style.borderColor = 'var(--secondary)';
        } else {
          input.style.borderColor = 'var(--primary)';
        }
      });
      
      input.addEventListener('focus', () => {
        input.style.borderColor = 'var(--primary)';
      });
    });
  }

  // ===============================================
  // Scroll Reveal Effect
  // ===============================================
  const revealElements = document.querySelectorAll('.skill-card, .project-card, .timeline-item');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('fade-in');
        }, index * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px'
  });
  
  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // ===============================================
  // Smooth Scroll Progress Indicator
  // ===============================================
  function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: var(--gradient-primary);
      width: 0%;
      z-index: 10000;
      transition: width 0.1s ease;
      box-shadow: var(--glow-primary);
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.pageYOffset / windowHeight) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }
  
  createScrollProgress();

  // ===============================================
  // Back to Top Button
  // ===============================================
  function createBackToTop() {
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      background: var(--gradient-primary);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;
      box-shadow: 0 5px 20px rgba(0, 247, 255, 0.4);
    `;
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 500) {
        backToTop.style.opacity = '1';
        backToTop.style.visibility = 'visible';
      } else {
        backToTop.style.opacity = '0';
        backToTop.style.visibility = 'hidden';
      }
    });
    
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    backToTop.addEventListener('mouseenter', () => {
      backToTop.style.transform = 'scale(1.1) translateY(-5px)';
      backToTop.style.boxShadow = '0 10px 30px rgba(0, 247, 255, 0.6)';
    });
    
    backToTop.addEventListener('mouseleave', () => {
      backToTop.style.transform = 'scale(1) translateY(0)';
      backToTop.style.boxShadow = '0 5px 20px rgba(0, 247, 255, 0.4)';
    });
  }
  
  createBackToTop();

  // ===============================================
  // Dynamic Background Movement
  // ===============================================
  const gradientSpheres = document.querySelectorAll('.gradient-sphere');
  
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    gradientSpheres.forEach((sphere, index) => {
      const speed = (index + 1) * 0.02;
      const x = (mouseX - 0.5) * 100 * speed;
      const y = (mouseY - 0.5) * 100 * speed;
      
      sphere.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  // ===============================================
  // Image Lazy Loading
  // ===============================================
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });

  // ===============================================
  // Enhanced Timeline Animation
  // ===============================================
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
        
        const dot = entry.target.querySelector('.timeline-dot');
        if (dot) {
          setTimeout(() => {
            dot.style.animation = 'pulse 1s ease-in-out infinite';
          }, 500);
        }
      }
    });
  }, {
    threshold: 0.3
  });
  
  timelineItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transition = 'all 0.8s ease';
    
    if (index % 2 === 0) {
      item.style.transform = 'translateX(-50px)';
    } else {
      item.style.transform = 'translateX(50px)';
    }
    
    timelineObserver.observe(item);
  });

  // ===============================================
  // Skill Card Interaction Enhancement
  // ===============================================
  const skillCards = document.querySelectorAll('.skill-card');
  
  skillCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.add('clicked');
      
      setTimeout(() => {
        card.classList.remove('clicked');
      }, 600);
    });
  });
  
  // Add CSS for clicked animation
  const style = document.createElement('style');
  style.textContent = `
    .skill-card.clicked {
      animation: cardPulse 0.6s ease;
    }
    
    @keyframes cardPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); box-shadow: 0 20px 50px rgba(0, 247, 255, 0.5); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 247, 255, 0.7); }
      50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(0, 247, 255, 0); }
    }
  `;
  document.head.appendChild(style);

  // ===============================================
  // Easter Egg - Konami Code
  // ===============================================
  let konamiCode = [];
  const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-konamiPattern.length);
    
    if (konamiCode.join(',') === konamiPattern.join(',')) {
      activateEasterEgg();
    }
  });
  
  function activateEasterEgg() {
    // Create confetti effect
    const colors = ['#00f7ff', '#ff006e', '#8338ec'];
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}vw;
        opacity: 1;
        z-index: 10000;
        pointer-events: none;
        animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
        transform: rotate(${Math.random() * 360}deg);
      `;
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
    
    // Add confetti animation
    if (!document.getElementById('confetti-style')) {
      const confettiStyle = document.createElement('style');
      confettiStyle.id = 'confetti-style';
      confettiStyle.textContent = `
        @keyframes confettiFall {
          to {
            top: 100vh;
            transform: rotate(${360 + Math.random() * 360}deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(confettiStyle);
    }
    
    // Show message
    const message = document.createElement('div');
    message.textContent = '🎉 You found the secret! 🎉';
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--gradient-primary);
      padding: 30px 50px;
      border-radius: 20px;
      font-size: 2rem;
      font-weight: bold;
      z-index: 10001;
      animation: fadeInScale 0.5s ease;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.style.animation = 'fadeOut 0.5s ease forwards';
      setTimeout(() => message.remove(), 500);
    }, 3000);
  }

  // ===============================================
  // Performance Optimization
  // ===============================================
  // Debounce function for scroll events
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Throttle function for intensive operations
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ===============================================
  // Keyboard Navigation
  // ===============================================
  document.addEventListener('keydown', (e) => {
    // Alt + H: Go to home
    if (e.altKey && e.key === 'h') {
      e.preventDefault();
      document.querySelector('#home').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Alt + E: Go to experience
    if (e.altKey && e.key === 'e') {
      e.preventDefault();
      document.querySelector('#experience').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Alt + S: Go to skills
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      document.querySelector('#skills').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Alt + P: Go to projects
    if (e.altKey && e.key === 'p') {
      e.preventDefault();
      document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Alt + C: Go to contact
    if (e.altKey && e.key === 'c') {
      e.preventDefault();
      document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
    }
  });

  // ===============================================
  // Print Optimization
  // ===============================================
  window.addEventListener('beforeprint', () => {
    // Expand all sections for printing
    document.body.classList.add('printing');
  });
  
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
  });

  // ===============================================
  // Console Easter Egg
  // ===============================================
  console.log('%c🚀 Welcome to Naveen Kumar\'s Portfolio!', 'color: #00f7ff; font-size: 20px; font-weight: bold;');
  console.log('%cInterested in the code? Check out my GitHub!', 'color: #8338ec; font-size: 14px;');
  console.log('%cHint: Try the Konami Code (↑↑↓↓←→←→BA) for a surprise!', 'color: #ff006e; font-size: 12px;');

  // ===============================================
  // Initialize All Features
  // ===============================================
  console.log('Portfolio loaded successfully! ✨');
  
});

// ===============================================
// Service Worker Registration (for PWA)
// ===============================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment when you create a service worker file
    // navigator.serviceWorker.register('/sw.js')
    //   .then(registration => console.log('SW registered:', registration))
    //   .catch(error => console.log('SW registration failed:', error));
  });
}