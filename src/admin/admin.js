import { supabase } from '../lib/supabase.js';
import { applyBranding } from './modules/apply-branding.js';

import { MembersUI } from '../features/members/members.ui.js';
import { EventsUI } from '../features/events/events.ui.js';
import { renderFinanceChart } from '../features/finances/finances.ui.js';
import { renderBoardDashboard } from '../features/board/board.ui.js';

class AdminApp {
  constructor() {
    this.members = new MembersUI();
    this.events = new EventsUI();
  }

  async init() {
    applyBranding();
    await this.checkAuth();

    this.bindUI();

    await this.members.load();
    await this.events.load();
  }

  async checkAuth() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return (window.location.href = '/');
  }

  bindUI() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn));
    });

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = '/';
    });
  }

  switchTab(btn) {
    document.querySelectorAll('.tab-btn, .panel').forEach(el => el.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(`${btn.dataset.tab}Panel`)?.classList.add('active');

    if (btn.dataset.tab === 'finances') renderFinanceChart();
    if (btn.dataset.tab === 'board') renderBoardDashboard();
  }
}

const app = new AdminApp();
document.addEventListener('DOMContentLoaded', () => app.init());

import { renderBoardDashboard } from '../features/board/board.ui.js';
import { supabase } from '../lib/supabase.js';
import { applyBranding } from './modules/apply-branding.js';
import Chart from 'chart.js/auto';

class AdminApp {
  constructor() {
    this.user = null;
    this.financeChart = null;

    this.editMemberId = null;
    this.editEventId = null;
  }

  // ================= INIT =================
  async init() {
    applyBranding();

    await this.checkAuth();

    this.bindUI();
    await this.loadMembers();
    await this.loadEvents();
  }

  // ================= AUTH =================
  async checkAuth() {
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

    if (profileError || !['admin', 'board'].includes(profile?.role)) {
      alert('Keine Berechtigung');
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

    // Modals
    document.getElementById('openMemberModalBtn')?.addEventListener('click', () => this.openMemberModal());
    document.getElementById('openEventModalBtn')?.addEventListener('click', () => this.openEventModal());

    document.getElementById('saveMemberBtn')?.addEventListener('click', () => this.saveMember());
    document.getElementById('saveEventBtn')?.addEventListener('click', () => this.saveEvent());

    document.getElementById('exportCsvBtn')?.addEventListener('click', () => this.exportCSV());

    // Modal close
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal(btn.dataset.close));
    });
  }

  switchTab(btn) {
    document.querySelectorAll('.tab-btn, .panel').forEach(el => el.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(`${btn.dataset.tab}Panel`)?.classList.add('active');

    if (btn.dataset.tab === 'finances') this.loadFinances();
    if (btn.dataset.tab === 'board') renderBoardDashboard(); // ✅ FIX
  }

  // ================= MEMBERS =================
  async loadMembers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, voice, role, status')
      .order('name');

    if (error) return this.handleError(error);

    const members = data || [];
    const tbody = document.getElementById('membersTableBody');
    if (!tbody) return;

    if (!members.length) {
      tbody.innerHTML = `<tr><td colspan="6">Keine Mitglieder</td></tr>`;
      return;
    }

    tbody.innerHTML = members.map(m => `
      <tr>
        <td>${this.escape(m.name)}</td>
        <td>${this.escape(m.email)}</td>
        <td>${this.escape(m.voice || '—')}</td>
        <td><span class="badge badge-${this.escape(m.role)}">${this.escape(m.role)}</span></td>
        <td><span class="badge badge-${this.escape(m.status)}">${this.escape(m.status)}</span></td>
        <td>
          <button class="btn-icon" data-edit="${m.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" data-delete="${m.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => this.editMember(btn.dataset.edit));
    });

    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteMember(btn.dataset.delete));
    });
  }

  openMemberModal() {
    this.editMemberId = null;
    this.resetMemberForm();
    this.showModal('memberModal');
  }

  async saveMember() {
    const payload = {
      name: this.val('memberName'),
      email: this.val('memberEmail'),
      voice: this.val('memberVoice'),
      role: this.val('memberRole'),
      status: this.val('memberStatus')
    };

    const query = this.editMemberId
      ? supabase.from('profiles').update(payload).eq('id', this.editMemberId)
      : supabase.from('profiles').insert([{ id: crypto.randomUUID(), ...payload }]);

    const { error } = await query;
    if (error) return this.handleError(error);

    this.closeModal('memberModal');
    await this.loadMembers();
  }

  async editMember(id) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) return this.handleError(error);

    this.editMemberId = id;

    this.setVal('memberName', data.name);
    this.setVal('memberEmail', data.email);
    this.setVal('memberVoice', data.voice || 'soprano');
    this.setVal('memberRole', data.role);
    this.setVal('memberStatus', data.status);

    this.showModal('memberModal');
  }

  async deleteMember(id) {
    if (!confirm('Mitglied löschen?')) return;

    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) return this.handleError(error);

    await this.loadMembers();
  }

  resetMemberForm() {
    ['memberName', 'memberEmail'].forEach(id => this.setVal(id, ''));
  }

  // ================= EVENTS =================
  async loadEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('starttime', { ascending: false });

    if (error) return this.handleError(error);

    const events = data || [];
    const tbody = document.getElementById('eventsTableBody');
    if (!tbody) return;

    if (!events.length) {
      tbody.innerHTML = `<tr><td colspan="6">Keine Events</td></tr>`;
      return;
    }

    tbody.innerHTML = events.map(e => `
      <tr>
        <td>${this.escape(e.title)}</td>
        <td><span class="badge badge-${this.escape(e.type)}">${this.escape(e.type)}</span></td>
        <td>${new Date(e.starttime).toLocaleString()}</td>
        <td>${new Date(e.endtime).toLocaleString()}</td>
        <td>${this.escape(e.location || '—')}</td>
        <td>
          <button class="btn-icon" data-edit="${e.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" data-delete="${e.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => this.editEvent(btn.dataset.edit));
    });

    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteEvent(btn.dataset.delete));
    });
  }

  openEventModal() {
    this.editEventId = null;
    this.resetEventForm();
    this.showModal('eventModal');
  }

  async saveEvent() {
    const payload = {
      title: this.val('eventTitle'),
      type: this.val('eventType'),
      starttime: this.val('eventStart'),
      endtime: this.val('eventEnd'),
      location: this.val('eventLocation'),
      description: this.val('eventDescription'),
      createdby: this.user.id
    };

    const query = this.editEventId
      ? supabase.from('events').update(payload).eq('id', this.editEventId)
      : supabase.from('events').insert([payload]);

    const { error } = await query;
    if (error) return this.handleError(error);

    this.closeModal('eventModal');
    await this.loadEvents();
  }

  async editEvent(id) {
    const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
    if (error) return this.handleError(error);

    this.editEventId = id;

    this.setVal('eventTitle', data.title);
    this.setVal('eventType', data.type);
    this.setVal('eventStart', data.starttime.slice(0, 16));
    this.setVal('eventEnd', data.endtime.slice(0, 16));
    this.setVal('eventLocation', data.location || '');
    this.setVal('eventDescription', data.description || '');

    this.showModal('eventModal');
  }

  async deleteEvent(id) {
    if (!confirm('Event löschen?')) return;

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) return this.handleError(error);

    await this.loadEvents();
  }

  resetEventForm() {
    ['eventTitle', 'eventStart', 'eventEnd'].forEach(id => this.setVal(id, ''));
  }

  // ================= FINANCES =================
  async loadFinances() {
    const { data, error } = await supabase.from('feepayments').select('amount, status');
    if (error) return this.handleError(error);

    const list = data || [];

    const paid = list.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
    const pending = list.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);

    if (this.financeChart) this.financeChart.destroy();

    const canvas = document.getElementById('financeChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    this.financeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Bezahlt', 'Offen'],
        datasets: [{
          data: [paid, pending],
          backgroundColor: ['#0a6f39', '#eab308']
        }]
      }
    });
  }

  async exportCSV() {
    const { data, error } = await supabase.from('profiles').select('name, email, voice, status');
    if (error) return this.handleError(error);

    const list = data || [];

    const csv = [
      'Name,Email,Stimme,Status',
      ...list.map(p => `${p.name},${p.email},${p.voice},${p.status}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'mitglieder.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  // ================= HELPERS =================
  val(id) {
    return document.getElementById(id)?.value || '';
  }

  setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  showModal(id) {
    document.getElementById(id)?.style.display = 'flex';
  }

  closeModal(id) {
    document.getElementById(id)?.style.display = 'none';
  }

  escape(str) {
    return str?.replace(/[&<>]/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }[m])) || '';
  }

  handleError(error) {
    console.error(error);
    alert('Fehler: ' + error.message);
  }
}

// ================= START =================
const app = new AdminApp();
document.addEventListener('DOMContentLoaded', () => app.init());
