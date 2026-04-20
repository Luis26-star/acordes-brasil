// ========== FINANCE MODUL ==========
export class FinanceModule {
  constructor(app) {
    this.app = app;
  }
  
  async loadOverview(year = new Date().getFullYear()) {
    const { data: payments } = await this.app.supabase
      .from('fee_payments')
      .select('*')
      .eq('fee_year', year);
    
    const { data: donations } = await this.app.supabase
      .from('donations')
      .select('*')
      .eq('year', year);
    
    const totalFees = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const paidFees = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) || 0;
    
    return {
      totalFees,
      totalDonations,
      paidFees,
      pendingFees: totalFees - paidFees,
      paymentRate: totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0
    };
  }
  
  async loadFeePayments(year = new Date().getFullYear()) {
    const { data: payments } = await this.app.supabase
      .from('fee_payments')
      .select(`
        *,
        member:profiles!inner(name)
      `)
      .eq('fee_year', year)
      .order('due_date');
    
    const container = document.getElementById('feePaymentsList');
    if (!container) return;
    
    container.innerHTML = payments?.map(p => `
      <tr>
        <td>${p.member?.name || '-'}</td>
        <td>${p.amount}€</td>
        <td>${this.getStatusLabel(p.status)}</td>
        <td>${new Date(p.due_date).toLocaleDateString('de-DE')}</td>
        <td>
          ${p.status !== 'paid' ? 
            `<button onclick="app.finance.markAsPaid('${p.id}')">✅</button>` : 
            `<button onclick="app.finance.generateReceipt('${p.id}')">📄</button>`
          }
        </td>
      </tr>
    `).join('') || '<tr><td colspan="5">Keine Zahlungen gefunden.</td></tr>';
  }
  
  getStatusLabel(status) {
    const labels = { paid: '✅ Bezahlt', pending: '⏳ Offen', overdue: '🔴 Überfällig' };
    return labels[status] || status;
  }
  
  async markAsPaid(paymentId) {
    await this.app.supabase
      .from('fee_payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', paymentId);
    
    await this.loadFeePayments();
  }
  
  generateReceipt(paymentId) {
    alert(`Quittung für Zahlung #${paymentId} wird erstellt...`);
  }
  
  async addDonation(donationData) {
    const { error } = await this.app.supabase
      .from('donations')
      .insert({
        ...donationData,
        year: new Date(donationData.date).getFullYear()
      });
    
    if (error) {
      alert('Fehler: ' + error.message);
      return false;
    }
    return true;
  }
}
