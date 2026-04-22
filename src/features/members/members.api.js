import { supabase } from '../../lib/supabase.js';

// ================= FETCH =================
export async function fetchMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, voice, role, status')
    .order('name', { ascending: true });

  if (error) {
    console.error('[fetchMembers]', error);
    throw new Error('Mitglieder konnten nicht geladen werden');
  }

  return data ?? [];
}

// ================= CREATE =================
// ⚠️ IMPORTANT:
// Profiles sollten NICHT direkt erstellt werden,
// sondern über Supabase Auth + Trigger.
// Diese Funktion ist nur für bestehende User gedacht.

export async function createMember(payload) {
  if (!payload?.id) {
    throw new Error('createMember benötigt eine user.id (kein random UUID!)');
  }

  const cleanPayload = {
    id: payload.id,
    name: payload.name ?? '',
    email: payload.email ?? '',
    voice: payload.voice ?? null,
    role: payload.role ?? 'member',
    status: payload.status ?? 'active'
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert([cleanPayload])
    .select()
    .single();

  if (error) {
    console.error('[createMember]', error);
    throw new Error('Mitglied konnte nicht erstellt werden');
  }

  return data;
}

// ================= UPDATE =================
export async function updateMember(id, payload) {
  if (!id) throw new Error('updateMember: ID fehlt');

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateMember]', error);
    throw new Error('Mitglied konnte nicht aktualisiert werden');
  }

  return data;
}

// ================= DELETE =================
export async function deleteMember(id) {
  if (!id) throw new Error('deleteMember: ID fehlt');

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteMember]', error);
    throw new Error('Mitglied konnte nicht gelöscht werden');
  }

  return true;
}
