import {
  fetchMembers,
  createMember,
  updateMember,
  deleteMember
} from './members.api.js';

export class MembersUI {
  constructor() {
    this.editId = null;
  }

  async load() {
    const members = await fetchMembers();
    const tbody = document.getElementById('membersTableBody');
    if (!tbody) return;

    if (!members.length) {
      tbody.innerHTML = `<tr><td colspan="6">Keine Mitglieder</td></tr>`;
      return;
    }

    tbody.innerHTML = members.map(m => `
      <tr>
        <td>${escape(m.name)}</td>
        <td>${escape(m.email)}</td>
        <td>${escape(m.voice || '—')}</td>
        <td>${escape(m.role)}</td>
        <td>${escape(m.status)}</td>
        <td>
          <button data-edit="${m.id}">✏️</button>
          <button data-delete="${m.id}">🗑</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-delete]').forEach(btn =>
      btn.addEventListener('click', () => this.remove(btn.dataset.delete))
    );
  }

  async save(formData) {
    if (this.editId) {
      await updateMember(this.editId, formData);
    } else {
      await createMember(formData);
    }

    this.editId = null;
    await this.load();
  }

  async remove(id) {
    if (!confirm('Löschen?')) return;
    await deleteMember(id);
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
