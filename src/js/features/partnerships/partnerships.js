// ========== PARTNERSHIPS MODUL ==========
export class PartnershipsModule {
  constructor(app) {
    this.app = app;
  }
  
  async loadPartners() {
    const { data: partners } = await this.app.supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });
    
    this.renderKanbanBoard(partners || []);
  }
  
  renderKanbanBoard(partners) {
    const statuses = {
      'inquiry': { title: '📝 Anfragen', partners: [] },
      'negotiation': { title: '🤝 Verhandlung', partners: [] },
      'active': { title: '✅ Aktiv', partners: [] },
      'inactive': { title: '⏸ Inaktiv', partners: [] }
    };
    
    partners.forEach(p => {
      if (statuses[p.status]) statuses[p.status].partners.push(p);
    });
    
    const container = document.getElementById('partnersKanban');
    if (!container) return;
    
    container.innerHTML = Object.entries(statuses).map(([status, col]) => `
      <div class="kanban-column">
        <h3>${col.title} (${col.partners.length})</h3>
        <div class="kanban-cards">
          ${col.partners.map(p => this.renderPartnerCard(p)).join('')}
        </div>
      </div>
    `).join('');
  }
  
  renderPartnerCard(partner) {
    const typeIcons = { 'company': '🏢', 'institution': '🏛️', 'foundation': '🎓', 'individual': '👤', 'media': '📰' };
    const levelBadges = { 'bronze': '🥉', 'silber': '🥈', 'gold': '🥇', 'main': '🌟' };
    
    return `
      <div class="partner-card" onclick="app.partnerships.showDetails('${partner.id}')">
        <div class="partner-header">
          <span>${typeIcons[partner.type] || '🏢'} ${partner.name}</span>
          <span>${levelBadges[partner.level] || ''}</span>
        </div>
        <div class="partner-body">
          <div>📅 ${new Date(partner.created_at).toLocaleDateString('de-DE')}</div>
          <div>💰 ${partner.amount ? partner.amount.toLocaleString('de-DE') + '€' : '-'}</div>
          <div>👤 ${partner.contact_person || '-'}</div>
        </div>
      </div>
    `;
  }
  
  showDetails(partnerId) {
    alert(`Partner-Details für ID: ${partnerId}`);
  }
  
  async createPartner(partnerData) {
    const { error } = await this.app.supabase
      .from('partners')
      .insert({
        ...partnerData,
        created_by: this.app.currentUser.id,
        status: 'inquiry'
      });
    
    if (error) {
      alert('Fehler: ' + error.message);
      return false;
    }
    
    await this.loadPartners();
    return true;
  }
  
  async updateStatus(partnerId, newStatus) {
    await this.app.supabase
      .from('partners')
      .update({ status: newStatus })
      .eq('id', partnerId);
    
    await this.loadPartners();
  }
  
  async addCommunication(partnerId, communication) {
    await this.app.supabase
      .from('communications')
      .insert({
        partner_id: partnerId,
        ...communication,
        created_by: this.app.currentUser.id
      });
  }
}
