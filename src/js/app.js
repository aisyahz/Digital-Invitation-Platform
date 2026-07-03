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
import { appConfig } from '../config/app.config.js';

// Initialize and bind events on DOM load
document.addEventListener("DOMContentLoaded", () => {
  // Apply dynamic app configuration first
  applyAppConfig();

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

  // 1.1 Hamburg Menu Toggle and Dropdown Control
  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const dropdownMenu = document.getElementById("dropdown-menu");
  if (menuToggleBtn && dropdownMenu) {
    menuToggleBtn.addEventListener("click", () => {
      const isClosed = dropdownMenu.classList.contains("hidden") || !dropdownMenu.classList.contains("show");
      if (isClosed) {
        menuToggleBtn.classList.add("open");
        dropdownMenu.classList.remove("hidden");
        // force reflow
        dropdownMenu.offsetHeight;
        dropdownMenu.classList.add("show");
      } else {
        menuToggleBtn.classList.remove("open");
        dropdownMenu.classList.remove("show");
        setTimeout(() => {
          if (!dropdownMenu.classList.contains("show")) {
            dropdownMenu.classList.add("hidden");
          }
        }, 300);
      }
    });

    // Dismiss menu when links clicked
    const menuLinks = dropdownMenu.querySelectorAll(".menu-item-link");
    menuLinks.forEach(link => {
      link.addEventListener("click", () => {
        menuToggleBtn.classList.remove("open");
        dropdownMenu.classList.remove("show");
        dropdownMenu.classList.add("hidden");
      });
    });
  }

  // 1.1.5 Smooth Scrolling to templates-section
  const scrollToTemplates = document.getElementById("scroll-to-templates");
  if (scrollToTemplates) {
    scrollToTemplates.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("templates-section");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // 1.2 Couple Photo Drag and Drop + File Upload Interactive Controls
  const photoContainer = document.querySelector(".photo-upload-preview-container");
  const photoInput = document.getElementById("form-couple-photo");
  const photoPreview = document.getElementById("form-couple-photo-preview");
  const photoPlaceholder = document.getElementById("form-couple-photo-placeholder");
  const photoWarning = document.getElementById("photo-upload-warning");

  if (photoContainer && photoInput) {
    // Click area triggers file input selection
    photoContainer.addEventListener("click", (e) => {
      // Prevent recursion if input itself was clicked/triggered
      if (e.target !== photoInput) {
        photoInput.click();
      }
    });

    // Drag over handlers
    photoContainer.addEventListener("dragover", (e) => {
      e.preventDefault();
      photoContainer.style.borderColor = "var(--color-gold-dark)";
      photoContainer.style.backgroundColor = "rgba(168, 147, 109, 0.05)";
    });

    photoContainer.addEventListener("dragleave", () => {
      photoContainer.style.borderColor = "";
      photoContainer.style.backgroundColor = "";
    });

    photoContainer.addEventListener("drop", (e) => {
      e.preventDefault();
      photoContainer.style.borderColor = "";
      photoContainer.style.backgroundColor = "";
      
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handlePhotoFile(file);
      }
    });

    photoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        handlePhotoFile(file);
      }
    });

    function handlePhotoFile(file) {
      // 2MB size check (2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        if (photoWarning) {
          photoWarning.classList.remove("hidden");
        }
        photoInput.value = "";
        return;
      }

      if (photoWarning) {
        photoWarning.classList.add("hidden");
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        if (photoPreview) {
          photoPreview.src = dataUrl;
          photoPreview.classList.remove("hidden");
        }
        if (photoPlaceholder) {
          photoPlaceholder.classList.add("hidden");
        }
        photoContainer.setAttribute("data-url", dataUrl);
        photoContainer.setAttribute("data-filename", file.name);
      };
      reader.readAsDataURL(file);
    }
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

      const pContainer = document.querySelector(".photo-upload-preview-container");
      const couplePhotoUrl = pContainer ? pContainer.getAttribute("data-url") : "";
      const couplePhotoName = pContainer ? pContainer.getAttribute("data-filename") : "";

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
        appearance: appearance,
        couplePhoto: {
          fileName: couplePhotoName || "",
          dataUrl: couplePhotoUrl || ""
        }
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

/**
 * Dynamically applies the brand configuration from app.config.js to the DOM.
 */
function applyAppConfig() {
  // Set page title
  document.title = `${appConfig.brandName} | Beautiful Digital Invitations`;
  
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", `Create beautiful digital invitations for weddings, birthdays, graduations, corporate events, and more with ${appConfig.brandName}.`);
  }

  // Update dynamic brand monogram elements
  const monograms = document.querySelectorAll(".brand-monogram");
  monograms.forEach(el => {
    el.textContent = appConfig.brandName.charAt(0);
  });

  // Update brand logo elements
  const logos = document.querySelectorAll(".brand-logo");
  logos.forEach(el => {
    el.textContent = appConfig.brandName;
  });

  // Handle optional logo image in header (if /brand/logo.webp exists, use it and hide text logo/monogram)
  const brandLogoImg = document.getElementById("brand-logo-img");
  const brandLogoText = document.getElementById("brand-logo-text");
  const brandMonogram = document.querySelector(".brand-monogram");
  if (brandLogoImg) {
    brandLogoImg.onload = () => {
      brandLogoImg.classList.remove("hidden");
      if (brandLogoText) brandLogoText.classList.add("hidden");
      if (brandMonogram) brandMonogram.classList.add("hidden");
    };
    brandLogoImg.onerror = () => {
      brandLogoImg.classList.add("hidden");
      if (brandLogoText) brandLogoText.classList.remove("hidden");
      if (brandMonogram) brandMonogram.classList.remove("hidden");
    };
    brandLogoImg.src = "/brand/logo.webp";
  }

  // Handle optional home banner image in hero (if /brand/home-banner.webp exists, use it and hide placeholder)
  const homeBannerImg = document.getElementById("home-banner-img");
  const homeBannerPlaceholder = document.getElementById("home-banner-placeholder");
  if (homeBannerImg) {
    homeBannerImg.onload = () => {
      homeBannerImg.classList.remove("hidden");
      if (homeBannerPlaceholder) homeBannerPlaceholder.classList.add("hidden");
    };
    homeBannerImg.onerror = () => {
      homeBannerImg.classList.add("hidden");
      if (homeBannerPlaceholder) homeBannerPlaceholder.classList.remove("hidden");
    };
    homeBannerImg.src = "/brand/home-banner.webp";
  }

  // Update premium badge references
  const premiumBadges = document.querySelectorAll(".premium-badge");
  premiumBadges.forEach(el => {
    if (el.textContent.includes("WORKSPACE")) {
      el.textContent = `${appConfig.brandName.toUpperCase()} WORKSPACE`;
    }
  });

  // Update preview banner text
  const previewBannerText = document.querySelector(".preview-banner-text");
  if (previewBannerText) {
    previewBannerText.textContent = `✨ PREVIEW MODE | ${appConfig.brandName} Sandbox`;
  }

  // Update default share links
  const shareInput = document.getElementById("live-share-link");
  if (shareInput) {
    shareInput.value = `${appConfig.domain}/#/invite/adam-hawa`;
  }

  // Update email placeholder in admin panel
  const adminEmailInput = document.getElementById("admin-email");
  if (adminEmailInput) {
    adminEmailInput.placeholder = `admin@${appConfig.domain.replace('https://', '')}`;
  }
}

