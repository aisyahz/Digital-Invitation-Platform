# Luxury Digital Wedding Invitation — Technical & Aesthetic Blueprint

This document provides a comprehensive technical and aesthetic specification of the digital wedding invitation applet. It is designed to be fully self-contained so that any advanced AI (such as ChatGPT) or developer can instantly understand its styling principles, layout architecture, animation models, and interactive mechanics to maintain or extend the system with perfect consistency.

---

## 🎨 1. Concept & Visual Theme

The application's design is heavily influenced by the high-end editorial aesthetics of fashion houses like **Vogue** and **Dior**. It avoids generic, colorful gradients and instead utilizes negative space, strong typographic hierarchy, and a quiet, minimalist color palette.

### Color Tokens
*   **Warm Page Background (`html, body`):** `#F5F4EF` (A clean, elegant, warm off-white that feels like high-grade organic cotton paper).
*   **Card Container Base (`--color-cream`):** `#FAF9F5` (A slightly brighter, luxurious cream that adds depth when layered over the body background).
*   **Primary Text (`--color-charcoal`):** `#131211` (An organic near-black that is softer on the eyes than solid `#000000` but offers high, crisp contrast).
*   **Luxury Accents (`--color-gold-dark` / `light`):** `#A8936D` / `#DFC384` (Quiet, desaturated champagne/gold tones used sparingly for borders, subtle decorations, and action states).

### Typography Pairings
*   **Display/Headings:** Playfair Display / Serif — tracking is kept loose and elegant; headings use `font-weight: 400` with generous leading to convey a bespoke, editorial look.
*   **Secondary/Subtitles:** Space Grotesk / Outfit — modern geometric accents for countdown timers, labels, and numbers.
*   **Body & System Text:** Inter — clean, high-legibility sans-serif used for paragraph text, form labels, and instructions.
*   **Technical Indicators / Monospace:** JetBrains Mono — used for subtle secondary numbers or fine print details.

---

## 📐 2. Layout & Viewport Sizing

To ensure consistent, premium presentation across all devices (desktops, tablets, and phones), the application implements a **Mobile-First Desktop-Centered Frame** architecture:

1.  **Outer Desktop Wrapper:** The document body (`body`) handles the main scroll. On desktop screens, it centers a responsive mobile frame (`max-width: 430px`) using CSS Flexbox.
2.  **Compact Responsive Padding:** The sections do **not** use fixed `100vh` heights. Instead, they feature responsive, tight vertical paddings (`padding: 48px 24px` to `64px 24px`) to eliminate awkward gaps on taller phones, presenting a highly cohesive, readable card flow.
3.  **Unified Scrollbar System:** All scrollbars on the container are customized to be ultra-thin and styled in muted gold (`rgba(168, 147, 109, 0.25)`) so they never disrupt the visual balance.

---

## 🎬 3. Animation Engine

Animations are crafted to look organic, deliberate, and luxurious. 

### A. The Opening Curtain/Gate
Upon initial page load, the reader is presented with an overlay gate that blocks the invitation.
*   **Behavior:** Clicking the customized trigger button starts a sequence that splits the left and right curtain halves (`transform: translateX(-100%)` and `translateX(100%)`) with a premium `cubic-bezier(0.16, 1, 0.3, 1)` easing.
*   **Automatic Cinematic Scroll:** 2.5 seconds after opening (allowing the sliding and initial fade-in to settle), the engine triggers an automatic, slow scroll down to the Happy Couple profiles (`#section-profiles`).

### B. Custom Smooth Scroll Formula (`smoothScrollTo`)
To bypass rough native browser scrolling, the app utilizes a custom easing scroll script written in vanilla JavaScript:
```javascript
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
```
*   **Aesthetic Impact:** Rather than a linear movement, this maps the scroll timeline onto a cubic bezier curve. It accelerates slowly and decelerates with a gentle, premium decay over a luxurious 2-second timeline.

### C. Scroll-Triggered Reveals (`IntersectionObserver`)
Sections and internal elements are animated using an efficient, viewport-level `IntersectionObserver`:
*   **Trigger Target:** `.animate-on-scroll` elements.
*   **Base Styles:** `opacity: 0; transform: translateY(24px); transition: opacity 900ms ease-out, transform 900ms ease-out;`
*   **Active Styles (`.animate-active`):** `opacity: 1; transform: translateY(0);`
*   **Trigger Threshold:** `0.12` (triggers when 12% of the section is visible to ensure the content is entering the viewport before showing).

---

## 🔔 4. Interaction, Modals, & Floating Actions

### Fixed Viewport Modals (`position: fixed`)
The RSVP Response form and the Contact Family info card are styled as luxury modals that slide up from the bottom of the screen.
*   **Positioning:** Styled using `position: fixed` with a high `z-index: 100` and backdrop blur (`backdrop-filter: blur(8px)`).
*   **Bottom-of-page Fix:** Because they are fixed to the viewport rather than absolute-positioned to the document container, they trigger perfectly in the center of the screen, even if the user is scrolled all the way to the very bottom of the long invitation card.

### Dynamic Floating Buttons
*   **RSVP Quick Action:** An elegant, blurred-background pill button (`.luxury-floating-rsvp-btn`) floats in the lower-right corner.
*   **Scroll Trigger:** A scroll listener monitors `window.scrollY`. The button only fades in (`.visible`) after the user scrolls past `0.75` of the hero screen height, preventing clutter during the opening sequence.

---

## 🍃 5. Ghibli-Style Atmosphere & Audio Experience

To fulfill the vision of an interactive piece of art that elicits deep, nostalgic emotion, two ambient elements are woven into the invitation:

### A. Ambient Falling Blossom Particles
A highly optimized, hardware-accelerated HTML5 `<canvas>` rendering system floats custom-drawn floral blossom petals:
*   **Interactive Fluidity:** Rather than linear paths, each petal is simulated with a custom sway velocity (`Math.sin`), rotative speed, and unique scale, colored in luxury golds and champagne shades with gentle translucent gradients.
*   **Performance First:** Runs on `requestAnimationFrame` and keeps particle counts lightweight to ensure a lock-step, silk-smooth 60 FPS animation on all mobile devices.

### B. Luxury Spinning Audio Disk
A premium, glassmorphic circular music player controller floats at the top-right corner of the viewport:
*   **Autoplay Integration:** Clicking the main opening curtain trigger begins streaming a beautiful, warm acoustic guitar and piano ballad (`#bg-music`). This complies fully with modern browser user-interaction rules.
*   **Vinyl Animation:** Once playing, the disc spins slowly (`animation: spin 6s linear infinite`) and glows with subtle golden accents. Clicking the disc toggles audio play and pauses the rotation gracefully.
