/* =========================================================
   SYNC STATUS UI MODULE
========================================================= */

export class SyncUI {
  constructor() {
    this.el = document.getElementById('syncStatus');
    this.text = document.getElementById('syncText');
  }

  setState(state) {
    if (!this.el) return;

    this.el.classList.remove('c-sync--pending', 'c-sync--error');

    switch (state) {
      case 'pending':
        this.el.classList.add('c-sync--pending');
        this.text.textContent = 'Wird synchronisiert…';
        break;

      case 'error':
        this.el.classList.add('c-sync--error');
        this.text.textContent = 'Sync fehlgeschlagen';
        break;

      case 'success':
      default:
        this.text.textContent = 'Alles synchronisiert';
        break;
    }
  }
}
