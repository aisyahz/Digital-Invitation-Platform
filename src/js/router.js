import { getActiveDetails } from './storage.js';
import { loadAndInjectInvitationDetails, resetInvitationGate } from './invitation.js';
import { initPaymentPage } from './payment.js';

/**
 * Premium Hash-Based Routing System.
 */
export function setupRouting() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}

export function handleRoute() {
  const rawHash = window.location.hash || "#home";
  const hash = normalizeHash(rawHash);
  
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
    
    // Reset the secure payment UI state
    initPaymentPage();
    
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
    // Reveal Published Live Invitation (Pristine Mode only if paid)
    document.body.classList.add("live-mode");
    document.body.classList.add("scroll-locked");

    // Enforce watermark if payment is not fully paid
    const isPaid = localStorage.getItem("paymentStatus") === "paid";
    if (!isPaid) {
      document.body.classList.add("preview-mode");
    }

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

function normalizeHash(hash) {
  if (hash.startsWith("#/")) {
    hash = `#${hash.slice(2)}`;
  }

  if (hash === "#builder") {
    return "#create";
  }

  return hash;
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
