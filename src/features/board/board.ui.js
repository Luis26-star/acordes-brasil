import Chart from 'chart.js/auto';
import {
  getMemberStats,
  getEventStats,
  getNextEvent,
  getUpcomingEvents,
  getFinanceStats
} from './board.api.js';

let chart = null;

// ===============================
// MAIN RENDER
// ===============================
export async function renderBoardDashboard() {
  await renderStats();
  await renderUpcoming();
  await renderFinanceChart();
}

// ===============================
// STATS
// ===============================
async function renderStats() {
  const memberStats = await getMemberStats();
  const eventStats = await getEventStats();
  const nextEvent = await getNextEvent();

  setText('statTotalMembers', memberStats.totalMembers);
  setText('statActiveMembers', memberStats.activeMembers);
  setText('statUpcomingEvents', eventStats.upcomingEvents);
  setText(
    'statNextEvent',
    nextEvent
      ? `${nextEvent.title} (${formatDate(nextEvent.starttime)})`
      : '--'
  );
}

// ===============================
// UPCOMING EVENTS
// ===============================
async function renderUpcoming() {
  const events = await getUpcomingEvents(5);
  const container = document.getElementById('boardUpcomingEvents');

  if (!container) return;

  container.innerHTML =
    events.length === 0
      ? '<p>Keine anstehenden Events.</p>'
      : events.map(e => `
        <div class="event-list-item">
          <div>
            <strong>${escapeHtml(e.title)}</strong><br>
            <small>${formatDate(e.starttime)} – ${e.location || '—'}</small>
          </div>
          <span class="status-badge">${e.type}</span>
        </div>
      `).join('');
}

// ===============================
// FINANCE CHART
// ===============================
async function renderFinanceChart() {
  const { paid, pending } = await getFinanceStats();
  const canvas = document.getElementById('financeChart');

  if (!canvas) return;

  if (chart) chart.destroy();

  chart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Bezahlt', 'Ausstehend'],
      datasets: [
        {
          data: [paid, pending],
          backgroundColor: ['#0a6f39', '#eab308']
        }
      ]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// ===============================
// HELPERS
// ===============================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('de-DE');
}

function escapeHtml(str) {
  return str?.replace(/[&<>]/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  }[m])) || '';
}
