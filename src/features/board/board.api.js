import { supabase } from '../../lib/supabase.js';

// ===============================
// MEMBERS
// ===============================
export async function getMemberStats() {
  const { data } = await supabase.from('profiles').select('status');

  const total = data?.length || 0;
  const active = data?.filter(m => m.status === 'active').length || 0;

  return {
    totalMembers: total,
    activeMembers: active
  };
}

// ===============================
// EVENTS
// ===============================
export async function getEventStats() {
  const now = new Date().toISOString();

  const { data: upcoming } = await supabase
    .from('events')
    .select('id')
    .gte('starttime', now);

  const { data: past } = await supabase
    .from('events')
    .select('id')
    .lt('starttime', now);

  return {
    upcomingEvents: upcoming?.length || 0,
    pastEvents: past?.length || 0
  };
}

// ===============================
// NEXT EVENT
// ===============================
export async function getNextEvent() {
  const { data } = await supabase
    .from('events')
    .select('title, starttime')
    .gte('starttime', new Date().toISOString())
    .order('starttime', { ascending: true })
    .limit(1)
    .maybeSingle();

  return data || null;
}

// ===============================
// UPCOMING EVENTS LIST
// ===============================
export async function getUpcomingEvents(limit = 5) {
  const { data } = await supabase
    .from('events')
    .select('id, title, type, starttime, location')
    .gte('starttime', new Date().toISOString())
    .order('starttime', { ascending: true })
    .limit(limit);

  return data || [];
}

// ===============================
// FINANCES
// ===============================
export async function getFinanceStats() {
  const { data } = await supabase
    .from('feepayments')
    .select('amount, status');

  const paid = data?.filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0) || 0;

  const pending = data?.filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + f.amount, 0) || 0;

  return { paid, pending };
}
