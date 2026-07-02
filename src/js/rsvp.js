/**
 * Handles RSVP submission verification.
 */
export function setupRSVPForm() {
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
