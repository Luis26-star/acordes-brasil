/* =========================================================
   AUTH MODULE – SENIOR / PRODUCTION LEVEL
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

    this.isLoading = false;
  }


  /* =========================================================
     INIT
  ========================================================= */
  init() {
    this.bindEvents();
    this.listenToAuthChanges();
  }


  /* =========================================================
     SESSION CHECK (Initial Load)
  ========================================================= */
  async checkSession() {
    try {
      const { data, error } = await this.app.supabase.auth.getSession();

      if (error) throw error;

      if (data?.session?.user) {
        this.onLoginSuccess(data.session.user, { silent: true });
      } else {
        this.app.showPublicContent();
      }
    } catch (err) {
      console.warn('Session check failed:', err);
      this.app.showPublicContent();
    }
  }


  /* =========================================================
     AUTH LISTENER (Realtime)
  ========================================================= */
  listenToAuthChanges() {
    this.app.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.onLoginSuccess(session.user, { silent: true });
      }

      if (event === 'SIGNED_OUT') {
        this.app.state.user = null;
        this.app.showPublicContent();
      }
    });
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideLogin();
    });

    this.ui.overlay?.addEventListener('click', (e) => {
      if (e.target === this.ui.overlay) this.hideLogin();
    });
  }


  /* =========================================================
     LOGIN
  ========================================================= */
  async login() {
    if (this.isLoading) return;

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
      this.handleAuthError(err);
    } finally {
      this.setLoading(false);
    }
  }


  /* =========================================================
     SUCCESS
  ========================================================= */
  async onLoginSuccess(user, options = {}) {
    this.app.state.user = user;

    if (!options.silent) {
      this.hideLogin();
      this.clearForm();
    }

    // Push Subscription (non-blocking)
    try {
      this.app.modules?.push?.subscribe(user);
    } catch (err) {
      console.warn('Push failed:', err);
    }

    this.app.showMemberDashboard();
  }


  /* =========================================================
     LOGOUT
  ========================================================= */
  async logout() {
    try {
      await this.app.supabase.auth.signOut();
      this.app.state.user = null;
      this.app.showPublicContent();
    } catch (err) {
      console.error('Logout error:', err);
    }
  }


  /* =========================================================
     ERROR HANDLING (Supabase aware)
  ========================================================= */
  handleAuthError(err) {
    console.error(err);

    const msgMap = {
      'Invalid login credentials': 'Falsche E-Mail oder Passwort.',
      'Email not confirmed': 'Bitte bestätige deine E-Mail.',
      'Too many requests': 'Zu viele Versuche. Bitte später erneut.'
    };

    const message = msgMap[err.message] || 'Login fehlgeschlagen.';
    this.showError(message);
  }


  /* =========================================================
     UI
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
    this.isLoading = state;

    if (!this.ui.form) return;

    this.ui.form.classList.toggle('is-loading', state);

    const btn = this.ui.form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = state;
      btn.textContent = state ? 'Anmelden…' : 'Anmelden';
    }
  }


  /* =========================================================
     OPTIONAL (Future ready)
========================================================= */

  async register(email, password) {
    return this.app.supabase.auth.signUp({ email, password });
  }

  async resetPassword(email) {
    return this.app.supabase.auth.resetPasswordForEmail(email);
  }
}
