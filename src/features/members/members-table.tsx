'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 🔥 HARDCODE (für GitHub Pages nötig)
const supabase = createClient(
  'https://XXXX.supabase.co',
  'XXXX'
);

export default function MembersTable() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      setMembers(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ================= UI =================

  if (loading) return <div>Laden...</div>;

  if (error) return <div>Fehler: {error}</div>;

  if (members.length === 0) {
    return <div>Keine Mitglieder vorhanden</div>;
  }

  return (
    <div>
      <h2>Mitglieder</h2>

      <ul>
        {members.map((m) => (
          <li key={m.id}>
            {m.id} - {m.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
