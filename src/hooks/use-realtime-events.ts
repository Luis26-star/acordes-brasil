'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRealtimeEvents } from '@/hooks/use-realtime-events';

useRealtimeEvents(setEvents);

export function useRealtimeEvents(setEvents: any) {
  useEffect(() => {
    const channel = supabase
      .channel('events-realtime')

      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          setEvents((prev: any[]) => {
            switch (payload.eventType) {
              case 'INSERT':
                return [payload.new, ...prev];

              case 'UPDATE':
                return prev.map(e =>
                  e.id === payload.new.id ? payload.new : e
                );

              case 'DELETE':
                return prev.filter(e => e.id !== payload.old.id);

              default:
                return prev;
            }
          });
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setEvents]);
}
