import { templateService } from '../services/template.service.js';

/**
 * Dynamically applies the chosen template's visual color token variables
 * and custom Google fonts to the invitation container.
 */
export async function applyTheme(templateId) {
  const template = await templateService.getTemplateById(templateId);
  if (!template) return;
  
  const container = document.getElementById("invitation-container");
  if (!container) return;

  const config = template.config || {};
  const colors = config.colors || {
    background: "#fdfbf7",
    primary: "#f0b4b9",
    dark: "#a8936d",
    gold: "#dfc384",
    text: "#2d2a26",
    muted: "#8c7251"
  };
  
  // Create a darker variant for gradients/shadow tracks
  let creamDark = "#e8ece8";
  if (templateId === "garden") {
    creamDark = "#fcf3e6";
  } else if (templateId === "royal") {
    creamDark = "#ecdcb9";
  } else if (config.secondaryColor) {
    creamDark = config.secondaryColor;
  }

  // Dynamically load Google fonts if specified in config.json
  if (config.headingFont) {
    const fontName = config.headingFont;
    let fontLink = document.getElementById(`font-heading-${fontName.replace(/\s+/g, '-')}`);
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = `font-heading-${fontName.replace(/\s+/g, '-')}`;
      fontLink.rel = "stylesheet";
      fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}&display=swap`;
      document.head.appendChild(fontLink);
    }
    container.style.setProperty("--font-display", `'${fontName}', serif`);
  }
  if (config.bodyFont) {
    const fontName = config.bodyFont;
    let fontLink = document.getElementById(`font-body-${fontName.replace(/\s+/g, '-')}`);
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = `font-body-${fontName.replace(/\s+/g, '-')}`;
      fontLink.rel = "stylesheet";
      fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}&display=swap`;
      document.head.appendChild(fontLink);
    }
    container.style.setProperty("--font-sans", `'${fontName}', sans-serif`);
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
    if (config.decorations) {
      config.decorations.forEach(decor => {
        if (decor.type === "petal") {
          const petal = document.createElement("div");
          const particleClass = config.particleEffect === "petal" ? "template-floating-petal" : "template-floating-petal";
          petal.className = particleClass;
          petal.style.cssText = decor.style;
          petal.textContent = decor.char || "🌸";
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
  if (bgImg && config.background) bgImg.src = config.background;

  const overlayImg = container.querySelector(".overlay-img");
  if (overlayImg) {
    if (config.overlay) {
      overlayImg.src = config.overlay;
      overlayImg.style.display = "";
    } else {
      overlayImg.style.display = "none";
    }
  }

  const sectionOverlayImg = container.querySelector(".section-overlay-img");
  if (sectionOverlayImg) {
    if (config.overlay) {
      sectionOverlayImg.src = config.overlay;
      sectionOverlayImg.style.display = "";
    } else {
      sectionOverlayImg.style.display = "none";
    }
  }
}
