// ========== KONFIGURATION ==========

/* =========================================================
   ENV (sicher auslesen)
========================================================= */
const ENV = typeof import.meta !== 'undefined' ? import.meta.env : {};

/* =========================================================
   BASIS CONFIG
========================================================= */
export const CONFIG = {
  APP: {
    NAME: 'Acordes Brasil',
    VERSION: '2.0.0'
  },

  SUPABASE: {
    URL: ENV.VITE_SUPABASE_URL || '',
    ANON_KEY: ENV.VITE_SUPABASE_ANON_KEY || ''
  },

  PUSH: {
    VAPID_PUBLIC_KEY: ENV.VITE_VAPID_PUBLIC_KEY || ''
  },

  I18N: {
    DEFAULT_LANGUAGE: 'de',
    SUPPORTED_LANGUAGES: ['de', 'en', 'pt']
  },

  FEATURES: {
    PUSH_NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    DARK_MODE: false,
    DEMO_MODE: false
  },

  DEFAULTS: {
    FEE_NORMAL: 120,
    FEE_REDUCED: 60,
    FEE_SPONSOR: 50,
    CURRENCY: 'EUR',
    DATE_FORMAT: 'DD.MM.YYYY',
    TIMEZONE: 'Europe/Berlin'
  }
};


/* =========================================================
   SHORTCUT EXPORTS
========================================================= */
export const {
  SUPABASE,
  APP,
  I18N,
  FEATURES,
  DEFAULTS
} = CONFIG;


/* =========================================================
   HELPERS
========================================================= */

/**
 * Prüft, ob Supabase korrekt konfiguriert ist
 */
export const isSupabaseConfigured = () => {
  return Boolean(
    SUPABASE.URL &&
    SUPABASE.ANON_KEY &&
    !SUPABASE.URL.includes('YOUR_PROJECT')
  );
};

/**
 * Demo-Modus (Fallback wenn Backend fehlt)
 */
export const isDemoMode = () => {
  return FEATURES.DEMO_MODE || !isSupabaseConfigured();
};
