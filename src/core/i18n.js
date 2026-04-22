// ========== I18N MODUL ==========
export class I18nModule {
  constructor(app) {
    this.app = app;
    this.currentLang = localStorage.getItem('preferredLanguage') || 'de';
    this.translations = {
      de: {
        'nav.home': 'Start',
        'nav.choir': 'Der Chor',
        'nav.concerts': 'Konzerte',
        'nav.repertoire': 'Repertoire',
        'nav.gallery': 'Galerie',
        'nav.join': 'Mitmachen',
        'nav.member': 'Mitgliederbereich',
        'hero.subtitle': 'Brasilianischer Chor in Frankfurt a.M.',
        'hero.discover': 'Nächstes Konzert entdecken',
        'concerts.title': 'Nächste Konzerte'
      },
      en: {
        'nav.home': 'Home',
        'nav.choir': 'The Choir',
        'nav.concerts': 'Concerts',
        'nav.repertoire': 'Repertoire',
        'nav.gallery': 'Gallery',
        'nav.join': 'Join',
        'nav.member': 'Member Area',
        'hero.subtitle': 'Brazilian Choir in Frankfurt a.M.',
        'hero.discover': 'Discover next concert',
        'concerts.title': 'Upcoming Concerts'
      },
      pt: {
        'nav.home': 'Início',
        'nav.choir': 'O Coro',
        'nav.concerts': 'Concertos',
        'nav.repertoire': 'Repertório',
        'nav.gallery': 'Galeria',
        'nav.join': 'Participe',
        'nav.member': 'Área de Membros',
        'hero.subtitle': 'Coro Brasileiro em Frankfurt',
        'hero.discover': 'Descubra o próximo concerto',
        'concerts.title': 'Próximos Concertos'
      }
    };
  }
  
  init() {
    this.renderLanguageSwitcher();
    this.applyTranslations();
  }
  
  t(key) {
    return this.translations[this.currentLang]?.[key] || key;
  }
  
  switchLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);
    this.renderLanguageSwitcher();
    this.applyTranslations();
    this.app.renderNavigation();
  }
  
  renderLanguageSwitcher() {
    const switcher = document.getElementById('langSwitcher');
    if (!switcher) return;
    
    switcher.innerHTML = ['de', 'en', 'pt'].map(lang => `
      <button class="lang-btn ${lang === this.currentLang ? 'active' : ''}" data-lang="${lang}">
        ${lang.toUpperCase()}
      </button>
    `).join('');
    
    switcher.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchLanguage(btn.dataset.lang));
    });
  }
  
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = this.t(key);
    });
  }
}
