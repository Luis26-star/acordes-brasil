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


