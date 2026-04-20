// ========== STORAGE MODUL ==========
export class StorageModule {
  constructor(app) {
    this.app = app;
  }
  
  async getPublicConcerts() {
    const { data, error } = await this.app.supabase
      .from('events')
      .select('*')
      .eq('type', 'concerto')
      .gt('start_time', new Date().toISOString())
      .order('start_time');
    
    return data || [];
  }
  
  async getAllEvents() {
    const { data } = await this.app.supabase
      .from('events')
      .select('*')
      .order('start_time');
    
    return data || [];
  }
  
  async getUpcomingEvents(limit = 5) {
    const { data } = await this.app.supabase
      .from('events')
      .select('*')
      .gt('start_time', new Date().toISOString())
      .order('start_time')
      .limit(limit);
    
    return data || [];
  }
  
  async getBoardStats() {
    const { count: totalMembers } = await this.app.supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const { data: events } = await this.app.supabase.from('events').select('*');
    const { data: participations } = await this.app.supabase.from('participations').select('*');
    
    const totalEvents = events?.length || 1;
    const totalParticipations = participations?.filter(p => p.status === 'sim').length || 0;
    const avgAttendance = totalMembers > 0 ? Math.round((totalParticipations / (totalMembers * totalEvents)) * 100) : 0;
    
    const upcoming = events?.filter(e => new Date(e.start_time) > new Date()).sort((a, b) => 
      new Date(a.start_time) - new Date(b.start_time)
    );
    
    return {
      totalMembers: totalMembers || 0,
      activeMembers: totalMembers || 0,
      avgAttendance,
      nextEvent: upcoming?.[0] ? new Date(upcoming[0].start_time).toLocaleDateString('de-DE') : '--'
    };
  }
}
