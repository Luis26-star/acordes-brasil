// features/board/board.api.js

import { supabase } from '../../lib/supabase.js';

export async function getBoardStats() {
  // TODO: sauber berechnen (nicht aus storage!)
  return {
    totalMembers: 0,
    activeMembers: 0,
    avgAttendance: 0,
    nextEvent: null
  };
}

export async function getUpcomingEvents(limit = 5) {
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('starttime', { ascending: true })
    .limit(limit);

  return data || [];
}

export async function exportMembersCSV() {
  const { data } = await supabase
    .from('profiles')
    .select('name,email,voice,phone');

  return data || [];
}
