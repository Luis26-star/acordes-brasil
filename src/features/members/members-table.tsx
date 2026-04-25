'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 🔥 WICHTIG: echte Werte einsetzen
const supabase = createClient(
  'https://ifrpcqqkyoidyfhjglhk.supabase.co,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcnBjcXFreW9pZHlmaGpnbGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzI5MzYsImV4cCI6MjA5MTkwODkzNn0.x0D5118W2nJh_vfSHgfdf3wjL8Pr4L2aNmV5QrRMRms'
);

export default function MembersTable() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    console.log('START LOAD');

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      console.log('DATA:', data);
      console.log('ERROR:', error);

      if (error) throw error;

      setMembers(data || []);
    } catch (err: any) {
      console.error('ERROR:', err);
      setError(err.message || 'Unbekannter Fehler');
    } finally {
      console.log('END LOAD');
      setLoading(false); // 🔥 DAS ist entscheidend
    }
  }

  // ================= UI =================

  if (loading) return <div>Laden...</div>;

  if (error) return <div>Fehler: {error}</div>;

  if (members.length === 0) {
    return <div>Keine Mitglieder gefunden</div>;
  }

  return (
    <div>
      <h2>Mitglieder</h2>

      <ul>
        {members.map((m) => (
          <li key={m.id}>
            {m.id} – {m.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
