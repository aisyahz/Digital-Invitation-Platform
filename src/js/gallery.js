import { templates } from '../config/templates.js';
import { setSelectedTemplate } from './storage.js';

/**
 * Dynamically builds the gallery cards on the homepage from templates.js configuration.
 * Fully supports zero-code addition of new templates!
 */
export function renderTemplateGallery() {
  const container = document.querySelector(".templates-list");
  if (!container) return;

  container.innerHTML = "";

  Object.values(templates).forEach(tpl => {
    const card = document.createElement("div");
    card.className = "template-card";

    // Create the preview thumbnail layout
    const previewDiv = document.createElement("div");
    previewDiv.className = `template-card-preview ${tpl.id}-preview`;
    
    // Create the dynamic thumbnail image element
    const img = document.createElement("img");
    img.className = "template-thumbnail";
    img.src = tpl.thumbnail;
    img.alt = tpl.name;
    previewDiv.appendChild(img);

    // Dynamically render micro-decoration overlays (e.g. falling petals, shimmer, arches)
    if (tpl.decorations) {
      tpl.decorations.forEach(decor => {
        if (decor.type === "petal") {
          const petal = document.createElement("div");
          petal.className = "template-floating-petal";
          petal.style.cssText = decor.style;
          petal.textContent = decor.char;
          previewDiv.appendChild(petal);
        } else if (decor.type === "shimmer") {
          const shimmer = document.createElement("div");
          shimmer.className = "template-shimmer-effect";
          previewDiv.appendChild(shimmer);
        } else if (decor.type === "arch") {
          const arch = document.createElement("div");
          arch.className = "template-arch-outline";
          previewDiv.appendChild(arch);
        }
      });
    }

    // Create the pricing and info descriptors
    const infoDiv = document.createElement("div");
    infoDiv.className = "template-card-info";

    const priceDiv = document.createElement("div");
    priceDiv.className = "template-price";
    priceDiv.textContent = tpl.price;

    const nameHeader = document.createElement("h3");
    nameHeader.className = "template-name";
    nameHeader.textContent = tpl.name;

    const descP = document.createElement("p");
    descP.className = "template-desc";
    descP.textContent = tpl.description;

    const chooseBtn = document.createElement("button");
    chooseBtn.className = "choose-template-btn";
    chooseBtn.setAttribute("data-template", tpl.id);
    chooseBtn.textContent = "Choose Template";

    // Choice select click listener
    chooseBtn.addEventListener("click", () => {
      setSelectedTemplate(tpl.id);
      window.location.hash = "#create";
    });

    infoDiv.appendChild(priceDiv);
    infoDiv.appendChild(nameHeader);
    infoDiv.appendChild(descP);
    infoDiv.appendChild(chooseBtn);

    card.appendChild(previewDiv);
    card.appendChild(infoDiv);

    container.appendChild(card);
  });
}
