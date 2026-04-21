/* =========================================================
   AUTH MODULE – PRODUCTION READY
   Acordes Brasil e.V.i.G.
========================================================= */

import { CONFIG } from '../config.js';

export class AuthModule {
  constructor({ app }) {
    this.app = app;

    this.ui = {
      overlay: document.getElementById('loginOverlay'),
      form: document.getElementById('loginForm'),
      email: document.getElementById('loginEmail'),
      password: document.getElementById('loginPassword'),
      error: document.getElementById('loginError')
    };
  }


  /* =========================================================
     INIT
  ========================================================= */
  init() {
    this.bindEvents();
  }


  /* =========================================================
     SESSION CHECK
  ========================================================= */
  async checkSession() {
    try {
      const { data } = await this.app.supabase.auth.getSession();

      if (data?.session?.user) {
        this.onLoginSuccess(data.session.user);
      } else {
        this.app.showPublicContent();
      }
    } catch (err) {
      console.warn('Session check failed:', err);
      this.app.showPublicContent();
    }
  }


  /* =========================================================
     EVENTS
  ========================================================= */
  bindEvents() {
    if (!this.ui.form) return;

    this.ui.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.login();
    });

    // ESC schließen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideLogin();
    });

    // Klick außerhalb schließt Modal
    this.ui.overlay?.addEventListener('click', (e) => {
      if (e.target === this.ui.overlay) this.hideLogin();
    });
  }


  /* =========================================================
     LOGIN FLOW
  ========================================================= */
  async login() {
    const email = this.ui.email.value.trim();
    const password = this.ui.password.value.trim();

    if (!email || !password) {
      this.showError('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    this.setLoading(true);

    try {
      const { data, error } = await this.app.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.onLoginSuccess(data.user);

    } catch (err) {
      this.showError('Login fehlgeschlagen. Bitte prüfen.');
      console.error(err);
    } finally {
      this.setLoading(false);
    }
  }


  /* =========================================================
     SUCCESS
  ========================================================= */
  async onLoginSuccess(user) {
    this.app.state.user = user;

    this.hideLogin();
    this.clearForm();

    // 👉 Push Subscription (optional)
    try {
      if (this.app.modules?.push) {
        this.app.modules.push.subscribe(user);
      }
    } catch (err) {
      console.warn('Push subscribe fehlgeschlagen:', err);
    }

    this.app.showMemberDashboard();
  }


  /* =========================================================
     LOGOUT
  ========================================================= */
  async logout() {
    await this.app.supabase.auth.signOut();
    this.app.state.user = null;
    this.app.showPublicContent();
  }


  /* =========================================================
     UI HELPERS
  ========================================================= */
  showLogin() {
    this.ui.overlay?.classList.add('is-active');
    this.ui.email?.focus();
  }

  hideLogin() {
    this.ui.overlay?.classList.remove('is-active');
  }

  showError(msg) {
    if (!this.ui.error) return;
    this.ui.error.textContent = msg;
  }

  clearForm() {
    this.ui.form?.reset();
    this.showError('');
  }

  setLoading(state) {
    if (!this.ui.form) return;

    this.ui.form.classList.toggle('is-loading', state);

    const btn = this.ui.form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = state;
      btn.textContent = state ? 'Anmelden…' : 'Anmelden';
    }
  }
}
