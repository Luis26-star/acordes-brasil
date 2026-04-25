'use client';

import { useEffect, useState } from 'react';

import { useRealtimeMembers } from '@/hooks/use-realtime-members';

import {
  fetchMembers,
  updateMember,
  deleteMember
} from './members.api';

import { EditableCell } from '@/components/editable/editable-cell';
import { MembersTableSkeleton } from '@/components/tables/members-table-skeleton';
import {
  showUndoDelete,
  showSuccess,
  showError
} from '@/components/ui/toast/toast-provider';

/**
 * Typ für Member (wichtig für Stabilität)
 */
type Member = {
  id: string;
  name: string;
  email: string;
  voice?: string;
  role: string;
  status: string;
};

export function MembersTable() {
  const [members, setMembers] = useState<Member[]>([]);
  'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugMembers() {
  const [state, setState] = useState<any>({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    setState({
      loading: false,
      data,
      error,
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>DEBUG</h2>

      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}

  // ================= LOAD =================
  async function load() {
    try {
      setLoading(true);
      const data = await fetchMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
      showError('Fehler beim Laden der Mitglieder');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ================= REALTIME =================
  useRealtimeMembers(setMembers);

  // ================= UPDATE =================
  async function handleUpdate(
    id: string,
    field: keyof Member,
    value: string
  ) {
    try {
      // Optimistic Update
      setMembers(prev =>
        prev.map(m =>
          m.id === id ? { ...m, [field]: value } : m
        )
      );

      await updateMember(id, { [field]: value });

      showSuccess('Gespeichert');

    } catch (err) {
      console.error(err);
      showError('Speichern fehlgeschlagen');

      // Rollback (wichtig!)
      load();
    }
  }

  // ================= DELETE =================
  async function handleDelete(member: Member) {
    try {
      // Optimistic Remove
      setMembers(prev => prev.filter(m => m.id !== member.id));

      await deleteMember(member.id);

      showUndoDelete('Mitglied gelöscht', async () => {
        // rudimentäres Undo → reload
        await load();
      });

    } catch (err) {
      console.error(err);
      showError('Löschen fehlgeschlagen');
      load(); // rollback
    }
  }

  // ================= UI =================
  if (loading) return <MembersTableSkeleton />;

  return (
    <table
      className="w-full border rounded-lg overflow-hidden"
      aria-label="Mitglieder Tabelle"
    >
      <thead className="bg-gray-100 text-left text-sm">
        <tr>
          <th className="p-2">Name</th>
          <th className="p-2">Email</th>
          <th className="p-2">Stimme</th>
          <th className="p-2">Rolle</th>
          <th className="p-2">Status</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {members.map(m => (
          <tr key={m.id} className="border-t">

            {/* NAME */}
            <td className="p-2">
              <EditableCell
                value={m.name}
                ariaLabel="Name bearbeiten"
                onSave={(v) => handleUpdate(m.id, 'name', v)}
              />
            </td>

            {/* EMAIL */}
            <td className="p-2">
              <EditableCell
                value={m.email}
                ariaLabel="Email bearbeiten"
                onSave={(v) => handleUpdate(m.id, 'email', v)}
              />
            </td>

            {/* STATIC FIELDS */}
            <td className="p-2">{m.voice || '—'}</td>
            <td className="p-2">{m.role}</td>
            <td className="p-2">{m.status}</td>

            {/* ACTIONS */}
            <td className="p-2">
              <button
                onClick={() => handleDelete(m)}
                className="text-red-500 hover:text-red-700"
                aria-label="Mitglied löschen"
              >
                🗑
              </button>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  );
}
