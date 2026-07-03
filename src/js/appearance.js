import { getActiveDetails, saveActiveDetails } from './storage.js';
import { getResolvedAppearance, applyAppearance } from './invitation.js';

/**
 * Initializes and registers event listeners for the Appearance customizer options.
 */
export function setupAppearanceController() {
  const presetSelect = document.getElementById("form-appearance-preset");
  const headingInput = document.getElementById("form-appearance-heading");
  const bodyInput = document.getElementById("form-appearance-body");
  const accentInput = document.getElementById("form-appearance-accent");
  const shadowCheckbox = document.getElementById("form-appearance-shadow");
  const overlaySlider = document.getElementById("form-appearance-overlay");
  const overlayValText = document.getElementById("form-appearance-overlay-val");
  const btnStyleSelect = document.getElementById("form-appearance-btn-style");

  if (!presetSelect) return;

  // Initialize and handle overlay range text label updates in real-time
  if (overlaySlider && overlayValText) {
    overlaySlider.addEventListener("input", () => {
      overlayValText.textContent = `${overlaySlider.value}%`;
    });
  }

  // Update visual state and values on preset selector changes
  function updateFormInputsFromPreset(presetValue, isInitialLoad = false) {
    const details = getActiveDetails();
    
    // Construct mock details representing the form state to resolve preset values
    const mockDetails = {
      ...details,
      appearance: {
        preset: presetValue,
        headingColor: headingInput ? headingInput.value : "",
        bodyColor: bodyInput ? bodyInput.value : "",
        accentColor: accentInput ? accentInput.value : "",
        textShadow: shadowCheckbox ? shadowCheckbox.checked : false,
        overlayOpacity: overlaySlider ? parseFloat(overlaySlider.value) / 100 : 0,
        buttonStyle: btnStyleSelect ? btnStyleSelect.value : "filled"
      }
    };

    const resolved = getResolvedAppearance(mockDetails);

    // Update form elements to match the selected preset values
    if (headingInput) headingInput.value = resolved.headingColor;
    if (bodyInput) bodyInput.value = resolved.bodyColor;
    if (accentInput) accentInput.value = resolved.accentColor;
    if (shadowCheckbox) shadowCheckbox.checked = resolved.textShadow;
    if (overlaySlider) {
      overlaySlider.value = Math.round(resolved.overlayOpacity * 100);
      if (overlayValText) {
        overlayValText.textContent = `${overlaySlider.value}%`;
      }
    }
    if (btnStyleSelect) btnStyleSelect.value = resolved.buttonStyle;

    // Toggle interactive inputs depending on whether a manual "custom" preset is selected
    const isCustom = presetValue === "custom";
    const inputsToToggle = [headingInput, bodyInput, accentInput, shadowCheckbox, overlaySlider, btnStyleSelect];
    inputsToToggle.forEach(input => {
      if (input) {
        if (isCustom) {
          input.removeAttribute("disabled");
          input.style.opacity = "1";
        } else {
          input.setAttribute("disabled", "true");
          input.style.opacity = "0.6";
        }
      }
    });

    if (!isInitialLoad) {
      saveCurrentAppearance();
    }
  }

  function saveCurrentAppearance() {
    const details = getActiveDetails();
    details.appearance = {
      preset: presetSelect.value,
      headingColor: headingInput ? headingInput.value : "",
      bodyColor: bodyInput ? bodyInput.value : "",
      accentColor: accentInput ? accentInput.value : "",
      textShadow: shadowCheckbox ? shadowCheckbox.checked : false,
      overlayOpacity: overlaySlider ? parseFloat(overlaySlider.value) / 100 : 0,
      buttonStyle: btnStyleSelect ? btnStyleSelect.value : "filled"
    };

    saveActiveDetails(details);

    // Apply real-time preview updates immediately to the active container elements
    applyAppearance(details);
  }

  // Bind change events
  presetSelect.addEventListener("change", () => {
    updateFormInputsFromPreset(presetSelect.value);
  });

  const fields = [headingInput, bodyInput, accentInput, shadowCheckbox, overlaySlider, btnStyleSelect];
  fields.forEach(field => {
    if (field) {
      field.addEventListener("input", saveCurrentAppearance);
      field.addEventListener("change", saveCurrentAppearance);
    }
  });

  // Perform initial visual load matching current local storage setup
  refreshAppearanceFields();
}

/**
 * Reads state from active storage and refreshes all builder form fields.
 */
export function refreshAppearanceFields() {
  const presetSelect = document.getElementById("form-appearance-preset");
  const headingInput = document.getElementById("form-appearance-heading");
  const bodyInput = document.getElementById("form-appearance-body");
  const accentInput = document.getElementById("form-appearance-accent");
  const shadowCheckbox = document.getElementById("form-appearance-shadow");
  const overlaySlider = document.getElementById("form-appearance-overlay");
  const overlayValText = document.getElementById("form-appearance-overlay-val");
  const btnStyleSelect = document.getElementById("form-appearance-btn-style");

  if (!presetSelect) return;

  const details = getActiveDetails();
  const appearance = details.appearance || { preset: "designer" };
  
  presetSelect.value = appearance.preset || "designer";

  const resolved = getResolvedAppearance(details);

  if (headingInput) headingInput.value = resolved.headingColor;
  if (bodyInput) bodyInput.value = resolved.bodyColor;
  if (accentInput) accentInput.value = resolved.accentColor;
  if (shadowCheckbox) shadowCheckbox.checked = resolved.textShadow;
  if (overlaySlider) {
    overlaySlider.value = Math.round(resolved.overlayOpacity * 100);
    if (overlayValText) {
      overlayValText.textContent = `${overlaySlider.value}%`;
    }
  }
  if (btnStyleSelect) btnStyleSelect.value = resolved.buttonStyle;

  const isCustom = resolved.preset === "custom";
  const inputsToToggle = [headingInput, bodyInput, accentInput, shadowCheckbox, overlaySlider, btnStyleSelect];
  inputsToToggle.forEach(input => {
    if (input) {
      if (isCustom) {
        input.removeAttribute("disabled");
        input.style.opacity = "1";
      } else {
        input.setAttribute("disabled", "true");
        input.style.opacity = "0.6";
      }
    }
  });

  // Keep live preview CSS variables synced instantly
  applyAppearance(details);
}
