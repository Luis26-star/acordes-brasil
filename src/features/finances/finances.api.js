// ========== FINANCE MODULE ==========
import { supabase } from '../../lib/supabase.js';

export class FinanceModule {
  constructor() {
    this.container = document.getElementById('feePaymentsList');
    this.currentYear = new Date().getFullYear();
  }

  // ================= INIT =================
  init() {
    if (!this.container) {
      console.warn('[FinanceModule] Container fehlt (#feePaymentsList)');
    }
  }

  // ================= OVERVIEW =================
  async loadOverview(year = this.currentYear) {
    try {
      const [paymentsRes, donationsRes] = await Promise.all([
        supabase.from('fee_payments').select('amount, status').eq('fee_year', year),
        supabase.from('donations').select('amount').eq('year', year)
      ]);

      if (paymentsRes.error) throw paymentsRes.error;
      if (donationsRes.error) throw donationsRes.error;

      const payments = paymentsRes.data ?? [];
      const donations = donationsRes.data ?? [];

      const totalFees = this.sum(payments);
      const totalDonations = this.sum(donations);

      const paidFees = this.sum(
        payments.filter(p => p.status === 'paid')
      );

      return {
        totalFees,
        totalDonations,
        paidFees,
        pendingFees: Math.max(totalFees - paidFees, 0),
        paymentRate: totalFees > 0
          ? Math.round((paidFees / totalFees) * 100)
          : 0
      };

    } catch (err) {
      console.error('[FinanceOverview]', err);
      return this.emptyOverview();
    }
  }

  emptyOverview() {
    return {
      totalFees: 0,
      totalDonations: 0,
      paidFees: 0,
      pendingFees: 0,
      paymentRate: 0
    };
  }

  // ================= LIST =================
  async loadFeePayments(year = this.currentYear) {
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
        this.container.innerHTML =
          `<tr><td colspan="5">Keine Zahlungen gefunden.</td></tr>`;
        return;
      }

      this.container.innerHTML = data.map(p => this.rowTemplate(p)).join('');
      this.bindEvents();

    } catch (err) {
      console.error('[loadFeePayments]', err);
      this.container.innerHTML =
        `<tr><td colspan="5">Fehler beim Laden</td></tr>`;
    }
  }

  // ================= ACTIONS =================
  async markAsPaid(paymentId) {
    if (!paymentId) return;

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
      console.error('[markAsPaid]', err);
      alert('Zahlung konnte nicht aktualisiert werden');
    }
  }

  generateReceipt(paymentId) {
    // Placeholder für später (PDF, Download etc.)
    console.info('[generateReceipt]', paymentId);
    alert(`Quittung für Zahlung #${paymentId}`);
  }

  async addDonation(donationData) {
    if (!donationData?.date) {
      alert('Datum fehlt');
      return false;
    }

    try {
      const payload = {
        ...donationData,
        amount: Number(donationData.amount) || 0,
        year: new Date(donationData.date).getFullYear()
      };

      const { error } = await supabase
        .from('donations')
        .insert([payload]);

      if (error) throw error;

      return true;

    } catch (err) {
      console.error('[addDonation]', err);
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
      btn.addEventListener('click', () =>
        this.markAsPaid(btn.dataset.pay)
      )
    );

    this.container.querySelectorAll('[data-receipt]').forEach(btn =>
      btn.addEventListener('click', () =>
        this.generateReceipt(btn.dataset.receipt)
      )
    );
  }

  // ================= HELPERS =================
  setLoading() {
    this.container.innerHTML =
      `<tr><td colspan="5">Laden...</td></tr>`;
  }

  sum(arr = []) {
    return arr.reduce((sum, item) =>
      sum + (Number(item?.amount) || 0), 0
    );
  }

  formatCurrency(value) {
    return `${(Number(value) || 0).toFixed(2)} €`;
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
