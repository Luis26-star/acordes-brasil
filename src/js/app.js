/* =========================================================
   APP.JS – CLEAN SENIOR VERSION
========================================================= */

import { sendOrQueue } from './modules/offline.js';


/* =========================================================
   CONFIG
========================================================= */
const CONFIG = {
  DEFAULT_LANGUAGE: 'de',
  STORAGE_KEY: 'choir-app',
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: ''
};


/* =========================================================
   UTILS
========================================================= */
const qs = (s) => document.querySelector(s);


/* =========================================================
   APP CLASS (AUSZUG – DEIN BESTEHENDER CODE BLEIBT)
========================================================= */
class App {
  constructor() {
    this.state = {};
  }

  async createEvent(data) {
    // 👉 HIER wird Offline genutzt
    await sendOrQueue('/api/events', data);
  }
}
