/**
 * Floating pills scroll observer and modals opener.
 */
export function setupFloatingActionsAndModals() {
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
