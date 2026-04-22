// ========== FINANCE MODULE ==========
import { supabase } from '../../lib/supabase.js';

export class FinanceModule {
  constructor() {
    this.container = document.getElementById('feePaymentsList');
  }

  // ================= OVERVIEW =================
  async loadOverview(year = new Date().getFullYear()) {
    try {
      const [{ data: payments, error: pError }, { data: donations, error: dError }] =
        await Promise.all([
          supabase.from('fee_payments').select('*').eq('fee_year', year),
          supabase.from('donations').select('*').eq('year', year)
        ]);

      if (pError || dError) throw pError || dError;

      const totalFees = this.sum(payments);
      const totalDonations = this.sum(donations);

      const paidFees = this.sum(
        payments?.filter(p => p.status === 'paid')
      );

      return {
        totalFees,
        totalDonations,
        paidFees,
        pendingFees: Math.max(totalFees - paidFees, 0),
        paymentRate: totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0
      };

    } catch (err) {
      console.error('[FinanceOverview]', err);
      return {
        totalFees: 0,
        totalDonations: 0,
        paidFees: 0,
        pendingFees: 0,
        paymentRate: 0
      };
    }
  }

  // ================= LIST =================
  async loadFeePayments(year = new Date().getFullYear()) {
    if (!this.container) return;

    this.setLoading();

    try {
      const { data, error } = await supabase
        .from('fee_payments')
        .select(`
          id, amount, status, due_date,
          member:profiles(name)
        `)
        .eq('fee_year', year)
        .order('due_date', { ascending: true });

      if (error) throw error;

      if (!data?.length) {
        this.container.innerHTML = `<tr><td colspan="5">Keine Zahlungen gefunden.</td></tr>`;
        return;
      }

      this.container.innerHTML = data.map(p => this.rowTemplate(p)).join('');

      this.bindEvents();

    } catch (err) {
      console.error(err);
      this.container.innerHTML = `<tr><td colspan="5">Fehler beim Laden</td></tr>`;
    }
  }

  // ================= ACTIONS =================
  async markAsPaid(paymentId) {
    try {
      const { error } = await supabase
        .from('fee_payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      await this.loadFeePayments();

    } catch (err) {
      console.error(err);
      alert('Zahlung konnte nicht aktualisiert werden');
    }
  }

  generateReceipt(paymentId) {
    // TODO: später PDF / Download
    alert(`Quittung für Zahlung #${paymentId}`);
  }

  async addDonation(donationData) {
    try {
      const payload = {
        ...donationData,
        year: new Date(donationData.date).getFullYear()
      };

      const { error } = await supabase
        .from('donations')
        .insert([payload]);

      if (error) throw error;

      return true;

    } catch (err) {
      console.error(err);
      alert('Spende konnte nicht gespeichert werden');
      return false;
    }
  }

  // ================= TEMPLATE =================
  rowTemplate(p) {
    return `
      <tr>
        <td>${this.escape(p.member?.name || '-')}</td>
        <td>${this.formatCurrency(p.amount)}</td>
        <td>${this.getStatusLabel(p.status)}</td>
        <td>${this.formatDate(p.due_date)}</td>
        <td>
          ${
            p.status !== 'paid'
              ? `<button class="btn-icon" data-pay="${p.id}">✅</button>`
              : `<button class="btn-icon" data-receipt="${p.id}">📄</button>`
          }
        </td>
      </tr>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('[data-pay]').forEach(btn =>
      btn.addEventListener('click', () => this.markAsPaid(btn.dataset.pay))
    );

    this.container.querySelectorAll('[data-receipt]').forEach(btn =>
      btn.addEventListener('click', () => this.generateReceipt(btn.dataset.receipt))
    );
  }

  // ================= HELPERS =================
  setLoading() {
    this.container.innerHTML = `<tr><td colspan="5">Laden...</td></tr>`;
  }

  sum(arr = []) {
    return arr.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }

  formatCurrency(value) {
    return `${(value || 0).toFixed(2)} €`;
  }

  formatDate(date) {
    if (!date) return '—';
    try {
      return new Date(date).toLocaleDateString('de-DE');
    } catch {
      return '—';
    }
  }

  getStatusLabel(status) {
    const map = {
      paid: '✅ Bezahlt',
      pending: '⏳ Offen',
      overdue: '🔴 Überfällig'
    };
    return map[status] || status;
  }

  escape(str) {
    return str?.replace(/[&<>]/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }[m])) || '';
  }
}
