import { supabase } from '../../lib/supabase.js';

// ================= FETCH =================
export async function fetchMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, voice, role, status')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

// ================= INVITE USER =================
// ⚠️ Nur Admin/Board erlaubt (RLS greift hier!)
export async function inviteMember({ email, name, role = 'member' }) {
  if (!email) throw new Error('E-Mail erforderlich');

  // Invite via Supabase Auth
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { name }
  });

  if (error) {
    console.error('[inviteMember]', error);
    throw new Error('Einladung fehlgeschlagen');
  }

  // Optional: Rolle setzen (nach Trigger)
  if (role !== 'member') {
    await supabase
      .from('profiles')
      .update({ role })
      .eq('id', data.user.id);
  }

  return data;
}

// ================= UPDATE =================
export async function updateMember(id, payload) {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ================= DELETE =================
// ⚠️ löscht nur Profil, nicht Auth-User
export async function deleteMember(id) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return true;
}
