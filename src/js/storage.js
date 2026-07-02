import { STORAGE_KEY_DETAILS, STORAGE_KEY_TEMPLATE, defaultInvitation } from '../config/constants.js';

/**
 * Retrieves the stored wedding details or falls back to standard defaults.
 */
export function getActiveDetails() {
  const stored = localStorage.getItem(STORAGE_KEY_DETAILS);
  const chosenTemplate = localStorage.getItem(STORAGE_KEY_TEMPLATE) || "garden";
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      parsed.template = chosenTemplate;
      return parsed;
    } catch (e) {
      console.warn("Details parse error, falling back to defaults.", e);
    }
  }
  
  const d = { ...defaultInvitation };
  d.template = chosenTemplate;
  return d;
}

/**
 * Saves current wedding details into localStorage.
 */
export function saveActiveDetails(details) {
  localStorage.setItem(STORAGE_KEY_DETAILS, JSON.stringify(details));
}

/**
 * Sets the selected template in storage.
 */
export function setSelectedTemplate(templateId) {
  localStorage.setItem(STORAGE_KEY_TEMPLATE, templateId);
}

/**
 * Gets the currently selected template ID from storage.
 */
export function getSelectedTemplate() {
  return localStorage.getItem(STORAGE_KEY_TEMPLATE) || "garden";
}
