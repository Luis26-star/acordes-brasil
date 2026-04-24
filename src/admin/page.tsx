'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Page() {
  const [rehearsal, setRehearsal] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from('rehearsals')
      .select('*')
      .order('date', { ascending: true })
      .limit(1);

    setRehearsal(data?.[0]);
  };

  if (!rehearsal) return <div>Lade...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{rehearsal.title}</h2>
      <p>{rehearsal.date}</p>
    </div>
  );
}






'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { AdminLayout } from '@/components/layout/admin-layout';

import { MembersTable } from '@/features/members/members-table';
import { EventsTable } from '@/features/events/events-table';
import { FinanceWidget } from '@/features/finances/finance-widget';

export default function AdminPage() {
  return (
    <AuthGuard requireRole="board">

      <div className="p-6 space-y-8 max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            🎵 Admin Dashboard
          </h1>

          <LogoutButton />
        </div>

        {/* MEMBERS */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Mitglieder</h2>
          <MembersTable />
        </section>

        {/* EVENTS */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Events</h2>
          <EventsTable />
        </section>

        {/* FINANCES */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Finanzen</h2>
          <FinanceWidget />
        </section>

      </div>

    </AuthGuard>
  );
}
