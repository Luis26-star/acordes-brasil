// ========== KONFIGURATION ==========
export const CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY',
  VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
  APP_NAME: 'Acordes Brasil',
  APP_VERSION: '2.0.0',
  DEFAULT_LANGUAGE: 'de',
  SUPPORTED_LANGUAGES: ['de', 'en', 'pt'],
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

export const { SUPABASE_URL, SUPABASE_ANON_KEY, APP_NAME, DEFAULT_LANGUAGE, FEATURES, DEFAULTS } = CONFIG;

export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== 'https://YOUR_PROJECT.supabase.co' && 
         SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY';
};

export const isDemoMode = () => {
  return FEATURES.DEMO_MODE || !isSupabaseConfigured();
};
