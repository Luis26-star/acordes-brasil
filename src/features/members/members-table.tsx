'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

async function load() {
  addLog('1️⃣ RAW FETCH START');

  try {
    const res = await fetch(
      'https://XXXX.supabase.co/rest/v1/profiles',
      {
        headers: {
          apikey: 'XXXX',
          Authorization: 'Bearer XXXX',
        },
      }
    );

    addLog('2️⃣ RESPONSE STATUS: ' + res.status);

    const data = await res.json();

    addLog('3️⃣ DATA: ' + JSON.stringify(data));
  } catch (err: any) {
    addLog('🔥 ERROR: ' + err.message);
  } finally {
    addLog('4️⃣ DONE');
    setLoading(false);
  }
}
export default function MembersTable() {
  const [log, setLog] = useState<string[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev, msg]);
  };

  useEffect(() => {
    load();
  }, []);

  async function load() {
    addLog('1️⃣ load gestartet');

    try {
      setLoading(true);

      addLog('2️⃣ supabase request startet');

      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      addLog('3️⃣ supabase antwort erhalten');

      if (error) {
        addLog('❌ ERROR: ' + error.message);
        throw error;
      }

      addLog('4️⃣ data: ' + JSON.stringify(data));

      setMembers(data || []);
    } catch (err: any) {
      addLog('🔥 CATCH: ' + err.message);
    } finally {
      addLog('5️⃣ finally reached');
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>DEBUG MEMBERS</h2>

      <div style={{ marginBottom: 20 }}>
        <strong>Status:</strong> {loading ? 'Loading...' : 'Done'}
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Members:</strong>
        <pre>{JSON.stringify(members, null, 2)}</pre>
      </div>

      <div>
        <strong>Log:</strong>
        <pre>{log.join('\n')}</pre>
      </div>
    </div>
  );
}
