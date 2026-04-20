// ========== PUSH MODUL ==========
export class PushModule {
  constructor(app) {
    this.app = app;
    this.swRegistration = null;
  }
  
  async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.ready;
        console.log('Service Worker bereit');
      } catch (error) {
        console.log('Service Worker nicht verfügbar:', error);
      }
    }
  }
  
  checkSupport() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      if (Notification.permission === 'default') {
        document.getElementById('pushBanner').style.display = 'flex';
      }
    }
  }
  
  async subscribe() {
    if (!this.swRegistration) {
      alert('Push-Benachrichtigungen werden nicht unterstützt.');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        alert('Benachrichtigungen wurden abgelehnt.');
        return;
      }
      
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.app.config?.VAPID_PUBLIC_KEY || '')
      });
      
      await this.app.supabase
        .from('push_subscriptions')
        .upsert({
          member_id: this.app.currentUser.id,
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
        });
      
      document.getElementById('pushBanner').style.display = 'none';
      alert('Benachrichtigungen aktiviert!');
      
    } catch (error) {
      console.error('Push error:', error);
      alert('Fehler beim Aktivieren von Push.');
    }
  }
  
  urlBase64ToUint8Array(base64String) {
    if (!base64String) return new Uint8Array();
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  async sendToUser(userId, notification) {
    const { data: subscriptions } = await this.app.supabase
      .from('push_subscriptions')
      .select('*')
      .eq('member_id', userId);
    
    if (!subscriptions?.length) return;
    
    for (const sub of subscriptions) {
      await this.sendNotification(sub, notification);
    }
  }
  
  async sendNotification(subscription, notification) {
    console.log('Sende Push:', notification.title);
  }
}
