class ReelControlsManager {
  constructor(containerElement, interactiveElements = []) {
    this.container = containerElement;
    this.interactiveElements = interactiveElements;
    this.timer = null;
    this.state = 'Closed';
    this.IDLE_TIMEOUT = 500;

    this.handleInteraction = this.handleInteraction.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    if (this.container) {
      this.container.addEventListener('mousemove', this.handleInteraction);
      this.container.addEventListener('mouseenter', this.handleInteraction);
      this.container.addEventListener('mouseleave', this.handleInteraction);
      this.container.addEventListener('click', this.handleInteraction);
      this.container.addEventListener('touchstart', this.handleInteraction, { passive: true });
      this.container.addEventListener('touchmove', this.handleInteraction, { passive: true });
      this.container.addEventListener('keydown', this.handleKeydown);
      this.container.addEventListener('focusin', this.handleInteraction);
    }
  }

  transitionTo(newState) {
    if (this.state === 'Closed' && newState !== 'Opening') return;
    this.state = newState;
    this.evaluate();
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.clearTimer();
      this.showControls();
    } else {
      this.evaluate();
    }
  }

  handleInteraction(e) {
    if (this.state === 'Closed') return;
    this.showControls();
    this.startTimerIfApplicable();
  }

  handleKeydown(e) {
    if (this.state === 'Closed') return;
    const wakeKeys = ['Tab', 'Escape', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' ', 'Enter'];
    if (wakeKeys.includes(e.key) || e.shiftKey) {
      this.showControls();
      this.startTimerIfApplicable();
    }
  }

  evaluate() {
    switch (this.state) {
      case 'Opening':
      case 'Paused':
      case 'Buffering':
      case 'Seeking':
      case 'Ended':
      case 'Error':
        this.clearTimer();
        this.showControls();
        break;
      case 'Playing':
        this.showControls();
        this.startTimerIfApplicable();
        break;
      case 'Closed':
        this.clearTimer();
        break;
    }
  }

  startTimerIfApplicable() {
    this.clearTimer();
    if (this.state === 'Playing' && !document.hidden) {
      this.timer = setTimeout(() => {
        this.hideControls();
      }, this.IDLE_TIMEOUT);
    }
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  showControls() {
    if (this.container) {
      this.container.classList.remove('idle');
    }
    this.interactiveElements.forEach(el => {
      if (el) el.removeAttribute('tabindex');
    });
  }

  hideControls() {
    if (this.container) {
      this.container.classList.add('idle');
    }
    this.interactiveElements.forEach(el => {
      if (el) el.setAttribute('tabindex', '-1');
    });
  }

  destroy() {
    this.transitionTo('Closed');
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    if (this.container) {
      this.container.removeEventListener('mousemove', this.handleInteraction);
      this.container.removeEventListener('mouseenter', this.handleInteraction);
      this.container.removeEventListener('mouseleave', this.handleInteraction);
      this.container.removeEventListener('click', this.handleInteraction);
      this.container.removeEventListener('touchstart', this.handleInteraction);
      this.container.removeEventListener('touchmove', this.handleInteraction);
      this.container.removeEventListener('keydown', this.handleKeydown);
      this.container.removeEventListener('focusin', this.handleInteraction);
    }
  }
}

// Global Interaction Detection
['scroll', 'touchstart', 'click'].forEach(evt => {
  window.addEventListener(evt, () => {
    if (!document.body.classList.contains('user-interacted')) {
      document.body.classList.add('user-interacted');
    }
  }, { passive: true, once: true });
});

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Text Splitting
  initSplitText();

  // Initialize Custom Cursor
  initCustomCursor();

  // Initialize Background Bokeh Particles
  initBokehParticles();

  // Initialize Preloader & Entrance Animation
  initPreloader();

  // Initialize Magnetic Buttons
  initMagneticButtons();

  // Initialize 3D Card Hover & Parallax
  init3DTilt();

  // Initialize Mobile Menu
  initMobileMenu();

  // Initialize Slideshow
  initHeroSlideshow();

  // Initialize Global Video Hover
  initVideoHover();
});

function initVideoHover() {
  document.querySelectorAll('.detail-card, .video-card').forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;

    card.addEventListener('mouseenter', () => {
      video.play().catch(() => { });
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
    });
  });
}

/* 1. Split Text Utility */
function initSplitText() {
  const titleLines = document.querySelectorAll('.hero-title .anim-line');
  titleLines.forEach(line => {
    const text = line.textContent.trim();
    // Split by space
    const words = text.split(/\s+/);
    line.innerHTML = ''; // clear

    words.forEach((word, idx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word-wrapper';

      const innerSpan = document.createElement('span');
      innerSpan.className = 'word-inner';
      innerSpan.textContent = word + (idx < words.length - 1 ? '\u00A0' : ''); // keep non-breaking space

      wordSpan.appendChild(innerSpan);
      line.appendChild(wordSpan);
    });
  });
}

/* 2. Custom Cursor */
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  const follower = document.getElementById('cursorFollower');

  if (!cursor || !follower) return;

  let posX = 0, posY = 0;
  let mouseX = 0, mouseY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Instantly position main dot
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // Hide custom cursor on touch screens
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    return;
  }

  // Smoothly follow the mouse coordinates
  gsap.ticker.add(() => {
    posX += (mouseX - posX) * 0.15;
    posY += (mouseY - posY) * 0.15;

    follower.style.left = `${posX}px`;
    follower.style.top = `${posY}px`;
  });

  // Add hover effects
  const hoverables = document.querySelectorAll('a, button, .nav-logo, .dropdown-toggle, .btn');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hovering-link');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovering-link');
    });
  });
}

/* 3. Preloader & Entrance Animation */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const preloaderText = document.getElementById('preloaderText');
  const progressEl = document.getElementById('preloaderProgress');
  const appContainer = document.querySelector('.app-container');

  if (!preloader) return;

  if (sessionStorage.getItem('hasSeenPreloader')) {
    preloader.style.display = 'none';
    if (appContainer) appContainer.style.opacity = '1';
    startEntranceTimeline();
    return;
  }

  sessionStorage.setItem('hasSeenPreloader', 'true');

  let progress = 0;

  // Entrance fade of loader text
  gsap.to(preloaderText, {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: 'power3.out',
    onComplete: () => {
      simulateProgress();
    }
  });

  function simulateProgress() {
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        hideLoader();
      }
      progressEl.style.width = `${progress}%`;
    }, 70);
  }

  function hideLoader() {
    const tl = gsap.timeline({
      onComplete: () => {
        preloader.style.display = 'none';
        startEntranceTimeline();
      }
    });

    tl.to(preloaderText, {
      opacity: 0,
      y: -30,
      duration: 0.6,
      ease: 'power3.in'
    })
      .to(preloader, {
        y: '-100%',
        duration: 1,
        ease: 'power4.inOut'
      }, '-=0.2')
      .to(appContainer, {
        opacity: 1,
        duration: 0.1
      }, '-=1.0');
  }
}

function startEntranceTimeline() {
  const tl = gsap.timeline();

  // 1. Reveal navigation bar
  tl.to('#navbar', {
    y: '0%',
    duration: 1.2,
    ease: 'power4.out'
  });

  // 2. Reveal the hero badge tag
  tl.to('#heroBadge', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out'
  }, '-=0.8');

  // 3. Stagger reveal titles
  tl.to('.word-inner', {
    y: '0%',
    duration: 1.4,
    ease: 'power4.out',
    stagger: 0.035
  }, '-=0.7');

  // 4. Fade/slide description & CTA actions
  tl.to(['#heroDescription', '#heroActions'], {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.15
  }, '-=1.0');

  // 5. Image & overlay reveal animation — arrives at tilted resting state
  tl.to('.image-reveal-wrapper', {
    opacity: 1,
    rotation: -5,   /* land at the design tilt */
    scale: 1,
    duration: 1.6,
    ease: 'power4.out'
  }, '-=1.5');


  // Curtain slides UP to reveal image (like a cinema screen)
  tl.to('.image-reveal-curtain', {
    y: '-101%',
    duration: 1.6,
    ease: 'power4.inOut'
  }, '-=1.2');

  tl.to('.hero-slide.active .hero-slide-img', {
    scale: 1,
    duration: 2.2,
    ease: 'power3.out'
  }, '-=1.5');
}

/* 4. Magnetic Buttons */
function initMagneticButtons() {
  const magnetics = document.querySelectorAll('.magnetic');

  magnetics.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const strength = btn.getAttribute('data-strength') || 15;

      gsap.to(btn, {
        x: x * (strength / rect.width),
        y: y * (strength / rect.height),
        duration: 0.35,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.35)'
      });
    });
  });
}

/* 5. 3D Tilt & Parallax */
function init3DTilt() {
  const container = document.getElementById('heroMediaContainer');
  const wrapper = document.querySelector('.image-reveal-wrapper');

  if (!container || !wrapper) return;

  container.addEventListener('mousemove', e => {
    const activeImage = container.querySelector('.hero-slide.active .hero-slide-img');
    if (!activeImage) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates (-0.5 to 0.5)
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;

    // Angles for 3D rotation
    const rotateX = -normY * 12; // tilt amount in deg
    const rotateY = normX * 12;

    gsap.to(wrapper, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 1200,
      duration: 0.45,
      ease: 'power2.out'
    });

    // Opposite movement on the active image for depth parallax
    gsap.to(activeImage, {
      x: -normX * 22,
      y: -normY * 22,
      duration: 0.45,
      ease: 'power2.out'
    });
  });

  container.addEventListener('mouseleave', () => {
    // Reset rotations & positions smoothly
    gsap.to(wrapper, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    const allImages = container.querySelectorAll('.hero-slide-img');
    gsap.to(allImages, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  });
}

/* 6. Mobile Overlay Navigation */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const navOverlay = document.getElementById('mobileNav');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!toggle || !navOverlay) return;

  toggle.addEventListener('click', () => {
    if (toggle.classList.contains('open')) {
      const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/random-frames/');
      if (isHome) {
        toggle.classList.remove('open');
        navOverlay.classList.remove('open');
      } else {
        window.location.href = 'index.html';
      }
      return;
    }

    toggle.classList.add('open');
    navOverlay.classList.add('open');

    gsap.fromTo(links,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.25 }
    );
    gsap.fromTo('.btn-mobile-contact',
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)', delay: 0.65 }
    );
  });

  // Close menu when a link is clicked
  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      navOverlay.classList.remove('open');
    });
  });

  // Mobile dropdown toggle for Portfolio subcategories
  const mobileDropdownToggle = document.getElementById('mobileDropdownToggle');
  const mobileDropdownMenu = document.getElementById('mobileDropdownMenu');
  if (mobileDropdownToggle && mobileDropdownMenu) {
    mobileDropdownToggle.addEventListener('click', () => {
      const isOpen = mobileDropdownMenu.classList.toggle('is-open');
      const chevron = mobileDropdownToggle.querySelector('.chevron');
      if (chevron) chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }
}

/* 7. Bokeh Background Particle System */
function initBokehParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bokehCanvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  // Generate particles
  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 3 + 0.5,
    speed: Math.random() * 0.3 + 0.05,
    opacity: Math.random() * 0.18 + 0.04,
    drift: (Math.random() - 0.5) * 0.4,
  }));

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fill();

      // Drift upward slowly
      p.y -= p.speed;
      p.x += p.drift;
      // Reset particle when it goes off top
      if (p.y < -20) {
        p.y = H + 20;
        p.x = Math.random() * W;
      }
      if (p.x < -20 || p.x > W + 20) {
        p.x = Math.random() * W;
      }
    });
    requestAnimationFrame(drawParticles);
  }

  drawParticles();

  // Fade in the canvas after the preloader is done
  // We use a timeout matching the preloader duration (~2.5s)
  setTimeout(() => {
    gsap.to(canvas, { opacity: 1, duration: 2, ease: 'power2.out' });
  }, 2600);
}

/* =====================================================
   PORTFOLIO SECTION JS  (Category Cards on main page)
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGlobalFooter();
  initCatCardReveal();
  initCatCardGlow();
  initProjectModal();
  initScrollReveal();
});

/* 7.4 Global Footer Injection */
function initGlobalFooter() {
  const footerContent = `
    <div class="footer-left scroll-reveal">
      <a href="index.html" class="footer-logo-wrap">
        <div class="logo-icon-rf footer-rf">
          <span class="r">R</span><span class="f">F</span>
        </div>
        <span class="footer-logo">RANDOM FRAMES</span>
      </a>
    </div>
    <div class="footer-middle scroll-reveal delay-1">
      <p class="footer-tagline">Thoughtfully Crafted Imagery & Films for Modern Brands, Spaces & Experiences</p>
    </div>
    <div class="footer-right scroll-reveal delay-2">
      <a href="https://www.instagram.com/random.frames.7/" target="_blank" rel="noopener noreferrer"
        class="footer-social-link">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
        </svg>
        <span>@random.frames.7</span>
      </a>
    </div>
  `;

  let footerEl = document.querySelector('footer.main-footer');
  if (!footerEl) {
    footerEl = document.createElement('footer');
    footerEl.className = 'main-footer';
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.appendChild(footerEl);
    } else {
      document.body.appendChild(footerEl);
    }
  }

  footerEl.innerHTML = footerContent;
}

/* 7.5 Global Scroll Reveal */
function initScrollReveal() {
  const elements = document.querySelectorAll('.scroll-reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* 8. Category Card Scroll Reveal */
function initCatCardReveal() {
  const cards = document.querySelectorAll('.cat-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const idx = Array.from(cards).indexOf(card);
        setTimeout(() => card.classList.add('is-visible'), idx * 100);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  cards.forEach(c => observer.observe(c));
}

/* 9. Category Card Mouse Glow Tracking */
function initCatCardGlow() {
  const cards = document.querySelectorAll('.cat-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const pctX = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%';
      const pctY = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%';
      card.style.setProperty('--mouse-x', pctX);
      card.style.setProperty('--mouse-y', pctY);
    });
  });
}

/* 14. Infinite Hero Slideshow — Atmospheric Blend Transition Engine */
function initHeroSlideshow() {
  const container = document.getElementById('heroSlideshow');
  if (!container) return;

  const slides = container.querySelectorAll('.hero-slide');
  if (slides.length <= 1) return;

  // UI references
  const strips = document.querySelectorAll('.slide-strip');
  const wrapper = document.getElementById('heroRevealWrapper');
  const echoImg = document.getElementById('heroEchoImg');
  const blades = wrapper ? wrapper.querySelectorAll('.shutter-blade') : [];
  const corners = wrapper ? wrapper.querySelectorAll('.vf-corner') : [];

  const DWELL = 5000;  // ms each slide is shown
  const FADE_DUR = 1.6;   // seconds for crossfade dissolve
  const ZOOM_DUR = DWELL / 1000;

  let currentIdx = 0;
  let isAnimating = false;
  let dwellTimer = null;
  let kenBurnsTween = null;
  let isFirstSlide = true;

  // Make the hero image clickable to skip to next image


  if (wrapper) {
    wrapper.style.cursor = 'pointer';
    wrapper.addEventListener('click', () => {
      if (isAnimating) return;
      clearTimeout(dwellTimer);
      goToNext();
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  function updateStrips(activeIdx, duration = DWELL) {
    if (!strips.length) return;
    strips.forEach((strip, i) => {
      strip.style.removeProperty('--slide-duration');
      strip.classList.remove('active', 'passed');
      if (i < activeIdx) strip.classList.add('passed');
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const active = strips[activeIdx];
        if (active) {
          active.style.setProperty('--slide-duration', `${duration}ms`);
          active.classList.add('active');
        }
      });
    });
  }

  function startKenBurns(img) {
    if (kenBurnsTween) kenBurnsTween.kill();
    gsap.set(img, { scale: 1.0, x: 0 });
    kenBurnsTween = gsap.to(img, {
      scale: 1.06,       // subtle — stays well inside the mask
      x: -6,             // slight leftward atmospheric drift
      duration: ZOOM_DUR,
      ease: 'sine.inOut'
    });
  }

  // ── Initialize: hide all slides, show only first ─────────────────────────
  slides.forEach((slide, idx) => {
    gsap.set(slide, { opacity: idx === 0 ? 1 : 0 });
    slide.style.zIndex = idx === 0 ? 2 : 1;
    if (idx === 0) slide.classList.add('active');
  });

  // Boot first state
  updateStrips(0, 2000);
  startKenBurns(slides[0].querySelector('.hero-slide-img'));

  // Start the wrapper float after a short delay (let entry animation finish first)
  setTimeout(() => {
    if (wrapper) wrapper.style.animationPlayState = 'running';
  }, 1800);

  // ── Transition ───────────────────────────────────────────────────────────
  function goToNext() {
    if (isAnimating) return;
    isAnimating = true;

    const prevIdx = currentIdx;
    const nextIdx = (currentIdx + 1) % slides.length;
    const prevSlide = slides[prevIdx];
    const nextSlide = slides[nextIdx];
    const prevImg = prevSlide.querySelector('.hero-slide-img');
    const nextImg = nextSlide.querySelector('.hero-slide-img');
    const nextSrc = nextSlide.querySelector('.hero-slide-img')?.src;

    if (kenBurnsTween) kenBurnsTween.kill();

    // Flash viewfinder corners
    corners.forEach(c => {
      c.classList.add('flash');
      setTimeout(() => c.classList.remove('flash'), 600);
    });

    // Stack: next on top, prev below
    nextSlide.style.zIndex = 3;
    prevSlide.style.zIndex = 2;
    gsap.set(nextSlide, { opacity: 0 });
    gsap.set(nextImg, { scale: 1.06, x: 10 });

    // ── Phase A: Shutter close (blades sweep right) ──
    const shutterIn = gsap.timeline();
    shutterIn.to(blades, {
      scaleX: 1,
      duration: 0.22,
      stagger: 0.04,
      ease: 'power2.in',
      transformOrigin: 'left'
    });

    shutterIn.call(() => {
      // While shutter is closed: swap the visible slide + update echo
      prevSlide.classList.remove('active');
      prevSlide.style.zIndex = 1;
      gsap.set(prevSlide, { opacity: 0 });
      gsap.set(prevImg, { scale: 1.0, x: 0 });

      nextSlide.classList.add('active');
      nextSlide.style.zIndex = 2;
      gsap.set(nextSlide, { opacity: 1 });

      // Sync echo ghost to the new image
      if (echoImg && nextSrc) echoImg.src = nextSrc;
    });

    // ── Phase B: Shutter open (blades retract left) ──
    shutterIn.to(blades, {
      scaleX: 0,
      duration: 0.28,
      stagger: { each: 0.04, from: 'end' },
      ease: 'power2.out',
      transformOrigin: 'right',
      onComplete: () => {
        currentIdx = nextIdx;
        isAnimating = false;

        updateStrips(nextIdx);
        startKenBurns(nextImg);
        scheduleDwell();
      }
    });
  }

  function scheduleDwell() {
    clearTimeout(dwellTimer);
    const delay = isFirstSlide ? 8000 : DWELL;
    isFirstSlide = false;
    dwellTimer = setTimeout(goToNext, delay);
  }

  scheduleDwell();
}

/* =====================================================
   PROJECT MODAL FORM JS
   ===================================================== */
function initProjectModal() {
  const form = document.getElementById('projectForm');
  if (!form) return;

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit-btn');
    const originalBtnText = submitBtn.innerText;

    // Get form data
    const name = document.getElementById('pName').value.trim();
    const phone = document.getElementById('pPhone').value.trim();
    const email = document.getElementById('pEmail').value.trim();
    const req = document.getElementById('pReq').value.trim();

    // Explicit Validation
    if (!name || name.length < 2) {
      alert('Please enter a valid name.');
      return;
    }

    const phoneRegex = /^[0-9\-\+\s\(\)]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Update UI to show sending state
    submitBtn.innerText = 'Sending...';
    submitBtn.disabled = true;

    // Construct Web3Forms payload
    const formData = {
      access_key: '9b9fb3dd-9856-4ad8-9459-6ab0c9eae878',
      subject: `New Project Request from ${name}`,
      name: name,
      email: email,
      phone: phone,
      message: req
    };

    // 1. Send Background Email via Web3Forms
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
          // Success
          submitBtn.innerText = 'Request Sent!';

          setTimeout(() => {
            form.reset();
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
          }, 3000);
        } else {
          console.log(response);
          submitBtn.innerText = 'Error sending. Try again.';
          submitBtn.disabled = false;
        }
      })
      .catch(error => {
        console.log(error);
        submitBtn.innerText = 'Error sending. Try again.';
        submitBtn.disabled = false;
      });
  });
}
/* =====================================================
   GLOBAL VIDEO MODAL WITH PLAYLIST
   ===================================================== */
function applyIntrinsicRatio(video) {
  if (!video) return;
  const container = document.getElementById('videoModalContainer');
  if (!container) return;

  if (video.readyState >= 1 && video.videoWidth && video.videoHeight) {
    const ratio = video.videoWidth / video.videoHeight;
    container.style.setProperty('--dynamic-ratio', ratio);
  } else {
    video.addEventListener('loadedmetadata', () => {
      if (video.videoWidth && video.videoHeight) {
        const ratio = video.videoWidth / video.videoHeight;
        container.style.setProperty('--dynamic-ratio', ratio);
      }
    }, { once: true });
  }
}

let currentPlaylist = [];
let currentVideoIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
  initVideoModal();
});

function initVideoModal() {
  if (!document.getElementById('videoModal')) {
    document.body.insertAdjacentHTML('beforeend', `
<div class="video-modal" id="videoModal">
    <div class="video-modal-bg" id="videoModalBg"></div>
    <div class="video-modal-container" id="videoModalContainer">
      <button class="video-modal-close" id="videoModalClose" aria-label="Close Player">✕</button>
      
      <!-- Playlist Navigation Arrows -->
      <button class="playlist-nav-btn prev-btn" id="playlistPrevBtn" aria-label="Previous Video">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" fill="white"/>
        </svg>
      </button>
      <button class="playlist-nav-btn next-btn" id="playlistNextBtn" aria-label="Next Video">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="white"/>
        </svg>
      </button>

      <div class="video-player-wrapper">
        <div class="video-carousel-track" id="videoCarouselTrack">
          <div class="carousel-video-item prev" id="carouselPrev">
            <video id="modalVideoPrev" playsinline muted loop></video>
          </div>
          <div class="carousel-video-item active" id="carouselActive">
            <div id="videoErrorPlaceholder" class="video-error-placeholder" style="display:none;">Unable to load video.</div>
            <video id="modalVideo" src="" playsinline></video>
          </div>
          <div class="carousel-video-item next" id="carouselNext">
            <video id="modalVideoNext" playsinline muted loop></video>
          </div>
        </div>

        <!-- Premium Controls Overlay -->
        <div class="player-controls" id="playerControls">
          <!-- Seeker / Timeline -->
          <div class="timeline-container" id="timelineContainer">
            <div class="timeline-slider">
              <div class="timeline-progress" id="timelineProgress"></div>
              <div class="timeline-hover" id="timelineHover"></div>
              <div class="timeline-handle" id="timelineHandle"></div>
            </div>
          </div>

          <div class="controls-main">
            <div class="controls-left">
              <button class="control-btn" id="playBtn" aria-label="Play/Pause">
                <svg class="play-icon" viewBox="0 0 24 24" width="22" height="22">
                  <path d="M8 5v14l11-7z" fill="white" />
                </svg>
                <svg class="pause-icon" viewBox="0 0 24 24" width="22" height="22" style="display:none;">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="white" />
                </svg>
              </button>

              <div class="volume-container">
                <button class="control-btn" id="volumeBtn" aria-label="Mute/Unmute">
                  <svg class="volume-high" viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                      fill="white" />
                  </svg>
                  <svg class="volume-muted" viewBox="0 0 24 24" width="20" height="20" style="display:none;">
                    <path
                      d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                      fill="white" />
                  </svg>
                </button>
                <div class="volume-slider-wrap">
                  <div class="volume-track">
                    <div class="volume-bar" id="volumeBar"></div>
                  </div>
                </div>
              </div>


            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
`);
  }
  const modal = document.getElementById('videoModal');
  const mv = document.getElementById('modalVideo');
  const closeBtn = document.getElementById('videoModalClose');
  const bg = document.getElementById('videoModalBg');

  const playBtn = document.getElementById('minimalPlayBtn') || document.getElementById('playBtn');
  const timeline = document.getElementById('minimalTimeline') || document.getElementById('timelineContainer');
  const progress = document.getElementById('minimalProgress') || document.getElementById('timelineProgress');
  const wrapper = document.getElementById('videoPlayerWrapper');

  const prevBtn = document.getElementById('playlistPrevBtn');
  const nextBtn = document.getElementById('playlistNextBtn');

  const interactives = [
    prevBtn, nextBtn, closeBtn,
    document.getElementById('minimalPlayBtn') || document.getElementById('playBtn'),
    document.getElementById('volumeBtn'),
    document.querySelector('.volume-track')
  ].filter(Boolean);

  if (window.currentReelControlsManager) {
    window.currentReelControlsManager.destroy();
  }
  const modalContainer = document.getElementById('videoModalContainer');
  window.currentReelControlsManager = new ReelControlsManager(modalContainer, interactives);
  window.currentReelControlsManager.transitionTo('Opening');


  // Hook into video play/pause
  const allModalVids = document.querySelectorAll('.carousel-video-item video');
  allModalVids.forEach(v => {
    v.addEventListener('play', () => window.currentReelControlsManager?.transitionTo('Playing'));
    v.addEventListener('playing', () => window.currentReelControlsManager?.transitionTo('Playing'));
    v.addEventListener('pause', () => window.currentReelControlsManager?.transitionTo('Paused'));
    v.addEventListener('waiting', () => window.currentReelControlsManager?.transitionTo('Buffering'));
    v.addEventListener('seeking', () => window.currentReelControlsManager?.transitionTo('Seeking'));
    v.addEventListener('seeked', () => window.currentReelControlsManager?.transitionTo(v.paused ? 'Paused' : 'Playing'));
    v.addEventListener('ended', () => window.currentReelControlsManager?.transitionTo('Ended'));
    v.addEventListener('error', () => window.currentReelControlsManager?.transitionTo('Error'));
  });


  if (!modal || !mv || !closeBtn || !bg) return;

  function closeModal() {
    if (window.currentReelControlsManager) {
      window.currentReelControlsManager.destroy();
      window.currentReelControlsManager = null;
    }
    modal.classList.remove('active');

    modal.querySelectorAll('.carousel-video-item video').forEach(v => {
      v.pause();
      v.removeAttribute('src');
      v.load();
    });

    if (document.getElementById('modalVideo')) {
      const mv = document.getElementById('modalVideo');
      mv.pause();
      mv.removeAttribute('src');
      mv.load();
    }

    document.body.style.overflow = '';
    const container = document.getElementById('videoModalContainer');
    if (container) {
      container.style.removeProperty('--dynamic-ratio');
    }

    const errorPlaceholder = document.getElementById('videoErrorPlaceholder');
    if (errorPlaceholder) errorPlaceholder.style.display = 'none';
  }

  let isSliding = false;

  function playNext() {
    if (currentPlaylist.length <= 1 || isSliding) return;
    const track = document.getElementById('videoCarouselTrack');

    if (track) {
      isSliding = true;
      track.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      track.classList.add('sliding-next');

      const oldNext = track.querySelector('.next');
      if (oldNext) {
        const nextVid = oldNext.querySelector('video');
        if (nextVid) nextVid.play().catch(() => { });
      }

      setTimeout(() => {
        track.style.transition = 'none';
        const items = track.querySelectorAll('.carousel-video-item');
        items.forEach(item => item.style.transition = 'none');

        track.classList.remove('sliding-next');

        const oldPrev = track.querySelector('.prev');
        const oldActive = track.querySelector('.active');

        if (oldPrev) oldPrev.className = 'carousel-video-item next';
        if (oldActive) oldActive.className = 'carousel-video-item prev';
        if (oldNext) {
          oldNext.className = 'carousel-video-item active';
          const newActiveVid = oldNext.querySelector('video');
          if (newActiveVid) applyIntrinsicRatio(newActiveVid);
        }

        currentVideoIndex = (currentVideoIndex + 1) % currentPlaylist.length;

        if (oldActive) {
          const outgoingVideo = oldActive.querySelector('video');
          if (outgoingVideo) outgoingVideo.pause();
        }

        if (oldPrev) {
          const newNextVideo = oldPrev.querySelector('video');
          if (newNextVideo) {
            const nextIdx = (currentVideoIndex + 1) % currentPlaylist.length;
            const appendHash = (url) => url.includes('#t=') ? url : url + '#t=0.5';
            newNextVideo.src = appendHash(currentPlaylist[nextIdx]);
          }
        }

        void track.offsetWidth;
        items.forEach(item => item.style.transition = '');
        isSliding = false;
      }, 400);
    } else {
      currentVideoIndex = (currentVideoIndex + 1) % currentPlaylist.length;
      window.openModal(currentPlaylist[currentVideoIndex]);
    }
  }

  function playPrev() {
    if (currentPlaylist.length <= 1 || isSliding) return;
    const track = document.getElementById('videoCarouselTrack');

    if (track) {
      isSliding = true;
      track.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      track.classList.add('sliding-prev');

      const oldPrev = track.querySelector('.prev');
      if (oldPrev) {
        const prevVid = oldPrev.querySelector('video');
        if (prevVid) prevVid.play().catch(() => { });
      }

      setTimeout(() => {
        track.style.transition = 'none';
        const items = track.querySelectorAll('.carousel-video-item');
        items.forEach(item => item.style.transition = 'none');

        track.classList.remove('sliding-prev');

        const oldActive = track.querySelector('.active');
        const oldNext = track.querySelector('.next');

        if (oldPrev) {
          oldPrev.className = 'carousel-video-item active';
          const newActiveVid = oldPrev.querySelector('video');
          if (newActiveVid) applyIntrinsicRatio(newActiveVid);
        }
        if (oldActive) oldActive.className = 'carousel-video-item next';
        if (oldNext) oldNext.className = 'carousel-video-item prev';

        currentVideoIndex = (currentVideoIndex - 1 + currentPlaylist.length) % currentPlaylist.length;

        if (oldActive) {
          const outgoingVideo = oldActive.querySelector('video');
          if (outgoingVideo) outgoingVideo.pause();
        }

        if (oldNext) {
          const newPrevVideo = oldNext.querySelector('video');
          if (newPrevVideo) {
            const prevIdx = (currentVideoIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
            const appendHash = (url) => url.includes('#t=') ? url : url + '#t=0.5';
            newPrevVideo.src = appendHash(currentPlaylist[prevIdx]);
          }
        }

        void track.offsetWidth;
        items.forEach(item => item.style.transition = '');
        isSliding = false;
      }, 400);
    } else {
      currentVideoIndex = (currentVideoIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
      window.openModal(currentPlaylist[currentVideoIndex]);
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); playPrev(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); playNext(); });

  mv.addEventListener('ended', () => {
    playNext();
  });

  closeBtn.addEventListener('click', closeModal);
  bg.addEventListener('click', closeModal);

  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const activeVideo = modal.querySelector('.carousel-video-item.active video') || document.getElementById('modalVideo');
      if (!activeVideo) return;
      if (activeVideo.paused) activeVideo.play().catch(() => { });
      else activeVideo.pause();
    });
  }


  // Volume Controls Logic
  const volumeBtn = document.getElementById('volumeBtn');
  const volumeTrack = document.querySelector('.volume-track');
  const volumeBar = document.getElementById('volumeBar');

  if (volumeBtn) {
    volumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const activeVideo = modal.querySelector('.carousel-video-item.active video') || document.getElementById('modalVideo');
      if (!activeVideo) return;
      activeVideo.muted = !activeVideo.muted;

      const vHigh = volumeBtn.querySelector('.volume-high');
      const vMuted = volumeBtn.querySelector('.volume-muted');

      if (activeVideo.muted || activeVideo.volume === 0) {
        if (vHigh) vHigh.style.display = 'none';
        if (vMuted) vMuted.style.display = 'block';
        if (volumeBar) volumeBar.style.width = '0%';
      } else {
        if (vHigh) vHigh.style.display = 'block';
        if (vMuted) vMuted.style.display = 'none';
        if (volumeBar) volumeBar.style.width = (activeVideo.volume * 100) + '%';
      }
    });
  }

  if (volumeTrack) {
    volumeTrack.addEventListener('click', (e) => {
      e.stopPropagation();
      const activeVideo = modal.querySelector('.carousel-video-item.active video') || document.getElementById('modalVideo');
      if (!activeVideo) return;

      const rect = volumeTrack.getBoundingClientRect();
      let pos = (e.clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));

      activeVideo.volume = pos;
      activeVideo.muted = pos === 0;

      const vHigh = volumeBtn.querySelector('.volume-high');
      const vMuted = volumeBtn.querySelector('.volume-muted');
      if (activeVideo.muted) {
        if (vHigh) vHigh.style.display = 'none';
        if (vMuted) vMuted.style.display = 'block';
      } else {
        if (vHigh) vHigh.style.display = 'block';
        if (vMuted) vMuted.style.display = 'none';
      }

      if (volumeBar) volumeBar.style.width = (pos * 100) + '%';
    });
  }


  if (wrapper) {
    const allModalVideos = modal.querySelectorAll('.carousel-video-item video');
    const vidsToBind = allModalVideos.length > 0 ? Array.from(allModalVideos) : [document.getElementById('modalVideo')].filter(Boolean);

    vidsToBind.forEach(vid => {
      vid.addEventListener('play', (e) => {
        if (e.target.parentElement && e.target.parentElement.classList.contains('carousel-video-item') && !e.target.parentElement.classList.contains('active')) return;
        wrapper.classList.add('playing');
        wrapper.classList.remove('paused');
        if (playBtn) {
          if (playBtn.id === 'minimalPlayBtn') {
            playBtn.textContent = '⏸';
          } else {
            const pIcon = playBtn.querySelector('.play-icon');
            const psIcon = playBtn.querySelector('.pause-icon');
            if (pIcon) pIcon.style.display = 'none';
            if (psIcon) psIcon.style.display = 'block';
          }
        }
      });
      vid.addEventListener('pause', (e) => {
        if (e.target.parentElement && e.target.parentElement.classList.contains('carousel-video-item') && !e.target.parentElement.classList.contains('active')) return;
        wrapper.classList.add('paused');
        wrapper.classList.remove('playing');
        if (playBtn) {
          if (playBtn.id === 'minimalPlayBtn') {
            playBtn.textContent = '▶';
          } else {
            const pIcon = playBtn.querySelector('.play-icon');
            const psIcon = playBtn.querySelector('.pause-icon');
            if (pIcon) pIcon.style.display = 'block';
            if (psIcon) psIcon.style.display = 'none';
          }
        }
      });
      const updateTimeUI = (video) => {
        const currentTimeEl = document.getElementById('currentTime');
        const durationTimeEl = document.getElementById('durationTime');
        const d = video.duration;
        const c = video.currentTime;

        if (progress && !isNaN(d) && d > 0 && d !== Infinity) {
          const p = (c / d) * 100;
          progress.style.width = p + '%';
        }

        if (currentTimeEl && durationTimeEl) {
          const formatTime = (time) => {
            if (isNaN(time) || time === Infinity) return '0:00';
            const mins = Math.floor(time / 60);
            const secs = Math.floor(time % 60);
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
          };
          currentTimeEl.textContent = formatTime(c);
          durationTimeEl.textContent = formatTime(d);
        }
      };

      vid.addEventListener('loadedmetadata', (e) => {
        if (e.target.parentElement && e.target.parentElement.classList.contains('carousel-video-item') && !e.target.parentElement.classList.contains('active')) return;
        updateTimeUI(e.target);
      });

      vid.addEventListener('timeupdate', (e) => {
        if (e.target.parentElement && e.target.parentElement.classList.contains('carousel-video-item') && !e.target.parentElement.classList.contains('active')) return;
        updateTimeUI(e.target);
      });
    });

    if (timeline) {
      timeline.addEventListener('click', (e) => {
        e.stopPropagation();
        const activeVideo = modal.querySelector('.carousel-video-item.active video') || document.getElementById('modalVideo');
        if (!activeVideo) return;
        const rect = timeline.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (activeVideo.duration) activeVideo.currentTime = pos * activeVideo.duration;
      });
    }
  }

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') playNext();
    if (e.key === 'ArrowLeft') playPrev();
  });

  // Build the playlist from all videos on the page
  buildPlaylist();
}

function buildPlaylist() {
  currentPlaylist = [];
  document.querySelectorAll('.detail-card, .bento-item, .reel-item').forEach((card) => {
    // Collect src from data attribute, or directly from video if missing
    let src = card.getAttribute("data-video-src");
    if (!src) {
      const vid = card.querySelector('video');
      if (vid) src = vid.getAttribute('src');
    }
    if (src && !currentPlaylist.includes(src)) {
      currentPlaylist.push(src);
    }
  });
}

// Global openModal function
window.openModal = function (src, isAnimating = false) {
  const modal = document.getElementById('videoModal');
  const mv = modal ? modal.querySelector('.carousel-video-item.active video') || document.getElementById('modalVideo') : null;
  const mvPrev = modal ? modal.querySelector('.carousel-video-item.prev video') : null;
  const mvNext = modal ? modal.querySelector('.carousel-video-item.next video') : null;
  if (!modal || !mv) return;

  const errorPlaceholder = document.getElementById('videoErrorPlaceholder');
  if (errorPlaceholder) errorPlaceholder.style.display = 'none';

  // Apply intrinsic ratio on metadata load
  applyIntrinsicRatio(mv);

  mv.addEventListener('error', () => {
    if (errorPlaceholder) errorPlaceholder.style.display = 'flex';
  }, { once: true });

  // Update current index in playlist
  if (currentPlaylist.length > 0) {
    const idx = currentPlaylist.indexOf(src);
    if (idx !== -1) {
      currentVideoIndex = idx;

      const prevIdx = (currentVideoIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
      const nextIdx = (currentVideoIndex + 1) % currentPlaylist.length;

      const appendHash = (url) => url.includes('#t=') ? url : url + '#t=0.5';

      if (mvPrev) {
        mvPrev.src = appendHash(currentPlaylist[prevIdx]);
        mvPrev.load();
      }
      if (mvNext) {
        mvNext.src = appendHash(currentPlaylist[nextIdx]);
        mvNext.load();
      }
    }
  }

  const appendHash = (url) => url.includes('#t=') ? url : url + '#t=0.5';
  mv.src = appendHash(src);

  if (!isAnimating) {
    mv.load();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  mv.play().catch(() => { });
};
