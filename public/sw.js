/* =========================================================
   SERVICE WORKER – SUPABASE SYNC FINAL
========================================================= */

const DB_NAME = 'choir-db';
const STORE = 'queue';

/* =========================================================
   SYNC EVENT
========================================================= */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-supabase') {
    event.waitUntil(processQueue());
  }
});


/* =========================================================
   PROCESS QUEUE
========================================================= */
async function processQueue() {
  const db = await openDB();

  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);

  const all = await store.getAll();

  for (const item of all) {
    try {
      // 👉 Supabase REST API (wichtig!)
      await fetch(`${self.location.origin}/rest/v1/${item.table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '<SUPABASE_ANON_KEY>',
          'Authorization': 'Bearer <SUPABASE_ANON_KEY>'
        },
        body: JSON.stringify(item.payload)
      });

      store.delete(item.id);

    } catch (err) {
      console.error('❌ Sync fehlgeschlagen', err);
    }
  }
}


/* =========================================================
   DB
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
