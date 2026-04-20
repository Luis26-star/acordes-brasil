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
  
  async init() {
    if (isSupabaseConfigured()) {
      this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    } else {
      console.warn('Demo-Modus aktiv');
      this.supabase = this.createMockSupabase();
    }
    
    this.i18n.init();
    this.setupEventListeners();
    this.checkCookies();
    this.renderNavigation();
    await this.auth.checkSession();
    this.loadPublicConcerts();
    this.calendar.init();
    this.push.init();
  }
  
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
  
  setupEventListeners() {
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        navMenu?.classList.toggle('active');
        menuToggle.classList.toggle('active');
      });
    }
    
    document.getElementById('acceptCookiesBtn')?.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'all');
      document.getElementById('cookieBanner')?.classList.remove('show');
    });
    
    document.getElementById('declineCookiesBtn')?.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'necessary');
      document.getElementById('cookieBanner')?.classList.remove('show');
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('loginOverlay')?.classList.remove('active');
      }
    });
    
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
  
  checkCookies() {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      document.getElementById('cookieBanner')?.classList.add('show');
    }
  }
  
  renderNavigation() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;
    const items = ['Start', 'Der Chor', 'Konzerte', 'Repertoire', 'Galerie', 'Mitmachen'];
    navMenu.innerHTML = items.map(item => `<li><a href="#">${item}</a></li>`).join('') +
      `<li><a href="#" id="memberLoginBtn"><i class="fas fa-lock"></i> Mitgliederbereich</a></li>`;
    document.getElementById('memberLoginBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.auth.showLogin();
    });
  }
  
  async loadPublicConcerts() {
    const events = await this.storage.getPublicConcerts();
    const container = document.getElementById('publicConcerts');
    if (!container) return;
    if (events.length === 0) {
      container.innerHTML = '<p style="text-align:center;">Keine anstehenden Konzerte.</p>';
      return;
    }
    container.innerHTML = events.map(e => `
      <div class="concert-card-public">
        <h3>${e.title}</h3>
        <p><i class="far fa-calendar"></i> ${new Date(e.start_time).toLocaleDateString('de-DE')}</p>
        <p><i class="far fa-clock"></i> ${new Date(e.start_time).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})} Uhr</p>
        <p><i class="fas fa-map-pin"></i> ${e.location || 'Frankfurt'}</p>
      </div>
    `).join('');
  }
  
  showMemberDashboard() {
    document.getElementById('publicContent').style.display = 'none';
    this.calendar.loadMemberCalendar();
    this.push.checkSupport();
  }
  
  showBoardDashboard() {
    document.getElementById('publicContent').style.display = 'none';
    this.board.loadOverview();
  }
  
  showPublicContent() {
    document.getElementById('publicContent').style.display = 'block';
    this.loadPublicConcerts();
  }
  
  showImpressum() {
    alert('Impressum\n\nAcordes Brasil e.V.\nMusterstraße 1\n60311 Frankfurt am Main\nkontakt@acordesbrasil.de');
  }
  
  showDatenschutz() {
    alert('Datenschutzerklärung (DSGVO)\n\nVerantwortlicher: Acordes Brasil e.V.\nIhre Daten werden DSGVO-konform verarbeitet.');
  }
}

const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
window.app = app;
