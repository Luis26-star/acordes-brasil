'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

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
      setError(null);

      const supabase = createClient();

      const { data, error } = await supabase
        .from('profiles')
        .select('id, member_number, name, email, voice, phone, role, status');

      if (error) throw error;

      setMembers(data || []);
    } catch (err: any) {
      console.error('Fehler beim Laden:', err);
      setError(err.message || 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  // ================= UI =================

  if (loading) return <div>Laden...</div>;

  if (error) return <div style={{ color: 'red' }}>Fehler: {error}</div>;

  if (members.length === 0) {
    return <div>Keine Mitglieder vorhanden</div>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <h2>Mitglieder</h2>

      <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Mitglieds-Nr.</th>
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
    </div>
  );
}
