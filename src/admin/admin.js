// ========== ADMIN APP ==========
import { supabase } from '../lib/supabase.js';
import { applyBranding } from './modules/apply-branding.js';

import { MembersUI } from '../features/members/members.ui.js';
import { EventsUI } from '../features/events/events.ui.js';
import { renderFinanceChart } from '../features/finances/finances.ui.js';
import { renderBoardDashboard } from '../features/board/board.ui.js';

class AdminApp {
  constructor() {
    this.user = null;

    // Feature Modules
    this.members = new MembersUI();
    this.events = new EventsUI();
  }

  // ================= INIT =================
  async init() {
    applyBranding();

    await this.checkAuth();

    this.bindUI();

    // Initial Load
    await this.members.load();
    await this.events.load();
  }

  // ================= AUTH =================
  async checkAuth() {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        window.location.href = '/';
        return;
      }

      this.user = data.user;

      // Role Check (WICHTIG!)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', this.user.id)
        .single();

      if (profileError || !['admin', 'board'].includes(profile?.role)) {
        alert('Keine Berechtigung für Adminbereich');
        window.location.href = '/';
      }

    } catch (err) {
      console.error('[Auth]', err);
      window.location.href = '/';
    }
  }

  // ================= UI =================
  bindUI() {
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = '/';
    });

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn));
    });

    // Optional: Default Tab sichern
    const activeBtn = document.querySelector('.tab-btn.active');
    if (activeBtn) this.switchTab(activeBtn);
  }

  switchTab(btn) {
    const tab = btn.dataset.tab;

    // Reset UI
    document.querySelectorAll('.tab-btn, .panel')
      .forEach(el => el.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(`${tab}Panel`)?.classList.add('active');

    // Lazy Loading je Tab
    switch (tab) {
      case 'members':
        this.members.load();
        break;

      case 'events':
        this.events.load();
        break;

      case 'finances':
        renderFinanceChart();
        break;

      case 'board':
        renderBoardDashboard();
        break;
    }
  }
}

// ================= START =================
const app = new AdminApp();

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
