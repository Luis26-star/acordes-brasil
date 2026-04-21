/* =========================================================
   APP.JS – FINAL SENIOR VERSION (SUPABASE + OFFLINE)
========================================================= */

import { supabaseInsertOrQueue } from './modules/offline.js';

/* =========================================================
   CONFIG
========================================================= */
const CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: ''
};

/* =========================================================
   APP CLASS
========================================================= */
class App {
  constructor() {
    this.state = {
      user: null
    };

    this.supabase = null;
  }

  /* =========================================================
     INIT
  ========================================================= */
  async init() {
    this.initSupabase();
    this.registerServiceWorker();
  }

  initSupabase() {
    if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
      this.supabase = supabase.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_ANON_KEY
      );
    } else {
      console.warn('⚠️ Demo-Modus aktiv');
    }
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/service-worker.js');
    }
  }

  /* =========================================================
     EVENTS (OFFLINE READY)
  ========================================================= */
  async createEvent(data) {
    try {
      await supabaseInsertOrQueue(this, 'events', data);
      console.log('✅ Event gespeichert (online oder offline)');
    } catch (err) {
      console.error('❌ Fehler beim Speichern', err);
    }
  }
}

/* =========================================================
   START
========================================================= */
const app = new App();
window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());
