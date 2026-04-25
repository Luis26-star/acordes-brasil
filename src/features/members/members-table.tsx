'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // oder woher dein supabase import kommt

export default function MembersTable() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, member_number, name, email, voice, phone, role, status');

      if (error) throw error;
      
      setMembers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Laden...</div>;
  if (error) return <div>Fehler: {error}</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Member-Nr.</th>
          <th>Name</th>
          <th>E-Mail</th>
          <th>Stimme</th>
          <th>Telefon</th>
          <th>Rolle</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {members.map((m) => (
          <tr key={m.id}>
            <td>{m.member_number || '-'}</td>
            <td>{m.name || '-'}</td>
            <td>{m.email || '-'}</td>
            <td>{m.voice || '-'}</td>
            <td>{m.phone || '-'}</td>
            <td>{m.role || '-'}</td>
            <td>{m.status || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
const res = await fetch(
        'https://ifrpcqqkyoidyfhjglhk.supabase.co/rest/v1/profiles',
        {
          headers: {
            apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcnBjcXFreW9pZHlmaGpnbGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzI5MzYsImV4cCI6MjA5MTkwODkzNn0.x0D5118W2nJh_vfSHgfdf3wjL8Pr4L2aNmV5QrRMRms',
            Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcnBjcXFreW9pZHlmaGpnbGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzI5MzYsImV4cCI6MjA5MTkwODkzNn0.x0D5118W2nJh_vfSHgfdf3wjL8Pr4L2aNmV5QrRMRms',
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
      setError(err.message || 'Fehler beim Laden');
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
            {m.id} – {m.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
