/* ==========================================================================
   WEDDING INVITATION INTERACTIVE LOGIC (VANILLA JS - LUXURY SCROLLING EDITORIAL)
   ========================================================================== */

// 1. DYNAMIC INVITATION DATA STORE
const invitation = {
  event: "Walimatul Urus",
  groom: "Adam",
  bride: "Hawa",
  date: "29 June 2026",
  venue: "Kuala Lumpur",
  targetCountdownDate: "Jun 29, 2026 11:00:00"
};

// 2. INITIALIZE AND BIND EVENTS ON LOAD
document.addEventListener("DOMContentLoaded", () => {
  injectInvitationData();
  setupGateAnimation();
  setupScrollAnimations();
  setupCountdownTimer();
  setupFloatingActionsAndModals();
  setupRSVPForm();
  setupMusicController();
  setupAmbientCanvas();
});

/**
 * Injects invitation variables into their corresponding HTML containers.
 */
function injectInvitationData() {
  const elementsToInject = {
    "event-type": invitation.event,
    "groom-name": invitation.groom,
    "bride-name": invitation.bride,
    "event-date": invitation.date,
    "event-venue": invitation.venue
  };

  for (const [id, value] of Object.entries(elementsToInject)) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  }
}

/**
 * Custom smooth scroll function to scroll the window to a target position.
 * Uses cubic-bezier ease-in-out for a cinematic, luxurious experience.
 * Duration is configurable (1600ms to 2200ms).
 */
function smoothScrollTo(targetY, duration = 2000) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  const startTime = performance.now();

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutCubic(progress));

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

/**
 * Handles the opening curtain/gate sliding animation.
 * Once opened, it waits 1 second then smoothly auto-scrolls down to the couple profiles!
 */
function setupGateAnimation() {
  const openBtn = document.getElementById("open-btn");
  const gate = document.getElementById("invitation-gate");
  const content = document.getElementById("invitation-content");
  const container = document.getElementById("invitation-container");

  if (openBtn && gate && content && container) {
    openBtn.addEventListener("click", () => {
      // 1. Trigger CSS slide & fade animation on gate
      gate.classList.add("open-animation");
      
      // 2. Reveal the main invitation container underneath
      content.classList.remove("hidden");
      content.classList.add("fade-in");

      // 3. Enable scrollbars on the container frame and document body
      container.classList.remove("scroll-locked");
      document.body.classList.remove("scroll-locked");

      // Start background music and fade in the luxury toggle controller
      const audio = document.getElementById("bg-music");
      const musicBtn = document.getElementById("music-toggle-btn");
      if (audio && musicBtn) {
        audio.play().then(() => {
          musicBtn.classList.add("playing");
        }).catch(err => {
          console.log("Audio autoplay prevented by browser policy. Button will still show.", err);
        });
        musicBtn.classList.remove("hidden");
      }

      // 4. Clean up gate display once fully slid open (1.8 seconds)
      setTimeout(() => {
        gate.style.display = "none";
      }, 1800);

      // 5. WAIT 1 SECOND (after slide completed) then smoothly scroll to Bride & Groom section
      setTimeout(() => {
        const targetSection = document.getElementById("section-profiles");
        if (targetSection) {
          smoothScrollTo(targetSection.offsetTop, 2000);
        }
      }, 2500); // 1.5s slide animation + 1s luxury pause
    });
  }
}

/**
 * Setup Intersection Observer for cinematic scroll-triggered animations.
 * Observes the main window/viewport scroll.
 */
function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const observerOptions = {
    root: null, // Observing viewport
    rootMargin: "0px",
    threshold: 0.12 // Trigger slightly after section enters frame
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-active");
        // Unobserve to keep performance highly optimized
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => {
    scrollObserver.observe(el);
  });
}

/**
 * Live Countdown Timer clock calculated towards the June 29, 2026 wedding date.
 */
function setupCountdownTimer() {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minsEl = document.getElementById("minutes");
  const secsEl = document.getElementById("seconds");

  const countdownDate = new Date(invitation.targetCountdownDate).getTime();

  function updateClock() {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    // Calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Render with leading zero format
    if (daysEl) daysEl.textContent = String(Math.max(0, days)).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(Math.max(0, hours)).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(Math.max(0, minutes)).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(Math.max(0, seconds)).padStart(2, '0');
  }

  // Initial call and set interval loop
  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * Handle show/hide of minimal floating menu cards, and popups for RSVP/Contacts
 */
function setupFloatingActionsAndModals() {
  const container = document.getElementById("invitation-container");
  const floatingRsvpBtn = document.getElementById("floating-rsvp-btn");
  const inPageRsvpTrigger = document.getElementById("section-rsvp-trigger");
  const inPageContactTrigger = document.getElementById("section-contact-trigger");
  
  const modalContainer = document.getElementById("modal-container");
  const backdrop = document.getElementById("modal-backdrop");
  const closeButtons = document.querySelectorAll(".modal-close");
  const successCloseBtn = document.getElementById("success-close-btn");

  // 1. Scroll listener to reveal/hide floating pills (only shows when scrolled past Hero)
  if (floatingRsvpBtn) {
    window.addEventListener("scroll", () => {
      const heroHeight = window.innerHeight * 0.75;
      if (window.scrollY > heroHeight) {
        floatingRsvpBtn.classList.add("visible");
      } else {
        floatingRsvpBtn.classList.remove("visible");
      }
    });
  }

  // 2. Click binding for floating and in-page buttons
  if (floatingRsvpBtn) {
    floatingRsvpBtn.addEventListener("click", () => openModal("modal-rsvp"));
  }
  if (inPageRsvpTrigger) {
    inPageRsvpTrigger.addEventListener("click", () => openModal("modal-rsvp"));
  }
  if (inPageContactTrigger) {
    inPageContactTrigger.addEventListener("click", () => openModal("modal-contact"));
  }

  // 3. Modal close click binding
  if (backdrop) {
    backdrop.addEventListener("click", closeAllModals);
  }

  closeButtons.forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  if (successCloseBtn) {
    successCloseBtn.addEventListener("click", closeAllModals);
  }

  /**
   * Helper functions to display / remove overlay modals safely
   */
  function openModal(modalId) {
    if (modalContainer) {
      modalContainer.classList.add("active");
      
      const allModals = document.querySelectorAll(".modal-content");
      allModals.forEach(m => m.classList.remove("active"));
      
      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        targetModal.classList.add("active");
      }
    }
  }

  function closeAllModals() {
    if (modalContainer) {
      modalContainer.classList.remove("active");
      const allModals = document.querySelectorAll(".modal-content");
      allModals.forEach(m => m.classList.remove("active"));
    }
  }
}

/**
 * Handles RSVP form verification, prevention of default page refresh,
 * terminal logs, and modal confirmation states.
 */
function setupRSVPForm() {
  const form = document.getElementById("rsvp-form");
  const successState = document.getElementById("rsvp-success");

  if (form && successState) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const name = formData.get("name");
      const phone = formData.get("phone");
      const guests = formData.get("guests");
      const attendance = formData.get("attendance");
      const message = formData.get("message") || "";

      // Output values gracefully in browser console
      console.log("👰 WEDDING RSVP RESPONSE RECEIVED 🤵");
      console.log("-----------------------------------------");
      console.log(`👤 Name:               ${name}`);
      console.log(`📞 Phone Number:       ${phone}`);
      console.log(`👥 Number of Guests:   ${guests}`);
      console.log(`📌 Attendance Status:  ${attendance}`);
      console.log(`💌 Message/Wish:       ${message}`);
      console.log("-----------------------------------------");

      // Switch view to elegant success prompt inside modal
      form.classList.add("hidden");
      successState.classList.remove("hidden");

      // Reset form controls
      form.reset();
    });
  }

  // Reset modal state back to input form when opening it again
  const triggers = [
    document.getElementById("floating-rsvp-btn"),
    document.getElementById("section-rsvp-trigger")
  ];

  triggers.forEach(t => {
    if (t) {
      t.addEventListener("click", () => {
        if (form && successState) {
          form.classList.remove("hidden");
          successState.classList.add("hidden");
        }
      });
    }
  });
}

/**
 * Setup ambient background music player and circular disk controller toggle.
 */
function setupMusicController() {
  const musicBtn = document.getElementById("music-toggle-btn");
  const audio = document.getElementById("bg-music");

  if (!musicBtn || !audio) return;

  // Toggle play/pause state
  musicBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        musicBtn.classList.add("playing");
      }).catch(err => console.log("Audio play error:", err));
    } else {
      audio.pause();
      musicBtn.classList.remove("playing");
    }
  });
}

/**
 * Creates an elegant, lightweight, performance-optimized Ghibli-style falling petals/particles animation.
 * Soft organic golden-creamy blossoms drift down with gentle wind and rotative sway.
 */
function setupAmbientCanvas() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let particles = [];
  const maxParticles = 25; // Keep it low for high-end cinematic feel and perfect performance

  // Resize canvas to cover full viewport
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Particle representation
  class Petal {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Distribute evenly on start
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -20;
      this.size = Math.random() * 6 + 4; // Soft sizes 4px to 10px
      this.speedY = Math.random() * 0.8 + 0.4; // Elegant slow fall
      this.speedX = Math.random() * 0.4 - 0.2; // Minor drift
      this.opacity = Math.random() * 0.4 + 0.2; // Soft subtle transparency (0.2 to 0.6)
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = Math.random() * 0.02 - 0.01;
      this.color = Math.random() > 0.5 
        ? "rgba(168, 147, 109, " // Soft luxury gold petal
        : "rgba(223, 195, 132, "; // Warm champagne blossom petal
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.angle) * 0.2; // Soft swaying motion
      this.angle += this.spinSpeed;

      // Reset when particle goes off bottom or sides of viewport
      if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      
      // Draw a soft organic leaf/petal shape
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.opacity + ")";
      ctx.fill();
      
      ctx.restore();
    }
  }

  // Populate initial particles
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Petal());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    
    requestAnimationFrame(animate);
  }

  animate();
}
