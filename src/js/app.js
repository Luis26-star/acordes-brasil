// ========== HAUPT-APP ==========
import { AuthModule } from './modules/auth.js';
import { CalendarModule } from './modules/calendar.js';
import { MembersModule } from './modules/members.js';
import { StorageModule } from './modules/storage.js';
import { I18nModule } from './modules/i18n.js';
import { PushModule } from './modules/push.js';
import { FinanceModule } from './modules/finance.js';
import { ProjectsModule } from './modules/projects.js';
import { PartnershipsModule } from './modules/partnerships.js';
import { BoardModule } from './modules/board.js';
import { CONFIG, isSupabaseConfigured } from './config.js';

class App {
  constructor() {
    this.auth = new AuthModule(this);
    this.calendar = new CalendarModule(this);
    this.members = new MembersModule(this);
    this.storage = new StorageModule(this);
    this.i18n = new I18nModule(this);
    this.push = new PushModule(this);
    this.finance = new FinanceModule(this);
    this.projects = new ProjectsModule(this);
    this.partnerships = new PartnershipsModule(this);
    this.board = new BoardModule(this);

    this.currentUser = null;
    this.supabase = null;
    this.currentLang = CONFIG.DEFAULT_LANGUAGE;
  }

  /* =========================================================
     INIT
  ========================================================= */
  async init() {
    this.initSupabase();
    this.i18n.init();

    this.setupEventListeners();
    this.handleCookies();

    this.renderNavigation();

    await this.auth.checkSession();

    this.loadPublicConcerts();

    this.calendar.init();
    this.push.init();
  }

  initSupabase() {
    if (isSupabaseConfigured()) {
      this.supabase = supabase.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_ANON_KEY
      );
    } else {
      console.warn('⚠️ Demo-Modus aktiv');
      this.supabase = this.createMockSupabase();
    }
  }

  /* =========================================================
     MOCK (DEMO)
  ========================================================= */
  createMockSupabase() {
    return {
      auth: {
        getSession: () => ({ data: { session: null } }),
        signInWithPassword: () => ({ error: new Error('Demo-Modus') }),
        signUp: () => ({ error: new Error('Demo-Modus') }),
        signOut: () => ({ error: null })
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ error: null }),
        update: () => ({ error: null }),
        delete: () => ({ error: null }),
        eq: () => ({ data: [], error: null }),
        order: () => ({ data: [], error: null }),
        single: () => ({ data: null, error: null })
      })
    };
  }

  /* =========================================================
     EVENTS
  ========================================================= */
  setupEventListeners() {
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('is-active');
        menuToggle.classList.toggle('is-active');
      });

      // Klick außerhalb schließt Menü
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
          navMenu.classList.remove('is-active');
          menuToggle.classList.remove('is-active');
        }
      });
    }

    /* ===== COOKIE ===== */
    document.getElementById('acceptCookiesBtn')?.addEventListener('click', () => {
      this.setCookieConsent('all');
    });

    document.getElementById('declineCookiesBtn')?.addEventListener('click', () => {
      this.setCookieConsent('necessary');
    });

    /* ===== ESC ===== */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('loginOverlay')?.classList.remove('is-active');
        navMenu?.classList.remove('is-active');
      }
    });

    /* ===== LINKS ===== */
    document.getElementById('impressumLink')?.addEventListener('click', () => this.showImpressum());
    document.getElementById('datenschutzLink')?.addEventListener('click', () => this.showDatenschutz());

    document.getElementById('discoverConcertsBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('concertsSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Registrierung in Kürze verfügbar!');
    });
  }

  /* =========================================================
     COOKIE
  ========================================================= */
  handleCookies() {
    const consent = localStorage.getItem('cookieConsent');

    if (!consent) {
      setTimeout(() => {
        document.getElementById('cookieBanner')?.classList.add('is-active');
      }, 400);
    }
  }

  setCookieConsent(value) {
    localStorage.setItem('cookieConsent', value);
    document.getElementById('cookieBanner')?.classList.remove('is-active');
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */
  renderNavigation() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;

    const items = [
      'Start',
      'Der Chor',
      'Konzerte',
      'Repertoire',
      'Galerie',
      'Mitmachen'
    ];

    navMenu.innerHTML = `
      ${items.map(item => `
        <li>
          <a href="#" class="c-nav__link">${item}</a>
        </li>
      `).join('')}
      <li>
        <a href="#" id="memberLoginBtn" class="c-nav__link">
          <i class="fas fa-lock"></i> Mitgliederbereich
        </a>
      </li>
    `;

    document.getElementById('memberLoginBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.auth.showLogin();
    });
  }

  /* =========================================================
     KONZERTE
  ========================================================= */
  async loadPublicConcerts() {
    const container = document.getElementById('publicConcerts');
    if (!container) return;

    const events = await this.storage.getPublicConcerts();

    if (!events.length) {
      container.innerHTML = `<p class="u-text-center">Keine anstehenden Konzerte.</p>`;
      return;
    }

    container.innerHTML = events.map(e => `
      <div class="c-card">
        <h3 class="c-card__title">${e.title}</h3>

        <p class="c-card__meta">
          <i class="far fa-calendar"></i>
          ${new Date(e.start_time).toLocaleDateString('de-DE')}
        </p>

        <p class="c-card__meta">
          <i class="far fa-clock"></i>
          ${new Date(e.start_time).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
          })} Uhr
        </p>

        <p class="c-card__meta">
          <i class="fas fa-map-pin"></i>
          ${e.location || 'Frankfurt'}
        </p>
      </div>
    `).join('');
  }

  /* =========================================================
     DASHBOARDS
  ========================================================= */
  showMemberDashboard() {
    document.getElementById('publicContent')?.classList.add('is-hidden');
    this.calendar.loadMemberCalendar();
    this.push.checkSupport();
  }

  showBoardDashboard() {
    document.getElementById('publicContent')?.classList.add('is-hidden');
    this.board.loadOverview();
  }

  showPublicContent() {
    document.getElementById('publicContent')?.classList.remove('is-hidden');
    this.loadPublicConcerts();
  }

  /* =========================================================
     INFO
  ========================================================= */
  showImpressum() {
    alert(`Impressum

Acordes Brasil e.V.
Musterstraße 1
60311 Frankfurt am Main
kontakt@acordesbrasil.de`);
  }

  showDatenschutz() {
    alert(`Datenschutzerklärung (DSGVO)

Verantwortlicher: Acordes Brasil e.V.
Ihre Daten werden DSGVO-konform verarbeitet.`);
  }
}

/* =========================================================
   START
========================================================= */
const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
window.app = app;
