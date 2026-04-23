'use client';

import { useState } from 'react';

const navItems = [
  { id: 'members', label: 'Mitglieder', icon: '👥' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'finances', label: 'Finanzen', icon: '💰' },
];

export function Sidebar({ active, setActive }: any) {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4 hidden md:block">

      <h2 className="text-xl font-bold mb-6">
        🎵 Acordes
      </h2>

      <nav className="space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full text-left px-3 py-2 rounded-lg transition ${
              active === item.id
                ? 'bg-green-600'
                : 'hover:bg-gray-800'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
