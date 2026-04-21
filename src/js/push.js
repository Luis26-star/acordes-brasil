// modules/push.js

export class PushModule {
  constructor({ app }) {
    this.app = app;
  }

  async subscribe(user) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push nicht unterstützt');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const reg = await navigator.serviceWorker.ready;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: CONFIG.PUSH.VAPID_PUBLIC_KEY
    });

    await this.app.supabase
      .from('members')
      .update({ push_subscription: sub })
      .eq('id', user.id);

    console.info('✅ Push Subscription gespeichert');
  }
}
