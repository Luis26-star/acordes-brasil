/* =========================================================
   OFFLINE MODULE – SUPABASE QUEUE (FINAL)
========================================================= */

const DB_NAME = 'choir-db';
const STORE = 'queue';

export async function supabaseInsertOrQueue(app, table, payload) {
  if (navigator.onLine && app.supabase) {
    const { error } = await app.supabase
      .from(table)
      .insert(payload);

    if (error) throw error;
    return;
  }

  const db = await openDB();

  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);

  await store.add({
    id: Date.now(),
    type: 'insert',
    table,
    payload
  });

  const reg = await navigator.serviceWorker.ready;
  await reg.sync.register('sync-supabase');

  console.info('📡 Offline gespeichert → Sync folgt');
}


/* =========================================================
   DB INIT
========================================================= */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
