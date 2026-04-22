import { fetchEvents, saveEvent, deleteEvent } from './events.api.js';

export class EventsUI {
  constructor() {
    this.editId = null;
  }

  async load() {
    const events = await fetchEvents();
    const tbody = document.getElementById('eventsTableBody');
    if (!tbody) return;

    tbody.innerHTML = events.map(e => `
      <tr>
        <td>${escape(e.title)}</td>
        <td>${escape(e.type)}</td>
        <td>${new Date(e.starttime).toLocaleString()}</td>
        <td>${new Date(e.endtime).toLocaleString()}</td>
        <td>${escape(e.location || '—')}</td>
        <td>
          <button data-delete="${e.id}">🗑</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-delete]').forEach(btn =>
      btn.addEventListener('click', () => this.remove(btn.dataset.delete))
    );
  }

  async remove(id) {
    if (!confirm('Event löschen?')) return;
    await deleteEvent(id);
    await this.load();
  }
}

function escape(str) {
  return str?.replace(/[&<>]/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  }[m])) || '';
}
