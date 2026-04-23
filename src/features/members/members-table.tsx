'use client';

import { useEffect, useState } from 'react';
import {
  fetchMembers,
  updateMember,
  deleteMember
} from './members.api';

import { EditableCell } from '@/components/editable/editable-cell';
import { MembersTableSkeleton } from '@/components/tables/members-table-skeleton';
import { showUndoDelete, showSuccess } from '@/components/ui/toast/toast-provider';

export function MembersTable() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await fetchMembers();
    setMembers(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpdate(id: string, field: string, value: string) {
    await updateMember(id, { [field]: value });

    setMembers(prev =>
      prev.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );

    showSuccess('Gespeichert');
  }

  async function handleDelete(member: any) {
    await deleteMember(member.id);

    setMembers(prev => prev.filter(m => m.id !== member.id));

    showUndoDelete('Mitglied gelöscht', () => load());
  }

  if (loading) return <MembersTableSkeleton />;

  return (
    <table className="w-full border rounded-lg overflow-hidden">
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

            <td className="p-2">
              <EditableCell
                value={m.name}
                ariaLabel="Name bearbeiten"
                onSave={(v) => handleUpdate(m.id, 'name', v)}
              />
            </td>

            <td className="p-2">
              <EditableCell
                value={m.email}
                ariaLabel="Email bearbeiten"
                onSave={(v) => handleUpdate(m.id, 'email', v)}
              />
            </td>

            <td className="p-2">{m.voice}</td>
            <td className="p-2">{m.role}</td>
            <td className="p-2">{m.status}</td>

            <td className="p-2">
              <button
                onClick={() => handleDelete(m)}
                className="text-red-500"
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
