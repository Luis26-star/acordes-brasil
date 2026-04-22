import Chart from 'chart.js/auto';
import { supabase } from '../../lib/supabase.js';

let chart;

export async function renderFinanceChart() {
  const { data } = await supabase.from('feepayments').select('amount, status');

  const list = data || [];

  const paid = list.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const pending = list.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);

  if (chart) chart.destroy();

  const canvas = document.getElementById('financeChart');
  if (!canvas) return;

  chart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Bezahlt', 'Offen'],
      datasets: [{
        data: [paid, pending],
        backgroundColor: ['#0a6f39', '#eab308']
      }]
    }
  });
}
