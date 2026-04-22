// ========== CALENDAR MODUL ==========
import { supabase } from '../../lib/supabase.js';

export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('starttime', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function saveEvent(id, payload) {
  if (id) {
    const { error } = await supabase.from('events').update(payload).eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('events').insert([payload]);
    if (error) throw error;
  }
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
export class CalendarModule {
  constructor(app) {
    this.app = app;
    this.calendar = null;
    this.selectedEventId = null;
  }
  
  init() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    
    this.calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: this.app.currentLang === 'pt' ? 'pt-br' : this.app.currentLang,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listMonth'
      },
      events: [],
      eventClick: (info) => this.handleEventClick(info.event),
      eventClassNames: (arg) => {
        return arg.event.extendedProps.type === 'ensaio' ? 'fc-event-ensaio' : 'fc-event-concerto';
      }
    });
    
    this.calendar.render();
  }
  
  async loadMemberCalendar() {
    if (!this.calendar) return;
    
    const events = await this.app.storage.getAllEvents();
    
    const fullCalendarEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      start: e.start_time,
      end: e.end_time || e.start_time,
      extendedProps: {
        type: e.type,
        location: e.location,
        description: e.description
      }
    }));
    
    this.calendar.removeAllEvents();
    this.calendar.addEventSource(fullCalendarEvents);
  }
  
  handleEventClick(event) {
    this.selectedEventId = event.id;
    const startDate = event.start?.toLocaleDateString('de-DE') || '';
    const startTime = event.start?.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) || '';
    
    alert(`${event.title}\n${startDate} ${startTime}\n${event.extendedProps.location || ''}`);
  }
  
  async setParticipation(status) {
    if (!this.selectedEventId || !this.app.currentUser) return;
    
    await this.app.supabase
      .from('participations')
      .upsert({
        member_id: this.app.currentUser.id,
        event_id: this.selectedEventId,
        status: status,
        updated_at: new Date().toISOString()
      });
    
    alert('Teilnahme registriert!');
  }
  
  async addEvent(eventData) {
    const { error } = await this.app.supabase
      .from('events')
      .insert({
        ...eventData,
        created_by: this.app.currentUser.id
      });
    
    if (error) {
      alert('Fehler: ' + error.message);
      return false;
    }
    
    await this.loadMemberCalendar();
    await this.app.loadPublicConcerts();
    return true;
  }
}
