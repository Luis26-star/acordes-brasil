'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function FinanceWidget() {
  const [data, setData] = useState({ paid: 0, pending: 0 });

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('feepayments')
        .select('amount, status');

      const paid = data.filter(x => x.status === 'paid')
        .reduce((s, x) => s + x.amount, 0);

      const pending = data.filter(x => x.status === 'pending')
        .reduce((s, x) => s + x.amount, 0);

      setData({ paid, pending });
    }

    load();
  }, []);

  return (
    <div className="flex gap-6">
      <div className="p-4 bg-green-100 rounded-lg">
        Bezahlt: {data.paid} €
      </div>

      <div className="p-4 bg-yellow-100 rounded-lg">
        Offen: {data.pending} €
      </div>
    </div>
  );
}
