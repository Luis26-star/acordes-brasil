import { supabase } from '../../lib/supabase.js';

export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('starttime', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function removeEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}



// ========== CALENDAR MODULE ==========
import { supabase } from '../../lib/supabase.js';

// ================= API =================
export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('starttime', { ascending: true });

  if (error) {
    console.error('[fetchEvents]', error);
    throw new Error('Events konnten nicht geladen werden');
  }

  return data ?? [];
}

export async function saveEvent(id, payload) {
  const query = id
    ? supabase.from('events').update(payload).eq('id', id)
    : supabase.from('events').insert([payload]);

  const { data, error } = await query.select().single();

  if (error) {
    console.error('[saveEvent]', error);
    throw new Error('Event konnte nicht gespeichert werden');
  }

  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteEvent]', error);
    throw new Error('Event konnte nicht gelöscht werden');
  }

  return true;
}

// ================= MODULE =================
export class CalendarModule {
  constructor(app) {
    this.app = app;
    this.calendar = null;
    this.selectedEventId = null;
  }

  // ================= INIT =================
  init() {
    const el = document.getElementById('calendar');
    if (!el) return;

    this.calendar = new FullCalendar.Calendar(el, {
      initialView: 'dayGridMonth',
      locale: this.app?.currentLang === 'pt' ? 'pt-br' : (this.app?.currentLang || 'de'),

      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listMonth'
      },

      events: [],

      eventClick: (info) => this.handleEventClick(info.event),

      eventClassNames: (arg) => {
        const type = arg.event.extendedProps.type;
        return `fc-event-${type || 'default'}`;
      }
    });

    this.calendar.render();
  }

  // ================= LOAD =================
  async loadCalendar() {
    if (!this.calendar) return;

    try {
      const events = await fetchEvents();

      const mapped = events.map(e => ({
        id: e.id,
        title: e.title,
        start: e.starttime,
        end: e.endtime || e.starttime,

        extendedProps: {
          type: e.type,
          location: e.location,
          description: e.description
        }
      }));

      this.calendar.removeAllEvents();
      this.calendar.addEventSource(mapped);

    } catch (err) {
      console.error(err);
      alert('Kalender konnte nicht geladen werden');
    }
  }

  // ================= CLICK =================
  handleEventClick(event) {
    this.selectedEventId = event.id;

    const start = event.start;
    const date = start?.toLocaleDateString('de-DE') || '';
    const time = start?.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) || '';

    alert(
      `${event.title}\n${date} ${time}\n${event.extendedProps.location || ''}`
    );
  }

  // ================= PARTICIPATION =================
  async setParticipation(status) {
    if (!this.selectedEventId || !this.app?.user) return;

    try {
      const { error } = await supabase
        .from('participations')
        .upsert({
          member_id: this.app.user.id,
          event_id: this.selectedEventId,
          status,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Teilnahme gespeichert');

    } catch (err) {
      console.error(err);
      alert('Fehler beim Speichern');
    }
  }

  // ================= CREATE EVENT =================
  async createEvent(eventData) {
    if (!this.app?.user) return false;

    try {
      await saveEvent(null, {
        ...eventData,
        createdby: this.app.user.id
      });

      await this.loadCalendar();
      return true;

    } catch (err) {
      console.error(err);
      alert(err.message);
      return false;
    }
  }

  // ================= DELETE =================
  async removeEvent(id) {
    if (!confirm('Event wirklich löschen?')) return;

    try {
      await deleteEvent(id);
      await this.loadCalendar();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }
}
