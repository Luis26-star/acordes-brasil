// ========== AUTH MODUL ==========
export class AuthModule {
  constructor(app) {
    this.app = app;
  }
  
  async checkSession() {
    const { data: { session } } = await this.app.supabase.auth.getSession();
    if (session) {
      const { data: profile } = await this.app.supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        this.app.currentUser = {
          id: session.user.id,
          email: session.user.email,
          name: profile.name,
          role: profile.role,
          voice: profile.voice
        };
        if (profile.role === 'board' || profile.role === 'admin') {
          this.app.showBoardDashboard();
        } else {
          this.app.showMemberDashboard();
        }
      }
    }
  }
  
  showLogin() {
    document.getElementById('loginOverlay').classList.add('active');
    document.getElementById('loginError').textContent = '';
  }
  
  async handleLogin(email, password) {
    try {
      const { data, error } = await this.app.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const { data: profile } = await this.app.supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      this.app.currentUser = {
        id: data.user.id,
        email: data.user.email,
        name: profile.name,
        role: profile.role,
        voice: profile.voice
      };
      
      document.getElementById('loginOverlay').classList.remove('active');
      
      if (profile.role === 'board' || profile.role === 'admin') {
        this.app.showBoardDashboard();
      } else {
        this.app.showMemberDashboard();
      }
    } catch (error) {
      document.getElementById('loginError').textContent = error.message;
    }
  }
  
  async logout() {
    await this.app.supabase.auth.signOut();
    this.app.currentUser = null;
    this.app.showPublicContent();
  }
}
