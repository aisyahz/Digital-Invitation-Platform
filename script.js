/* ==========================================================================
   SHE.CO DIGITAL INVITATION PROTO CREATOR FLOW & LIVE INTERACTIVE LOGIC
   ========================================================================== */

// 1. DYNAMIC INVITATION DEFAULT DATA STORE
const defaultInvitation = {
  template: "garden",
  event: "Walimatul Urus",
  groom: "Adam",
  bride: "Hawa",
  date: "Saturday, 29 June 2026",
  time: "11:00 AM — 4:00 PM",
  venue: "Glasshouse at Seputeh",
  address: "Lorong Seputeh, Seputeh, 58000 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
  gmaps: "https://maps.google.com",
  waze: "https://waze.com",
  phone: "012-3456789",
  music: "https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-acoustic-guitar-and-piano-131.mp3"
};

// Target date for countdown (June 29, 2026)
let targetCountdownDateStr = "Jun 29, 2026 11:00:00";

// 2. INITIALIZE AND BIND EVENTS ON DOM LOAD
document.addEventListener("DOMContentLoaded", () => {
  setupRouting();
  setupHomepageFlow();
  setupScrollAnimations();
  setupCountdownTimer();
  setupFloatingActionsAndModals();
  setupRSVPForm();
  setupMusicController();
  setupAmbientCanvas();
});

/**
 * Premium Hash-Based Routing System.
 * Simulates complete customer journey pathing:
 * /home -> /templates -> /create -> /preview -> /payment -> /invite/:slug
 */
function setupRouting() {
  window.addEventListener("hashchange", handleRoute);
  // Trigger initial routing state on direct load
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || "#home";
  
  const creatorContainer = document.getElementById("creator-container");
  const invitationContainer = document.getElementById("invitation-container");
  const previewBanner = document.getElementById("preview-sticky-banner");
  const liveBanner = document.getElementById("live-success-banner");
  const musicBtn = document.getElementById("music-toggle-btn");
  const audio = document.getElementById("bg-music");

  // Reset viewport layouts and bodies
  document.body.classList.remove("scroll-locked");
  document.body.classList.remove("preview-mode");
  document.body.classList.remove("live-mode");

  if (creatorContainer) creatorContainer.classList.add("hidden");
  if (invitationContainer) invitationContainer.classList.add("hidden");
  if (previewBanner) previewBanner.classList.add("hidden");
  if (liveBanner) liveBanner.classList.add("hidden");

  // Hide all inner creator sub-views
  const creatorViews = ["view-home", "view-create", "view-payment"];
  creatorViews.forEach(viewId => {
    const el = document.getElementById(viewId);
    if (el) el.classList.add("hidden");
  });

  // Stop background music playing on creator landing pages to keep focus
  if (audio && !audio.paused && (hash === "#home" || hash === "#create" || hash === "#payment" || hash === "#templates")) {
    audio.pause();
    if (musicBtn) musicBtn.classList.remove("playing");
  }

  // Route Dispatcher
  if (hash === "#home" || hash === "" || hash === "#templates") {
    // Reveal Homepage
    if (creatorContainer) creatorContainer.classList.remove("hidden");
    const vHome = document.getElementById("view-home");
    if (vHome) vHome.classList.remove("hidden");
    
    // Hide floating controls and music btn on landing page
    if (musicBtn) musicBtn.classList.add("hidden");

    // Scroll to templates section if hash is templates
    if (hash === "#templates") {
      setTimeout(() => {
        const tSection = document.getElementById("templates-section");
        if (tSection) {
          tSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  } 
  else if (hash === "#create") {
    // Reveal Wedding Details Form
    if (creatorContainer) creatorContainer.classList.remove("hidden");
    const vCreate = document.getElementById("view-create");
    if (vCreate) vCreate.classList.remove("hidden");
    if (musicBtn) musicBtn.classList.add("hidden");
    
    // Smooth window top reset
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Pre-fill form fields with existing data
    prefillFormFields();
  } 
  else if (hash === "#payment") {
    // Reveal Mock Check-out Screen
    if (creatorContainer) creatorContainer.classList.remove("hidden");
    const vPayment = document.getElementById("view-payment");
    if (vPayment) vPayment.classList.remove("hidden");
    if (musicBtn) musicBtn.classList.add("hidden");
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  } 
  else if (hash === "#preview") {
    // Reveal Invitation PREVIEW (Sandbox Watermarked Mode)
    document.body.classList.add("preview-mode");
    document.body.classList.add("scroll-locked");
    
    if (invitationContainer) {
      invitationContainer.classList.remove("hidden");
      invitationContainer.classList.add("scroll-locked");
    }
    if (previewBanner) previewBanner.classList.remove("hidden");

    // Load form details and inject into invitation nodes
    loadAndInjectInvitationDetails();

    // Reset invitation gate state so users can experience opening sequencing
    resetInvitationGate();
  } 
  else if (hash.startsWith("#invite/")) {
    // Reveal Published Live Invitation (Pristine Mode)
    document.body.classList.add("live-mode");
    document.body.classList.add("scroll-locked");

    if (invitationContainer) {
      invitationContainer.classList.remove("hidden");
      invitationContainer.classList.add("scroll-locked");
    }

    // Check if user just completed successful checkout to trigger overlay
    const paymentCompleted = localStorage.getItem("paymentJustCompleted") === "true";
    if (paymentCompleted) {
      if (liveBanner) liveBanner.classList.remove("hidden");
      // Set the dynamic live share url link in copier input
      const shareInput = document.getElementById("live-share-link");
      if (shareInput) {
        const slug = hash.replace("#invite/", "");
        shareInput.value = `${window.location.origin}${window.location.pathname}#invite/${slug}`;
      }
    }

    loadAndInjectInvitationDetails();
    resetInvitationGate();
  }
}

/**
 * Setup Event Listeners and Click handlers for Creator Flow.
 */
function setupHomepageFlow() {
  // 1. Smooth scroll anchor link on homepage
  const howItWorksLink = document.getElementById("scroll-to-how-it-works");
  if (howItWorksLink) {
    howItWorksLink.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("how-it-works-section");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // 2. Select Template Buttons
  const chooseButtons = document.querySelectorAll(".choose-template-btn");
  chooseButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const templateId = btn.getAttribute("data-template") || "garden";
      // Store choice in local state and forward to detail form
      localStorage.setItem("selectedTemplate", templateId);
      window.location.hash = "#create";
    });
  });

  // 3. Details Form Submitting
  const creatorForm = document.getElementById("creator-form");
  if (creatorForm) {
    creatorForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Bundle form fields to storage object
      const details = {
        template: localStorage.getItem("selectedTemplate") || "garden",
        groom: document.getElementById("form-groom").value.trim() || defaultInvitation.groom,
        bride: document.getElementById("form-bride").value.trim() || defaultInvitation.bride,
        event: document.getElementById("form-event-type").value.trim() || defaultInvitation.event,
        date: document.getElementById("form-date").value.trim() || defaultInvitation.date,
        time: document.getElementById("form-time").value.trim() || defaultInvitation.time,
        venue: document.getElementById("form-venue-name").value.trim() || defaultInvitation.venue,
        address: document.getElementById("form-venue-address").value.trim() || defaultInvitation.address,
        gmaps: document.getElementById("form-gmaps").value.trim() || defaultInvitation.gmaps,
        waze: document.getElementById("form-waze").value.trim() || defaultInvitation.waze,
        phone: document.getElementById("form-phone").value.trim() || defaultInvitation.phone,
        music: document.getElementById("form-music").value.trim() || defaultInvitation.music
      };

      localStorage.setItem("weddingDetails", JSON.stringify(details));
      
      // Navigate straight to preview
      window.location.hash = "#preview";
    });
  }

  // 4. Checkout Simulating Button
  const checkoutBtn = document.getElementById("btn-complete-payment");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      // Record purchase in mock local storage
      localStorage.setItem("paymentStatus", "paid");
      localStorage.setItem("paymentJustCompleted", "true");

      // Generate dynamic clean URL slug from couples names (e.g., adam-hawa)
      const details = getActiveDetails();
      const slugGroom = details.groom.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const slugBride = details.bride.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const urlSlug = `${slugGroom}-${slugBride}`;

      // Redirect to live published screen!
      window.location.hash = `#invite/${urlSlug}`;
    });
  }

  // 5. Copier live share link buttons
  const copyBtn = document.getElementById("btn-copy-live-link");
  const shareInput = document.getElementById("live-share-link");
  if (copyBtn && shareInput) {
    copyBtn.addEventListener("click", () => {
      shareInput.select();
      shareInput.setSelectionRange(0, 99999); // For mobile devices
      
      navigator.clipboard.writeText(shareInput.value)
        .then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000);
        })
        .catch(err => {
          console.error("Could not copy link text: ", err);
        });
    });
  }

  // 6. Dismiss successful publish popups
  const dismissBtn = document.getElementById("btn-dismiss-success");
  const liveBanner = document.getElementById("live-success-banner");
  if (dismissBtn && liveBanner) {
    dismissBtn.addEventListener("click", () => {
      liveBanner.classList.add("hidden");
    });
  }
}

/**
 * Recovers stored wedding detail variables or falls back to standard values.
 */
function getActiveDetails() {
  const stored = localStorage.getItem("weddingDetails");
  const chosenTemplate = localStorage.getItem("selectedTemplate") || "garden";
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      parsed.template = chosenTemplate;
      return parsed;
    } catch (e) {
      console.warn("Details parse error, falling back to defaults.", e);
    }
  }
  
  const d = { ...defaultInvitation };
  d.template = chosenTemplate;
  return d;
}

/**
 * Injects stored details into form inputs on details creation view.
 */
function prefillFormFields() {
  const details = getActiveDetails();
  
  const fields = {
    "form-groom": details.groom,
    "form-bride": details.bride,
    "form-event-type": details.event,
    "form-date": details.date,
    "form-time": details.time,
    "form-venue-name": details.venue,
    "form-venue-address": details.address,
    "form-gmaps": details.gmaps,
    "form-waze": details.waze,
    "form-phone": details.phone,
    "form-music": details.music
  };

  for (const [id, value] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }
}

/**
 * Overwrites target text and asset elements inside our luxury invitation template wrapper.
 */
function loadAndInjectInvitationDetails() {
  const details = getActiveDetails();

  // 1. Overwrite central content texts
  const injectMapping = {
    "event-type": details.event,
    "groom-name": details.groom,
    "bride-name": details.bride,
    "event-date": details.date,
    "event-venue": details.venue,
    "profile-groom-name": details.groom,
    "profile-bride-name": details.bride,
    "detail-date": details.date,
    "detail-time": details.time,
    "venue-name": details.venue,
    "venue-address": details.address
  };

  for (const [id, value] of Object.entries(injectMapping)) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // 2. Format and render initials monogram (e.g. "A & H" for Adam & Hawa)
  const groomInitial = (details.groom || "A").trim().charAt(0).toUpperCase();
  const brideInitial = (details.bride || "H").trim().charAt(0).toUpperCase();
  const initialsMonogram = `${groomInitial} & ${brideInitial}`;

  const gateMonogram = document.getElementById("gate-monogram-title");
  if (gateMonogram) gateMonogram.textContent = initialsMonogram;

  const closingMonogram = document.getElementById("thank-you-monogram");
  if (closingMonogram) closingMonogram.textContent = initialsMonogram;

  // 3. Format and render thank you closing date (e.g. "29 . 06 . 2026")
  const closingDate = document.getElementById("thank-you-date");
  if (closingDate) {
    // Attempt to display a clean numerical dotted date if possible, otherwise use a minimal representation
    closingDate.textContent = details.date.includes("29 June") ? "29 . 06 . 2026" : "✦ EVENT DATE ✦";
  }

  // 4. Map actions binding
  const gmapsBtn = document.getElementById("btn-google-maps");
  if (gmapsBtn) gmapsBtn.setAttribute("href", details.gmaps);
  
  const wazeBtn = document.getElementById("btn-waze");
  if (wazeBtn) wazeBtn.setAttribute("href", details.waze);

  const svgVenueText = document.getElementById("svg-venue-name");
  if (svgVenueText) {
    svgVenueText.textContent = (details.venue || "VENUE").toUpperCase();
  }

  // 5. Background Audio Link Swap
  const audio = document.getElementById("bg-music");
  if (audio && details.music) {
    const currentSrc = audio.getAttribute("src");
    if (currentSrc !== details.music) {
      audio.setAttribute("src", details.music);
      audio.load();
    }
  }

  // 6. Dynamic template visual class attachment
  const container = document.getElementById("invitation-container");
  if (container) {
    // Remove existing template classes and add the newly chosen one
    container.classList.remove("template-garden", "template-royal", "template-islamic");
    container.classList.add(`template-${details.template}`);
  }
}

/**
 * Resets the closed sliding gate overlay curtain and resets animations.
 */
function resetInvitationGate() {
  const gate = document.getElementById("invitation-gate");
  const content = document.getElementById("invitation-content");
  const container = document.getElementById("invitation-container");
  const musicBtn = document.getElementById("music-toggle-btn");

  if (gate && content && container) {
    // Reveal gate again
    gate.style.display = "flex";
    gate.classList.remove("open-animation");
    
    // Hide content and lock scroll
    content.classList.add("hidden");
    content.classList.remove("fade-in");
    container.classList.add("scroll-locked");

    // Hide music floating controller until gate is opened again
    if (musicBtn) {
      musicBtn.classList.add("hidden");
    }
  }
}

/**
 * Handles the opening curtain/gate sliding animation.
 */
function setupInvitationGateTrigger() {
  const openBtn = document.getElementById("open-btn");
  const gate = document.getElementById("invitation-gate");
  const content = document.getElementById("invitation-content");
  const container = document.getElementById("invitation-container");

  if (openBtn && gate && content && container) {
    // Ensure we remove and re-add clean listener to avoid duplicate triggers
    const newOpenBtn = openBtn.cloneNode(true);
    if (openBtn.parentNode) {
      openBtn.parentNode.replaceChild(newOpenBtn, openBtn);
    }

    newOpenBtn.addEventListener("click", () => {
      // 1. Symmetrical curtains slide open
      gate.classList.add("open-animation");
      
      // 2. Reveal scrollable sheet
      content.classList.remove("hidden");
      content.classList.add("fade-in");

      // 3. Unlock container frames
      container.classList.remove("scroll-locked");
      document.body.classList.remove("scroll-locked");

      // 4. Start background melody and fade-in disk controller
      const audio = document.getElementById("bg-music");
      const musicBtn = document.getElementById("music-toggle-btn");
      
      if (audio && musicBtn) {
        audio.play().then(() => {
          musicBtn.classList.add("playing");
        }).catch(err => {
          console.log("Melody autoplay deferred until click trigger.", err);
        });
        musicBtn.classList.remove("hidden");
      }

      // 5. Clean gate node out of rendering stack after slide completed (1.8s)
      setTimeout(() => {
        gate.style.display = "none";
      }, 1800);

      // 6. Smooth cinema scrolling down to profiles section
      setTimeout(() => {
        const pSection = document.getElementById("section-profiles");
        if (pSection) {
          smoothScrollTo(pSection.offsetTop, 2000);
        }
      }, 2500);
    });
  }
}

// Intercept original gate setup
function setupGateAnimation() {
  setupInvitationGateTrigger();
}

/**
 * Re-trigger gate setup whenever view resets.
 */
const originalResetInvitationGate = resetInvitationGate;
resetInvitationGate = function() {
  originalResetInvitationGate();
  setupInvitationGateTrigger();
};

/**
 * Custom smooth scroll function to scroll the window to a target position.
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
 * Setup Intersection Observer for cinematic scroll-triggered animations.
 */
function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.12
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-active");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => {
    scrollObserver.observe(el);
  });
}

/**
 * Live Countdown Clock towards the dynamic wedding date.
 */
function setupCountdownTimer() {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minsEl = document.getElementById("minutes");
  const secsEl = document.getElementById("seconds");

  function updateClock() {
    const countdownDate = new Date(targetCountdownDateStr).getTime();
    const now = new Date().getTime();
    const distance = countdownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(Math.max(0, days)).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(Math.max(0, hours)).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(Math.max(0, minutes)).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(Math.max(0, seconds)).padStart(2, '0');
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * Floating pills scroll observer and modals opener.
 */
function setupFloatingActionsAndModals() {
  const floatingRsvpBtn = document.getElementById("floating-rsvp-btn");
  const inPageRsvpTrigger = document.getElementById("section-rsvp-trigger");
  const inPageContactTrigger = document.getElementById("section-contact-trigger");
  
  const modalContainer = document.getElementById("modal-container");
  const backdrop = document.getElementById("modal-backdrop");
  const closeButtons = document.querySelectorAll(".modal-close");
  const successCloseBtn = document.getElementById("success-close-btn");

  if (floatingRsvpBtn) {
    window.addEventListener("scroll", () => {
      // Only show rsvp floating bar when in active invitation modes
      const isInvView = document.body.classList.contains("preview-mode") || document.body.classList.contains("live-mode");
      if (!isInvView) {
        floatingRsvpBtn.classList.remove("visible");
        return;
      }

      const heroHeight = window.innerHeight * 0.75;
      if (window.scrollY > heroHeight) {
        floatingRsvpBtn.classList.add("visible");
      } else {
        floatingRsvpBtn.classList.remove("visible");
      }
    });
  }

  if (floatingRsvpBtn) {
    floatingRsvpBtn.addEventListener("click", () => openModal("modal-rsvp"));
  }
  if (inPageRsvpTrigger) {
    inPageRsvpTrigger.addEventListener("click", () => openModal("modal-rsvp"));
  }
  if (inPageContactTrigger) {
    inPageContactTrigger.addEventListener("click", () => openModal("modal-contact"));
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeAllModals);
  }

  closeButtons.forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  if (successCloseBtn) {
    successCloseBtn.addEventListener("click", closeAllModals);
  }

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
 * Handles RSVP submission verification.
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

      console.log("👰 WEDDING RSVP RESPONSE RECEIVED 🤵");
      console.log("-----------------------------------------");
      console.log(`👤 Name:               ${name}`);
      console.log(`📞 Phone Number:       ${phone}`);
      console.log(`👥 Number of Guests:   ${guests}`);
      console.log(`📌 Attendance Status:  ${attendance}`);
      console.log(`💌 Message/Wish:       ${message}`);
      console.log("-----------------------------------------");

      form.classList.add("hidden");
      successState.classList.remove("hidden");
      form.reset();
    });
  }

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
 * Setup ambient background music player.
 */
function setupMusicController() {
  const musicBtn = document.getElementById("music-toggle-btn");
  const audio = document.getElementById("bg-music");

  if (!musicBtn || !audio) return;

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
 * Elegant Falling Particles Canvas.
 * Automatically adapts particle sways, wind direction, shapes, and colors
 * dynamically depending on the selected template class!
 */
function setupAmbientCanvas() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let particles = [];
  const maxParticles = 30;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }

    reset() {
      const details = getActiveDetails();
      this.template = details.template || "garden";
      
      this.x = Math.random() * canvas.width;
      this.y = -20;
      
      if (this.template === "royal") {
        // Star Shimmers (Sparkles)
        this.size = Math.random() * 3 + 1.5;
        this.speedY = Math.random() * 0.4 + 0.15; // float slow
        this.speedX = Math.random() * 0.2 - 0.1;
        this.opacity = Math.random() * 0.6 + 0.3;
        this.opacitySpeed = Math.random() * 0.02 + 0.01;
        this.isRoyalSparkle = true;
      } 
      else if (this.template === "islamic") {
        // Muted Sage leaf points & gold dots
        this.size = Math.random() * 4 + 2;
        this.speedY = Math.random() * 0.6 + 0.3;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.opacity = Math.random() * 0.5 + 0.25;
        this.isSageLeaf = Math.random() > 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.spinSpeed = Math.random() * 0.01 - 0.005;
        this.isRoyalSparkle = false;
      } 
      else {
        // Garden Romance soft rose & gold petals
        this.size = Math.random() * 7 + 4;
        this.speedY = Math.random() * 0.8 + 0.4;
        this.speedX = Math.random() * 0.4 + 0.1; // soft wind drift
        this.opacity = Math.random() * 0.5 + 0.2;
        this.angle = Math.random() * Math.PI * 2;
        this.spinSpeed = Math.random() * 0.02 - 0.01;
        this.isPinkPetal = Math.random() > 0.4;
        this.isRoyalSparkle = false;
      }
    }

    update() {
      const details = getActiveDetails();
      const currentTemplate = details.template || "garden";

      // If template shifted on fly, re-init elements
      if (currentTemplate !== this.template) {
        this.reset();
      }

      this.y += this.speedY;
      
      if (this.isRoyalSparkle) {
        // Fade sparkles in and out pulsing
        this.opacity += this.opacitySpeed;
        if (this.opacity > 0.95 || this.opacity < 0.15) {
          this.opacitySpeed = -this.opacitySpeed;
        }
        this.x += this.speedX;
      } 
      else if (currentTemplate === "islamic") {
        this.x += this.speedX + Math.sin(this.angle) * 0.1;
        this.angle += this.spinSpeed;
      } 
      else {
        // Garden wind sways
        this.x += this.speedX + Math.sin(this.angle) * 0.3;
        this.angle += this.spinSpeed;
      }

      // Reset when particle drifts off screen boundaries
      if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }

    draw() {
      // Draw nothing if view is currently in homepage creation forms to keep readability high
      const isCreatorVisible = !document.getElementById("creator-container").classList.contains("hidden");
      if (isCreatorVisible) return;

      ctx.save();
      ctx.translate(this.x, this.y);

      if (this.isRoyalSparkle) {
        // Golden Diamond Shimmer
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 1.5);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(0, this.size * 1.5);
        ctx.lineTo(-this.size, 0);
        ctx.closePath();
        ctx.fillStyle = `rgba(223, 195, 132, ${this.opacity})`;
        ctx.fill();
      } 
      else if (this.template === "islamic") {
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 1.7, 0, 0, Math.PI * 2);
        // Alternate colors: sage-green leaf or luxury gold point
        ctx.fillStyle = this.isSageLeaf 
          ? `rgba(110, 125, 115, ${this.opacity})` 
          : `rgba(223, 195, 132, ${this.opacity})`;
        ctx.fill();
      } 
      else {
        // Garden Romance
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
        // Alternate colors: soft rose-petal pink or warm gold petal
        ctx.fillStyle = this.isPinkPetal 
          ? `rgba(240, 180, 185, ${this.opacity})` 
          : `rgba(223, 195, 132, ${this.opacity})`;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

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
