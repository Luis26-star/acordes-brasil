// features/board/board.ui.js

import { getBoardStats, getUpcomingEvents, exportMembersCSV } from './board.api.js';

export async function renderBoardOverview() {
  const stats = await getBoardStats();

  document.getElementById('statTotalMembers').textContent = stats.totalMembers;
  document.getElementById('statActiveMembers').textContent = stats.activeMembers;
  document.getElementById('statAvgAttendance').textContent = stats.avgAttendance + '%';
  document.getElementById('statNextEvent').textContent = stats.nextEvent || '--';

  const events = await getUpcomingEvents(5);
  const container = document.getElementById('boardUpcomingEvents');

  if (!container) return;

  container.innerHTML = events.map(e => `
    <div class="event-list-item">
      <div>
        <strong>${e.title}</strong><br>
        <small>${new Date(e.starttime).toLocaleDateString('de-DE')}</small>
      </div>
      <span class="status-badge">${e.type}</span>
    </div>
  `).join('');
}

export function exportMembers() {
  exportMembersCSV().then(members => {
    if (!members.length) {
      alert('Keine Mitglieder vorhanden');
      return;
    }

    const csv = [
      ['Name', 'E-Mail', 'Stimmlage', 'Telefon'],
      ...members.map(m => [m.name, m.email, m.voice, m.phone])
    ].map(r => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mitglieder.csv';
    link.click();
  });
}
