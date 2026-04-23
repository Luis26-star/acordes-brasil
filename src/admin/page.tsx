'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { MembersTable } from '@/features/members/members-table';
import { EventsTable } from '@/features/events/events-table';
import { FinanceWidget } from '@/features/finances/finance-widget';

export default function AdminPage() {
  return (
    <AuthGuard requireRole="board">
      {/* 🔥 board + admin erlaubt */}

      <div className="p-6 space-y-8 max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold">
          🎵 Admin Dashboard
        </h1>

        <section>
          <h2 className="text-xl font-semibold mb-3">Mitglieder</h2>
          <MembersTable />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Events</h2>
          <EventsTable />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Finanzen</h2>
          <FinanceWidget />
        </section>

      </div>
    </AuthGuard>
  );
}
