import { fetchEvents, deleteEvent } from './events.api.js';

export class EventsUI {
  constructor() {
    this.editId = null;
    this.tbody = document.getElementById('eventsTableBody');
  }

  // ================= LOAD =================
  async load() {
    if (!this.tbody) return;

    this.setLoading();

    try {
      const events = await fetchEvents();

      if (!events.length) {
        this.tbody.innerHTML = `<tr><td colspan="6">Keine Events</td></tr>`;
        return;
      }

      this.tbody.innerHTML = events.map(e => this.rowTemplate(e)).join('');

      this.bindEvents();

    } catch (err) {
      console.error(err);
      this.tbody.innerHTML = `<tr><td colspan="6">Fehler beim Laden</td></tr>`;
    }
  }

  // ================= DELETE =================
  async remove(id) {
    if (!confirm('Event wirklich löschen?')) return;

    try {
      await deleteEvent(id);
      await this.load();
    } catch (err) {
      console.error(err);
      alert('Löschen fehlgeschlagen');
    }
  }

  // ================= TEMPLATE =================
  rowTemplate(e) {
    return `
      <tr>
        <td>${this.escape(e.title)}</td>
        <td><span class="badge badge-${e.type}">${this.escape(e.type)}</span></td>
        <td>${this.formatDate(e.starttime)}</td>
        <td>${this.formatDate(e.endtime)}</td>
        <td>${this.escape(e.location || '—')}</td>
        <td>
          <button class="btn-icon danger" data-delete="${e.id}">🗑</button>
        </td>
      </tr>
    `;
  }

  // ================= EVENTS =================
  bindEvents() {
    this.tbody.querySelectorAll('[data-delete]').forEach(btn =>
      btn.addEventListener('click', () => this.remove(btn.dataset.delete))
    );
  }

  // ================= HELPERS =================
  setLoading() {
    this.tbody.innerHTML = `<tr><td colspan="6">Laden...</td></tr>`;
  }

  formatDate(date) {
    if (!date) return '—';

    try {
      return new Date(date).toLocaleString('de-DE', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch {
      return '—';
    }
  }

  escape(str) {
    return str?.replace(/[&<>]/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }[m])) || '';
  }
}
