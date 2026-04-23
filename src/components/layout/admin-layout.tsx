'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

import { MembersTable } from '@/features/members/members-table';
import { EventsTable } from '@/features/events/events-table';
import { FinanceWidget } from '@/features/finances/finance-widget';

export function AdminLayout() {
  const [active, setActive] = useState('members');

  function renderContent() {
    switch (active) {
      case 'members':
        return <MembersTable />;
      case 'events':
        return <EventsTable />;
      case 'finances':
        return <FinanceWidget />;
      default:
        return null;
    }
  }

  function getTitle() {
    switch (active) {
      case 'members': return 'Mitglieder';
      case 'events': return 'Events';
      case 'finances': return 'Finanzen';
      default: return '';
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">

      {/* SIDEBAR */}
      <Sidebar active={active} setActive={setActive} />

      {/* MAIN */}
      <main className="flex-1 p-6 overflow-auto">

        <Header title={getTitle()} />

        {renderContent()}

      </main>
    </div>
  );
}
