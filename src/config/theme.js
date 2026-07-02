import { templates } from './templates.js';

/**
 * Dynamically applies the chosen template's visual color token variables
 * to the invitation container.
 */
export function applyTheme(templateId) {
  const template = templates[templateId];
  if (!template) return;
  
  const container = document.getElementById("invitation-container");
  if (!container) return;

  const colors = template.colors;
  
  // Create a darker variant for gradients/shadow tracks
  let creamDark = "#e8ece8";
  if (templateId === "garden") {
    creamDark = "#fcf3e6";
  } else if (templateId === "royal") {
    creamDark = "#ecdcb9";
  }

  // Set dynamic CSS custom properties on root documentElement for global scrollbars & body styles
  document.documentElement.style.setProperty("--color-cream", colors.background);
  document.documentElement.style.setProperty("--color-cream-dark", creamDark);
  document.documentElement.style.setProperty("--color-charcoal", colors.text);
  document.documentElement.style.setProperty("--color-gold-light", colors.gold);
  document.documentElement.style.setProperty("--color-gold-dark", colors.dark);
  document.documentElement.style.setProperty("--color-gray-dark", colors.muted);
  
  // Set on container for scoped elements
  container.style.setProperty("--color-cream", colors.background);
  container.style.setProperty("--color-cream-dark", creamDark);
  container.style.setProperty("--color-charcoal", colors.text);
  container.style.setProperty("--color-gold-light", colors.gold);
  container.style.setProperty("--color-gold-dark", colors.dark);
  container.style.setProperty("--color-gray-dark", colors.muted);

  // Apply decoration overlays dynamically based on decorations structure
  const overlayContainer = container.querySelector(".template-decoration-overlay");
  if (overlayContainer) {
    overlayContainer.innerHTML = "";
    if (template.decorations) {
      template.decorations.forEach(decor => {
        if (decor.type === "petal") {
          const petal = document.createElement("div");
          petal.className = "template-floating-petal";
          petal.style.cssText = decor.style;
          petal.textContent = decor.char;
          overlayContainer.appendChild(petal);
        } else if (decor.type === "shimmer") {
          const shimmer = document.createElement("div");
          shimmer.className = "template-shimmer-effect";
          overlayContainer.appendChild(shimmer);
        } else if (decor.type === "arch") {
          const arch = document.createElement("div");
          arch.className = "template-arch-outline";
          overlayContainer.appendChild(arch);
        }
      });
    }
  }

  // Update background, overlay and section-overlay images based on the config
  const bgImg = container.querySelector(".bg-img");
  if (bgImg) bgImg.src = template.background;

  const overlayImg = container.querySelector(".overlay-img");
  if (overlayImg) {
    if (template.overlay) {
      overlayImg.src = template.overlay;
      overlayImg.style.display = "";
    } else {
      overlayImg.style.display = "none";
    }
  }

  const sectionOverlayImg = container.querySelector(".section-overlay-img");
  if (sectionOverlayImg) {
    if (template.overlay) {
      sectionOverlayImg.src = template.overlay;
      sectionOverlayImg.style.display = "";
    } else {
      sectionOverlayImg.style.display = "none";
    }
  }
}
