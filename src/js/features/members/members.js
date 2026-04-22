// ========== MEMBERS MODUL ==========
export class MembersModule {
  constructor(app) {
    this.app = app;
  }
  
  async loadList() {
    const { data: members } = await this.app.supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    const tbody = document.getElementById('membersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = members?.map(m => `
      <tr>
        <td>${m.name || '-'}</td>
        <td>${m.voice || '-'}</td>
        <td>${m.email || '-'}</td>
        <td>${m.phone || '-'}</td>
        <td><span class="status-badge status-active">● Aktiv</span></td>
        <td>
          <button class="btn-icon" onclick="app.members.edit('${m.id}')">✏️</button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6">Keine Mitglieder gefunden.</td></tr>';
  }
  
  edit(id) {
    alert(`Mitglied bearbeiten: ${id}`);
  }
  
  async add(formData) {
    const { error } = await this.app.supabase
      .from('profiles')
      .insert({
        name: formData.name,
        email: formData.email,
        voice: formData.voice,
        phone: formData.phone,
        role: 'member'
      });
    
    if (error) {
      alert('Fehler: ' + error.message);
      return false;
    }
    
    await this.loadList();
    return true;
  }
  
  async remove(id) {
    if (!confirm('Mitglied wirklich löschen?')) return false;
    
    const { error } = await this.app.supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      alert('Fehler: ' + error.message);
      return false;
    }
    
    await this.loadList();
    return true;
  }
}
