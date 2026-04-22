import { supabase } from '../../lib/supabase.js';

export async function fetchMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, voice, role, status')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createMember(payload) {
  const { error } = await supabase
    .from('profiles')
    .insert([{ id: crypto.randomUUID(), ...payload }]);

  if (error) throw error;
}

export async function updateMember(id, payload) {
  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteMember(id) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
