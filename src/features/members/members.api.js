import { supabase } from '../../lib/supabase.js';

export async function fetchMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, voice, role, status')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function saveMember(id, payload) {
  const query = id
    ? supabase.from('profiles').update(payload).eq('id', id)
    : supabase.from('profiles').insert([{ id: crypto.randomUUID(), ...payload }]);

  const { error } = await query;
  if (error) throw error;
}

export async function removeMember(id) {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
}
