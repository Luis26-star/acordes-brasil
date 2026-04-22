// ========== PROJECTS MODUL ==========
export class ProjectsModule {
  constructor(app) {
    this.app = app;
  }
  
  async loadProjects() {
    const { data: projects } = await this.app.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    this.renderKanbanBoard(projects || []);
  }
  
  renderKanbanBoard(projects) {
    const statuses = {
      'planning': { title: '📝 Planung', projects: [] },
      'active': { title: '🚀 Aktiv', projects: [] },
      'completed': { title: '✅ Abgeschlossen', projects: [] },
      'on_hold': { title: '⏸ Pausiert', projects: [] }
    };
    
    projects.forEach(p => {
      if (statuses[p.status]) statuses[p.status].projects.push(p);
    });
    
    const container = document.getElementById('projectsKanban');
    if (!container) return;
    
    container.innerHTML = Object.entries(statuses).map(([status, col]) => `
      <div class="kanban-column">
        <h3>${col.title} (${col.projects.length})</h3>
        <div class="kanban-cards">
          ${col.projects.map(p => this.renderProjectCard(p)).join('')}
        </div>
      </div>
    `).join('');
  }
  
  renderProjectCard(project) {
    const progress = project.progress || 0;
    return `
      <div class="project-card" onclick="app.projects.showDetails('${project.id}')">
        <div class="project-header">
          <span>📋 ${project.title}</span>
          <span>📅 ${project.deadline ? new Date(project.deadline).toLocaleDateString('de-DE') : '-'}</span>
        </div>
        <div class="project-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <span>${progress}%</span>
        </div>
        <div class="project-body">
          <div>💰 ${project.budget?.toLocaleString('de-DE') || 0}€</div>
          <div>👤 ${project.lead_name || '-'}</div>
        </div>
      </div>
    `;
  }
  
  showDetails(projectId) {
    alert(`Projekt-Details für ID: ${projectId}`);
  }
  
  async createProject(projectData) {
    const { error } = await this.app.supabase
      .from('projects')
      .insert({
        ...projectData,
        created_by: this.app.currentUser.id,
        status: 'planning',
        progress: 0
      });
    
    if (error) {
      alert('Fehler: ' + error.message);
      return false;
    }
    
    await this.loadProjects();
    return true;
  }
  
  async updateStatus(projectId, newStatus) {
    await this.app.supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);
    
    await this.loadProjects();
  }
  
  async updateProgress(projectId, progress) {
    await this.app.supabase
      .from('projects')
      .update({ progress })
      .eq('id', projectId);
    
    await this.loadProjects();
  }
}
