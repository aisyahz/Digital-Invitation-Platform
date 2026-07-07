import { templateService } from '../services/template.service.js';
import { setSelectedTemplate } from './storage.js';

const WHATSAPP_ORDER_NUMBER = "60136648159";

function buildWhatsAppOrderUrl(template) {
  const message = [
    "Hi KadKita, I want to order an invitation.",
    "",
    `Template: ${template.name || ""}`,
    `Price: ${template.price || ""}`,
    "Wedding date:",
    "Bride name:",
    "Groom name:",
    "Venue:",
    "My name:",
    "My phone:"
  ].join("\n");

  return `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Dynamically builds the gallery cards on the homepage from templates.js or Supabase.
 * Fully supports zero-code addition of new templates!
 */
export async function renderTemplateGallery() {
  const container = document.querySelector(".templates-list");
  if (!container) return;

  container.innerHTML = `<div class="loading-placeholder" style="text-align: center; font-family: var(--font-sans); font-size: 0.8rem; color: var(--color-gray-dark); width: 100%; padding: 40px 0;">Loading our art gallery...</div>`;

  try {
    const templatesList = await templateService.getTemplates();
    container.innerHTML = "";

    templatesList.forEach(tpl => {
      const card = document.createElement("div");
      card.className = "template-card";

      // Create the preview thumbnail layout
      const previewDiv = document.createElement("div");
      // Use fallback class prefix for styling if it maps to local, otherwise generic preview
      const previewClass = ['garden', 'royal', 'islamic'].includes(tpl.id) ? `${tpl.id}-preview` : 'generic-preview';
      previewDiv.className = `template-card-preview ${previewClass}`;
      
      // Create the dynamic thumbnail image element
      const img = document.createElement("img");
      img.className = "template-thumbnail";
      img.src = tpl.thumbnail;
      img.alt = tpl.name;
      previewDiv.appendChild(img);

      // Dynamically render micro-decoration overlays (e.g. falling petals, shimmer, arches)
      if (tpl.config && tpl.config.decorations) {
        tpl.config.decorations.forEach(decor => {
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
      // Handle fallback description
      descP.textContent = tpl.description || tpl.config?.description || tpl.name + " - Exquisite premium illustrated layout.";

      const chooseBtn = document.createElement("button");
      chooseBtn.className = "choose-template-btn";
      chooseBtn.setAttribute("data-template", tpl.id);
      chooseBtn.textContent = "Choose Template";

      // Choice select click listener
      chooseBtn.addEventListener("click", () => {
        setSelectedTemplate(tpl.id);
        window.location.hash = "#create";
      });

      const whatsappBtn = document.createElement("a");
      whatsappBtn.className = "whatsapp-order-btn";
      whatsappBtn.href = buildWhatsAppOrderUrl(tpl);
      whatsappBtn.target = "_blank";
      whatsappBtn.rel = "noopener noreferrer";
      whatsappBtn.textContent = "Order via WhatsApp";

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "template-card-actions";
      actionsDiv.appendChild(whatsappBtn);
      actionsDiv.appendChild(chooseBtn);

      infoDiv.appendChild(priceDiv);
      infoDiv.appendChild(nameHeader);
      infoDiv.appendChild(descP);
      infoDiv.appendChild(actionsDiv);

      card.appendChild(previewDiv);
      card.appendChild(infoDiv);

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to render templates:", err);
    container.innerHTML = `<div class="error-placeholder" style="text-align: center; color: red;">Failed to load template gallery.</div>`;
  }
}
