import { fetchMembers, removeMember } from './members.api.js';

export class MembersUI {
  async load() {
    const members = await fetchMembers();
    const tbody = document.getElementById('membersTableBody');
    if (!tbody) return;

    tbody.innerHTML = members.length
      ? members.map(m => this.row(m)).join('')
      : `<tr><td colspan="6">Keine Mitglieder</td></tr>`;

    this.bindEvents();
  }

  row(m) {
    return `
      <tr>
        <td>${this.escape(m.name)}</td>
        <td>${this.escape(m.email)}</td>
        <td>${this.escape(m.voice || '—')}</td>
        <td>${this.escape(m.role)}</td>
        <td>${this.escape(m.status)}</td>
        <td>
          <button data-delete="${m.id}">🗑</button>
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
    if (!confirm('Löschen?')) return;
    await removeMember(id);
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
