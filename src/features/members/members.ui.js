import {
  fetchMembers,
  updateMember,
  deleteMember,
  inviteMemberFrontend // 🔥 neues Invite-System
} from './members.api.js';

export class MembersUI {
  constructor() {
    this.editId = null;
    this.tbody = document.getElementById('membersTableBody');
  }

  // ================= LOAD =================
  async load() {
    if (!this.tbody) return;

    this.setLoading();

    try {
      const members = await fetchMembers();

      if (!members.length) {
        this.tbody.innerHTML = `<tr><td colspan="6">Keine Mitglieder</td></tr>`;
        return;
      }

      this.tbody.innerHTML = members.map(m => this.rowTemplate(m)).join('');

      this.bindRowEvents();

    } catch (err) {
      console.error(err);
      this.tbody.innerHTML = `<tr><td colspan="6">Fehler beim Laden</td></tr>`;
    }
  }

  // ================= SAVE =================
  async save(formData) {
    try {
      if (this.editId) {
        await updateMember(this.editId, formData);
      } else {
        // 🔥 NEU: Invite statt Insert
        await inviteMemberFrontend({
          email: formData.email,
          name: formData.name,
          role: formData.role
        });
      }

      this.editId = null;
      await this.load();

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  // ================= DELETE =================
  async remove(id) {
    if (!confirm('Mitglied wirklich löschen?')) return;

    try {
      await deleteMember(id);
      await this.load();
    } catch (err) {
      console.error(err);
      alert('Löschen fehlgeschlagen');
    }
  }

  // ================= EDIT =================
  async edit(id) {
    this.editId = id;

    // 🔥 optional: Daten vorbefüllen (wenn Modal vorhanden)
    // Kann später erweitert werden
    console.log('Edit Member:', id);
  }

  // ================= TEMPLATE =================
  rowTemplate(m) {
    return `
      <tr>
        <td>${this.escape(m.name)}</td>
        <td>${this.escape(m.email)}</td>
        <td>${this.escape(m.voice || '—')}</td>
        <td><span class="badge badge-${m.role}">${m.role}</span></td>
        <td><span class="badge badge-${m.status}">${m.status}</span></td>
        <td>
          <button class="btn-icon" data-edit="${m.id}">✏️</button>
          <button class="btn-icon danger" data-delete="${m.id}">🗑</button>
        </td>
      </tr>
    `;
  }

  // ================= EVENTS =================
  bindRowEvents() {
    this.tbody.querySelectorAll('[data-edit]').forEach(btn =>
      btn.addEventListener('click', () => this.edit(btn.dataset.edit))
    );

    this.tbody.querySelectorAll('[data-delete]').forEach(btn =>
      btn.addEventListener('click', () => this.remove(btn.dataset.delete))
    );
  }

  // ================= HELPERS =================
  setLoading() {
    this.tbody.innerHTML = `<tr><td colspan="6">Laden...</td></tr>`;
  }

  escape(str) {
    return str?.replace(/[&<>]/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }[m])) || '';
  }
}
