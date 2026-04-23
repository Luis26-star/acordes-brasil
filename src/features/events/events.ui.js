import { fetchEvents, removeEvent } from './events.api.js';

export class EventsUI {
  async load() {
    const events = await fetchEvents();
    const tbody = document.getElementById('eventsTableBody');
    if (!tbody) return;

    tbody.innerHTML = events.length
      ? events.map(e => this.row(e)).join('')
      : `<tr><td colspan="6">Keine Events</td></tr>`;

    this.bindEvents();
  }

  row(e) {
    return `
      <tr>
        <td>${this.escape(e.title)}</td>
        <td>${this.escape(e.type)}</td>
        <td>${new Date(e.starttime).toLocaleString()}</td>
        <td>${new Date(e.endtime).toLocaleString()}</td>
        <td>${this.escape(e.location || '—')}</td>
        <td>
          <button data-delete="${e.id}">🗑</button>
        </td>
      </tr>
    `;
  }

  bindEvents() {
    document.querySelectorAll('[data-delete]').forEach(btn =>
      btn.addEventListener('click', () => this.remove(btn.dataset.delete))
    );
  }

  async remove(id) {
    if (!confirm('Event löschen?')) return;
    await removeEvent(id);
    await this.load();
  }

  escape(str) {
    return str?.replace(/[&<>]/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }[m])) || '';
  }
}


