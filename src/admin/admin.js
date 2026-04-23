import { supabase } from '../lib/supabase.js';
import { applyBranding } from './modules/apply-branding.js';

import { MembersUI } from '../features/members/members.ui.js';
import { EventsUI } from '../features/events/events.ui.js';
import { renderFinanceChart } from '../features/finances/finances.ui.js';
import { renderBoardDashboard } from '../features/board/board.ui.js';

class AdminApp {
  constructor() {
    this.user = null;
    this.role = null;

    this.members = new MembersUI();
    this.events = new EventsUI();

    this.channels = [];
  }

  async init() {
    applyBranding();

    await this.checkAuth();

    this.bindUI();
    this.applyRoleUI();

    await this.initialLoad();
    this.initRealtime();
  }

  async initialLoad() {
    await Promise.all([
      this.members.load(),
      this.events.load()
    ]);
  }

  async checkAuth() {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        window.location.href = '/';
        return;
      }

      this.user = data.user;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', this.user.id)
        .single();

      if (profileError || !profile) throw new Error('Profile missing');

      if (!['admin', 'board'].includes(profile.role)) {
        alert('Keine Berechtigung');
        window.location.href = '/';
        return;
      }

      this.role = profile.role;

    } catch (err) {
      console.error('[Auth]', err);
      window.location.href = '/';
    }
  }

  applyRoleUI() {
    if (this.role === 'board') {
      document.querySelectorAll('[data-admin-only]')
        .forEach(el => el.remove());
    }
  }

  bindUI() {
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = '/';
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn));
    });

    const active = document.querySelector('.tab-btn.active');
    if (active) this.switchTab(active);
  }

  switchTab(btn) {
    const tab = btn.dataset.tab;

    document.querySelectorAll('.tab-btn, .panel')
      .forEach(el => el.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(`${tab}Panel`)?.classList.add('active');

    switch (tab) {
      case 'members': this.members.load(); break;
      case 'events': this.events.load(); break;
      case 'finances': renderFinanceChart(); break;
      case 'board': renderBoardDashboard(); break;
    }
  }

  initRealtime() {
    const profiles = supabase.channel('profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' },
        () => this.members.load()
      ).subscribe();

    const events = supabase.channel('events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' },
        () => this.events.load()
      ).subscribe();

    this.channels.push(profiles, events);
  }
}

const app = new AdminApp();
document.addEventListener('DOMContentLoaded', () => app.init());
