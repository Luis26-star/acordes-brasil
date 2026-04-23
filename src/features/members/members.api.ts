import { supabase } from '@/lib/supabase';

export async function fetchMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function updateMember(id: string, payload: any) {
  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteMember(id: string) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
