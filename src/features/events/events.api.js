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
