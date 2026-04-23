'use client';

import { LogoutButton } from '@/components/ui/logout-button';

export function Header({ title }: { title: string }) {
  return (
    <div className="flex justify-between items-center border-b pb-3 mb-4">

      <h1 className="text-2xl font-semibold">
        {title}
      </h1>

      <LogoutButton />

    </div>
  );
}
