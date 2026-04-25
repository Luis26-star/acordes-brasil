'use client';

import { useEffect, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';

// 🔥 HARDCODE (für GitHub Pages nötig)
const supabase = createClient('https://XXXX.supabase.co', 'XXXX');

export default function MembersTable() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        setProfile(null);
        setError('Nicht eingeloggt. (authenticated required)');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single(); // wegen deiner RLS: der member sieht nur seinen eigenen Datensatz

      if (error) throw error;

      setProfile(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Laden...</div>;
  if (error) return <div>Fehler: {error}</div>;
  if (!profile) return <div>Keine Daten vorhanden</div>;

  return (
    <div>
      <h2>Mein Profil</h2>
      <ul>
        <li>
          {profile.id} - {profile.role}
        </li>
      </ul>
    </div>
  );
}
