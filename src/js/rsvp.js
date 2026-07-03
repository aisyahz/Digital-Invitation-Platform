import { rsvpService } from '../services/rsvp.service.js';
import { invitationService } from '../services/invitation.service.js';

/**
 * Handles RSVP submission verification.
 */
export function setupRSVPForm() {
  const form = document.getElementById("rsvp-form");
  const successState = document.getElementById("rsvp-success");

  if (form && successState) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const name = formData.get("name");
      const phone = formData.get("phone");
      const guests = formData.get("guests");
      const attendance = formData.get("attendance");
      const message = formData.get("message") || "";

      const submitBtn = form.querySelector("button[type='submit']");
      const originalText = submitBtn ? submitBtn.textContent : "Submit RSVP";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
      }

      try {
        const activeId = window.activeInvitationId || 'preview-demo-id';

        // 1. Submit RSVP entry to Supabase rsvps table
        await rsvpService.submitRSVP({
          invitation_id: activeId,
          name: name,
          phone: phone,
          attendance: attendance === 'Attending' ? 'yes' : 'no',
          pax: parseInt(guests) || 2,
          message: message
        });

        // 2. Submit congratulatory well-wishes if entered
        if (message.trim()) {
          await rsvpService.submitGuestMessage({
            invitation_id: activeId,
            guest_name: name,
            message: message
          });
        }

        // 3. Increment RSVP count analytic
        if (activeId !== 'preview-demo-id') {
          await invitationService.trackEvent(activeId, 'rsvp_count');
        }

        form.classList.add("hidden");
        successState.classList.remove("hidden");
        form.reset();

      } catch (err) {
        console.error("RSVP Submission failed:", err);
        alert("Failed to submit RSVP. Please try again.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
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
