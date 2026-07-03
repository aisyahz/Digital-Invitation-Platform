import { setupRouting } from './router.js';
import { setupScrollAnimations, setupCountdownTimer, setupAmbientCanvas } from './animation.js';
import { setupFloatingActionsAndModals } from './modal.js';
import { setupRSVPForm } from './rsvp.js';
import { setupMusicController } from './invitation.js';
import { setupPaymentSimulation } from './payment.js';
import { renderTemplateGallery } from './gallery.js';
import { getSelectedTemplate, saveActiveDetails } from './storage.js';
import { defaultInvitation } from '../config/constants.js';
import { setupAppearanceController } from './appearance.js';

// Initialize and bind events on DOM load
document.addEventListener("DOMContentLoaded", () => {
  // Render the Dynamic template gallery
  renderTemplateGallery();

  // Setup main routing system
  setupRouting();

  // Setup appearance controller
  setupAppearanceController();
  
  // Setup other interactive subsystems
  setupHomepageFlow();
  setupScrollAnimations();
  setupCountdownTimer();
  setupFloatingActionsAndModals();
  setupRSVPForm();
  setupMusicController();
  setupPaymentSimulation();
  setupAmbientCanvas();
});

/**
 * Setup additional event handlers for Homepage transitions and actions.
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

  // 2. Form submission for wedding details
  const creatorForm = document.getElementById("creator-form");
  if (creatorForm) {
    creatorForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Gather appearance details
      const presetSelect = document.getElementById("form-appearance-preset");
      const headingInput = document.getElementById("form-appearance-heading");
      const bodyInput = document.getElementById("form-appearance-body");
      const accentInput = document.getElementById("form-appearance-accent");
      const shadowCheckbox = document.getElementById("form-appearance-shadow");
      const overlaySlider = document.getElementById("form-appearance-overlay");
      const btnStyleSelect = document.getElementById("form-appearance-btn-style");

      const appearance = {
        preset: presetSelect ? presetSelect.value : "designer",
        headingColor: headingInput ? headingInput.value : "",
        bodyColor: bodyInput ? bodyInput.value : "",
        accentColor: accentInput ? accentInput.value : "",
        textShadow: shadowCheckbox ? shadowCheckbox.checked : false,
        overlayOpacity: overlaySlider ? parseFloat(overlaySlider.value) / 100 : 0.0,
        buttonStyle: btnStyleSelect ? btnStyleSelect.value : "filled"
      };

      // Bundle form fields to storage object
      const details = {
        template: getSelectedTemplate(),
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
        music: document.getElementById("form-music").value.trim() || defaultInvitation.music,
        appearance: appearance
      };

      saveActiveDetails(details);
      
      // Check if we are in Edit Mode to push changes directly to Supabase
      const activeEditToken = localStorage.getItem("activeEditToken");
      if (activeEditToken) {
        import('../services/invitation.service.js').then(async (m) => {
          const res = await m.invitationService.updateInvitation(activeEditToken, details);
          
          // Show small UI toast notification
          const toast = document.getElementById("toast-container");
          const toastMsg = document.getElementById("toast-message");
          if (toast && toastMsg) {
            toastMsg.textContent = res ? "Changes saved live to Supabase!" : "Failed to sync changes with Supabase.";
            toast.classList.remove("hidden");
            toast.classList.add("visible");
            setTimeout(() => {
              toast.classList.remove("visible");
              toast.classList.add("hidden");
            }, 3000);
          }
        });
      }
      
      // Navigate straight to preview
      window.location.hash = "#preview";
    });
  }

  // 3. Copier live share link buttons
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

  // 4. Dismiss successful publish popups
  const dismissBtn = document.getElementById("btn-dismiss-success");
  const liveBanner = document.getElementById("live-success-banner");
  if (dismissBtn && liveBanner) {
    dismissBtn.addEventListener("click", () => {
      liveBanner.classList.add("hidden");
    });
  }
}
