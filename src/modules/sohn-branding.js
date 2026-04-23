import { BRANDING } from '../../config/branding.js';

export function applyBranding() {
  try {
    document.querySelectorAll('[data-brand-short]').forEach(el => {
      el.textContent = BRANDING.shortName;
    });

    document.querySelectorAll('[data-brand-legal]').forEach(el => {
      el.textContent = BRANDING.legalName;
    });

    document.querySelectorAll('[data-brand-city]').forEach(el => {
      el.textContent = BRANDING.city;
    });

    document.title = `${BRANDING.shortName} · Admin`;
  } catch (err) {
    console.warn('Branding konnte nicht angewendet werden', err);
  }
}
