import { getActiveDetails } from './storage.js';
import { defaultInvitation } from '../config/constants.js';
import { applyTheme } from '../config/theme.js';
import { smoothScrollTo } from './scroll.js';
import { templates } from '../config/templates.js';
import { invitationService } from '../services/invitation.service.js';

function isColorLight(hex) {
  if (!hex || hex[0] !== '#') return true;
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma > 150;
}

export function getResolvedAppearance(details) {
  const templateId = details.template || "garden";
  const template = templates[templateId];
  const defaults = template.appearanceDefaults || {
    preset: "designer",
    headingColor: "#2d2a26",
    bodyColor: "#6e6962",
    accentColor: "#a8936d",
    textShadow: false,
    overlayOpacity: 0.0,
    buttonStyle: "filled"
  };

  const appearance = details.appearance || {};
  const preset = appearance.preset || "designer";

  if (preset === "designer") {
    return { ...defaults, preset: "designer" };
  } else if (preset === "light") {
    return {
      preset: "light",
      headingColor: "#FFFFFF",
      bodyColor: "#FFFFFF",
      accentColor: "#F5D77F",
      textShadow: true,
      overlayOpacity: 0.35,
      buttonStyle: "filled"
    };
  } else if (preset === "dark") {
    return {
      preset: "dark",
      headingColor: "#1F1F1F",
      bodyColor: "#2D2A26",
      accentColor: "#A8936D",
      textShadow: false,
      overlayOpacity: 0.20,
      buttonStyle: "outline"
    };
  } else if (preset === "gold") {
    return {
      preset: "gold",
      headingColor: "#dfc384",
      bodyColor: "#FAF6F0",
      accentColor: "#dfc384",
      textShadow: true,
      overlayOpacity: 0.30,
      buttonStyle: "filled"
    };
  } else {
    // custom
    return {
      preset: "custom",
      headingColor: appearance.headingColor || defaults.headingColor,
      bodyColor: appearance.bodyColor || defaults.bodyColor,
      accentColor: appearance.accentColor || defaults.accentColor,
      textShadow: appearance.textShadow !== undefined ? appearance.textShadow : defaults.textShadow,
      overlayOpacity: appearance.overlayOpacity !== undefined ? appearance.overlayOpacity : defaults.overlayOpacity,
      buttonStyle: appearance.buttonStyle || defaults.buttonStyle
    };
  }
}

export function applyAppearance(details) {
  const apper = getResolvedAppearance(details);
  const container = document.getElementById("invitation-container");
  if (!container) return;

  container.style.setProperty('--heading-color', apper.headingColor);
  container.style.setProperty('--body-color', apper.bodyColor);
  container.style.setProperty('--accent-color', apper.accentColor);
  container.style.setProperty('--text-shadow', apper.textShadow ? '0 1px 3px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.3)' : 'none');
  container.style.setProperty('--overlay-opacity', apper.overlayOpacity);

  const isBodyLight = isColorLight(apper.bodyColor);
  const overlayBg = isBodyLight ? "0, 0, 0" : "255, 255, 255";
  container.style.setProperty('--overlay-bg-color', overlayBg);

  if (apper.buttonStyle === "filled") {
    container.style.setProperty('--button-bg', apper.accentColor);
    container.style.setProperty('--button-border', apper.accentColor);
    container.style.setProperty('--button-text', isColorLight(apper.accentColor) ? "#131211" : "#ffffff");
  } else {
    container.style.setProperty('--button-bg', 'transparent');
    container.style.setProperty('--button-border', apper.accentColor);
    container.style.setProperty('--button-text', apper.accentColor);
  }
}

/**
 * Overwrites target text and asset elements inside our luxury invitation template wrapper.
 */
export async function loadAndInjectInvitationDetails() {
  let details = getActiveDetails();

  const hash = window.location.hash || "";
  if (hash.startsWith("#invite/")) {
    const slug = hash.replace("#invite/", "");
    const invitation = await invitationService.getInvitationBySlug(slug);
    if (invitation) {
      details = invitation.content;
      window.activeInvitationId = invitation.id;
      if (!details.template) details.template = "garden";
      invitationService.trackEvent(invitation.id, 'total_views');
      invitationService.trackEvent(invitation.id, 'unique_views');
    }
  } else if (hash.startsWith("#edit/")) {
    const token = hash.replace("#edit/", "");
    const invitation = await invitationService.getInvitationByEditToken(token);
    if (invitation) {
      details = invitation.content;
      window.activeInvitationId = invitation.id;
      if (!details.template) details.template = "garden";
      invitationService.trackEvent(invitation.id, 'total_views');
      invitationService.trackEvent(invitation.id, 'unique_views');
    }
  }

  // Apply the theme CSS variables and custom template graphics/overlays dynamically!
  await applyTheme(details.template);

  // 1. Overwrite central content texts
  const injectMapping = {
    "event-type": details.event,
    "groom-name": details.groom,
    "bride-name": details.bride,
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

  // Handle wedding date with elegant split for Royal Malay
  const dateEl = document.getElementById("event-date");
  if (dateEl) {
    if (details.template === "royal") {
      const dateVal = details.date || "Saturday, 29 June 2026";
      if (dateVal.includes(",")) {
        const parts = dateVal.split(",");
        dateEl.innerHTML = `<span class="date-day">${parts[0].trim()}</span><br><span class="date-main">${parts[1].trim()}</span>`;
      } else {
        dateEl.innerHTML = dateVal;
      }
    } else {
      dateEl.textContent = details.date;
    }
  }

  // Dynamic ampersand connector
  const ampersandEl = document.querySelector(".ampersand");
  if (ampersandEl) {
    if (details.template === "royal") {
      ampersandEl.textContent = "&";
    } else {
      ampersandEl.textContent = "and";
    }
  }

  // Dynamic bottom scroll hint
  const indicatorText = document.querySelector(".indicator-text");
  if (indicatorText) {
    if (details.template === "royal") {
      indicatorText.textContent = "Sentuh Untuk Membuka";
    } else {
      indicatorText.textContent = "Scroll to Begin";
    }
  }

  // Dynamic quote below the names
  const quoteContainer = document.getElementById("wedding-quote-container");
  const quoteEl = document.getElementById("wedding-quote");
  if (quoteContainer && quoteEl) {
    if (details.template === "royal") {
      quoteContainer.classList.remove("hidden");
      quoteEl.innerHTML = `Dengan penuh kesyukuran,<br>kami menjemput Dato', Datin, Tuan, Puan,<br>saudara dan saudari<br>ke majlis perkahwinan kami.`;
    } else {
      quoteContainer.classList.add("hidden");
      quoteEl.textContent = "";
    }
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

  // 4. Map actions binding with event tracking
  const gmapsBtn = document.getElementById("btn-google-maps");
  if (gmapsBtn) {
    gmapsBtn.setAttribute("href", details.gmaps);
    gmapsBtn.addEventListener("click", () => {
      if (window.activeInvitationId) {
        invitationService.trackEvent(window.activeInvitationId, 'map_clicks');
      }
    });
  }
  
  const wazeBtn = document.getElementById("btn-waze");
  if (wazeBtn) {
    wazeBtn.setAttribute("href", details.waze);
    wazeBtn.addEventListener("click", () => {
      if (window.activeInvitationId) {
        invitationService.trackEvent(window.activeInvitationId, 'map_clicks');
      }
    });
  }

  // Track horizontal swipe gallery interaction
  const galleryContainer = document.getElementById("horizontal-gallery");
  if (galleryContainer) {
    galleryContainer.addEventListener("click", () => {
      if (window.activeInvitationId) {
        invitationService.trackEvent(window.activeInvitationId, 'gallery_opens');
      }
    }, { once: true });
  }

  // Dynamic share trigger button in the RSVP section
  const shareTrigger = document.getElementById("section-share-trigger");
  if (shareTrigger) {
    shareTrigger.addEventListener("click", () => {
      const publicLink = window.location.href;
      navigator.clipboard.writeText(publicLink);
      
      // Show elegant dynamic toast
      const toast = document.getElementById("toast-container");
      const toastMsg = document.getElementById("toast-message");
      if (toast && toastMsg) {
        toastMsg.textContent = "Invitation link copied to clipboard!";
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 3000);
      }
      
      if (window.activeInvitationId) {
        invitationService.trackEvent(window.activeInvitationId, 'share_count');
      }
    });
  }

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

  // 7. Apply custom appearance settings dynamically
  applyAppearance(details);
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
          if (window.activeInvitationId) {
            invitationService.trackEvent(window.activeInvitationId, 'music_plays');
          }
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
        if (window.activeInvitationId) {
          invitationService.trackEvent(window.activeInvitationId, 'music_plays');
        }
      }).catch(err => console.log("Audio play error:", err));
    } else {
      audio.pause();
      newMusicBtn.classList.remove("playing");
    }
  });
}
