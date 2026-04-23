'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

/**
 * AuthGuard
 * → schützt komplette Seiten
 */
export function AuthGuard({
  children,
  requireRole = 'admin', // default
}: {
  children: ReactNode;
  requireRole?: 'admin' | 'board';
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // ❌ nicht eingeloggt
    if (!user) {
      router.replace('/');
      return;
    }

    // ❌ keine Berechtigung
    if (
      requireRole === 'admin' &&
      profile?.role !== 'admin'
    ) {
      router.replace('/');
    }

    if (
      requireRole === 'board' &&
      !['admin', 'board'].includes(profile?.role || '')
    ) {
      router.replace('/');
    }

  }, [user, profile, loading, router, requireRole]);

  // 🔥 verhindert UI-Flackern
  if (loading || !user) {
    return (
      <div className="p-6 text-center text-gray-500">
        🔐 Zugriff wird geprüft...
      </div>
    );
  }

  return <>{children}</>;
}
