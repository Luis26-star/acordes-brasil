/* =========================================================
   CONFIG.JS – ULTIMATE SENIOR VERSION
   - Immutable
   - Validated
   - Env-safe (Vite + Node + Browser)
   - Feature Flags
   - Safe access helpers
========================================================= */

/* =========================================================
   ENV (robust)
========================================================= */
const ENV = (() => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env;
    }
  } catch {}

  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }

  return {};
})();


/* =========================================================
   INTERNAL HELPERS
========================================================= */
const freezeDeep = (obj) => {
  Object.freeze(obj);
  Object.values(obj).forEach(val => {
    if (val && typeof val === 'object' && !Object.isFrozen(val)) {
      freezeDeep(val);
    }
  });
  return obj;
};

const warn = (msg) => console.warn(`⚠️ CONFIG: ${msg}`);

const isEmpty = (v) => v === undefined || v === null || v === '';

const getEnv = (key, fallback = '') => ENV[key] ?? fallback;


/* =========================================================
   BASE CONFIG
========================================================= */
const _CONFIG = {
  APP: {
    NAME: 'Acordes Brasil',
    VERSION: '2.1.0'
  },

  SUPABASE: {
    URL: getEnv('VITE_SUPABASE_URL'),
    ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY')
  },

  PUSH: {
    VAPID_PUBLIC_KEY: getEnv('VITE_VAPID_PUBLIC_KEY')
  },

  I18N: {
    DEFAULT_LANGUAGE: 'de',
    SUPPORTED_LANGUAGES: ['de', 'en', 'pt']
  },

  FEATURES: {
    PUSH_NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    DARK_MODE: true,
    DEMO_MODE: false,
    DEVTOOLS: getEnv('DEV') === 'true'
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
   VALIDATION (early warnings)
========================================================= */
(function validate(cfg) {

  if (!cfg.I18N.SUPPORTED_LANGUAGES.includes(cfg.I18N.DEFAULT_LANGUAGE)) {
    warn('DEFAULT_LANGUAGE not in SUPPORTED_LANGUAGES');
  }

  if (cfg.FEATURES.PUSH_NOTIFICATIONS && isEmpty(cfg.PUSH.VAPID_PUBLIC_KEY)) {
    warn('Push enabled but no VAPID key configured');
  }

  if (!isEmpty(cfg.SUPABASE.URL) && cfg.SUPABASE.URL.includes('YOUR_PROJECT')) {
    warn('Supabase URL still contains placeholder');
  }

})(_CONFIG);


/* =========================================================
   IMMUTABLE EXPORT
========================================================= */
export const CONFIG = freezeDeep(_CONFIG);


/* =========================================================
   SHORTCUT EXPORTS
========================================================= */
export const {
  SUPABASE,
  APP,
  I18N,
  FEATURES,
  DEFAULTS,
  PUSH
} = CONFIG;


/* =========================================================
   SAFE ACCESS (Senior pattern)
========================================================= */
export const getConfig = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], CONFIG);
};

export const isFeatureEnabled = (feature) => {
  return Boolean(CONFIG.FEATURES[feature]);
};


/* =========================================================
   SYSTEM HELPERS
========================================================= */
export const isSupabaseConfigured = () => {
  return Boolean(
    CONFIG.SUPABASE.URL &&
    CONFIG.SUPABASE.ANON_KEY &&
    !CONFIG.SUPABASE.URL.includes('YOUR_PROJECT')
  );
};

export const isDemoMode = () => {
  return CONFIG.FEATURES.DEMO_MODE || !isSupabaseConfigured();
};


/* =========================================================
   DEV LOGGING
========================================================= */
if (CONFIG.FEATURES.DEVTOOLS) {
  console.info('⚙️ CONFIG LOADED:', CONFIG);
}
