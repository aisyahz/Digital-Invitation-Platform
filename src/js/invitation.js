import { getActiveDetails } from './storage.js';
import { defaultInvitation } from '../config/constants.js';
import { applyTheme } from '../config/theme.js';
import { smoothScrollTo } from './scroll.js';

/**
 * Overwrites target text and asset elements inside our luxury invitation template wrapper.
 */
export function loadAndInjectInvitationDetails() {
  const details = getActiveDetails();

  // Apply the theme CSS variables and custom template graphics/overlays dynamically!
  applyTheme(details.template);

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

  // 3. Format and render thank you closing date
  const closingDate = document.getElementById("thank-you-date");
  if (closingDate) {
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
export function resetInvitationGate() {
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
  
  // Re-bind gate trigger to clone and clear state
  setupInvitationGateTrigger();
}

/**
 * Handles the opening curtain/gate sliding animation.
 */
export function setupInvitationGateTrigger() {
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

/**
 * Setup ambient background music player.
 */
export function setupMusicController() {
  const musicBtn = document.getElementById("music-toggle-btn");
  const audio = document.getElementById("bg-music");

  if (!musicBtn || !audio) return;

  // Clone node to prevent multiple event listeners during routing changes
  const newMusicBtn = musicBtn.cloneNode(true);
  if (musicBtn.parentNode) {
    musicBtn.parentNode.replaceChild(newMusicBtn, musicBtn);
  }

  newMusicBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        newMusicBtn.classList.add("playing");
      }).catch(err => console.log("Audio play error:", err));
    } else {
      audio.pause();
      newMusicBtn.classList.remove("playing");
    }
  });
}
