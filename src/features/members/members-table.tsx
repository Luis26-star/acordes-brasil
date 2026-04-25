'use client';

import { useEffect, useState } from 'react';

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

      const res = await fetch(
        'https://XXXX.supabase.co/rest/v1/profiles',
        {
          headers: {
            apikey: 'XXXX',
            Authorization: 'Bearer XXXX',
          },
        }
      );

      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }

      const data = await res.json();

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
