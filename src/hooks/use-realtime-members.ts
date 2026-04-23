'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Realtime Sync für Members
 * → hört auf DB Changes
 */
export function useRealtimeMembers(setMembers: any) {
  useEffect(() => {
    const channel = supabase
      .channel('members-realtime')

      // INSERT
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          setMembers((prev: any[]) => [payload.new, ...prev]);
        }
      )

      // UPDATE
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          setMembers((prev: any[]) =>
            prev.map(m => m.id === payload.new.id ? payload.new : m)
          );
        }
      )

      // DELETE
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'profiles' },
        (payload) => {
          setMembers((prev: any[]) =>
            prev.filter(m => m.id !== payload.old.id)
          );
        }
      )

      .subscribe();

    // Cleanup (EXTREM wichtig)
    return () => {
      supabase.removeChannel(channel);
    };
  }, [setMembers]);
}
