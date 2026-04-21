/* =========================================================
   OFFLINE REQUEST WRAPPER
========================================================= */

async function sendOrQueue(url, body) {
  if (navigator.onLine) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  const db = await openDB();

  const tx = db.transaction('queue', 'readwrite');
  const store = tx.objectStore('queue');

  await store.add({
    id: Date.now(),
    url,
    method: 'POST',
    body
  });

  const reg = await navigator.serviceWorker.ready;
  await reg.sync.register('sync-rehearsals');

  console.info('📡 Offline gespeichert → wird später gesendet');
}


/* reuse DB */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('choir-db', 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
/* =========================================================
   APP.JS – FINAL SENIOR VERSION (DROP-IN READY)
========================================================= */

/* =========================================================
   CONFIG
========================================================= */
const CONFIG = {
  DEFAULT_LANGUAGE: 'de',
  STORAGE_KEY: 'choir-app',
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: ''
};

const isSupabaseConfigured = () =>
  CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY;


/* =========================================================
   UTILS
========================================================= */
const qs = (s) => document.querySelector(s);

const safeHTML = (str) =>
  String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#039;"
  }[m]));


/* =========================================================
   EVENT BUS
========================================================= */
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, cb) {
    (this.events[event] ||= []).push(cb);
  }

  emit(event, data) {
    (this.events[event] || []).forEach(cb => cb(data));
  }
}


/* =========================================================
   STORE
========================================================= */
class Store {
  constructor(initial) {
    this.state = initial;
    this.listeners = [];
  }

  get() {
    return this.state;
  }

  set(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(l => l(this.state));
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }
}


/* =========================================================
   STORAGE
========================================================= */
class Storage {
  load() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  save(data) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
  }
}


/* =========================================================
   ROUTER
========================================================= */
class Router {
  constructor(app) {
    this.app = app;
    this.routes = {};
  }

  register(route, handler) {
    this.routes[route] = handler;
  }

  go(route) {
    location.hash = route;
  }

  resolve() {
    const route = location.hash.replace('#', '') || 'home';
    this.routes[route]?.();
  }

  init() {
    window.addEventListener('hash
