/* =========================================================
   APP.JS – FINAL SENIOR VERSION (SUPABASE + OFFLINE + SYNC UI)
========================================================= */

import { supabaseInsertOrQueue } from './modules/offline.js';
import { SyncUI } from './modules/sync-ui.js';

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
    this.syncUI = null;
  }

  /* =========================================================
     INIT
  ========================================================= */
  async init() {
    this.initSupabase();
    await this.registerServiceWorker();
    this.initSyncUI();
  }

  /* =========================================================
     SUPABASE
  ========================================================= */
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

  /* =========================================================
     SERVICE WORKER
  ========================================================= */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
      await navigator.serviceWorker.register('/service-worker.js');
    } catch (err) {
      console.error('SW Registrierung fehlgeschlagen:', err);
    }
  }

  /* =========================================================
     SYNC UI
  ========================================================= */
  initSyncUI() {
    this.syncUI = new SyncUI();

    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SYNC_STATUS') {
        this.syncUI.setState(event.data.status);
      }
    });
  }

  /* =========================================================
     EVENTS (OFFLINE READY)
  ========================================================= */
  async createEvent(data) {
    try {
      await supabaseInsertOrQueue(this, 'events', data);

      console.log('✅ Event gespeichert (online oder offline)');
      this.syncUI?.setState('pending');

    } catch (err) {
      console.error('❌ Fehler beim Speichern', err);
      this.syncUI?.setState('error');
    }
  }
}

/* =========================================================
   START
========================================================= */
const app = new App();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
