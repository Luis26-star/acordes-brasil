'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

/**
 * Logout Button
 * → globale UI-Komponente
 */
export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  return (
    <button
      onClick={logout}
      className="text-sm text-gray-600 hover:text-black"
      aria-label="Abmelden"
    >
      Abmelden
    </button>
  );
}
