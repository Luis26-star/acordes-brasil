// ========== BOARD MODUL ==========
export class BoardModule {
  constructor(app) {
    this.app = app;
  }
  
  async loadOverview() {
    const stats = await this.app.storage.getBoardStats();
    
    document.getElementById('statTotalMembers').textContent = stats.totalMembers;
    document.getElementById('statActiveMembers').textContent = stats.activeMembers;
    document.getElementById('statAvgAttendance').textContent = stats.avgAttendance + '%';
    document.getElementById('statNextEvent').textContent = stats.nextEvent || '--';
    
    const upcoming = await this.app.storage.getUpcomingEvents(5);
    const container = document.getElementById('boardUpcomingEvents');
    
    if (container) {
      container.innerHTML = upcoming.map(e => `
        <div class="event-list-item">
          <div>
            <strong>${e.title}</strong><br>
            <small>${new Date(e.start_time).toLocaleDateString('de-DE')} - ${e.location || 'A definir'}</small>
          </div>
          <span class="status-badge status-active">${e.type}</span>
        </div>
      `).join('') || '<p>Keine anstehenden Events.</p>';
    }
  }
  
  switchTab(tabId) {
    document.querySelectorAll('.board-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.board-panel').forEach(p => p.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`panel-${tabId}`).classList.add('active');
  }
  
  async exportMembers() {
    const { data: members } = await this.app.supabase
      .from('profiles')
      .select('name,email,voice,phone');
    
    if (!members?.length) {
      alert('Keine Mitglieder zum Exportieren.');
      return;
    }
    
    const csv = [
      ['Name', 'E-Mail', 'Stimmlage', 'Telefon'],
      ...members.map(m => [m.name, m.email, m.voice, m.phone])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mitglieder_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}
