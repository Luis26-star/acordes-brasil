/* =========================================================
   OFFLINE MODULE – FINAL (SENIOR LEVEL)
========================================================= */

const DB_NAME = 'choir-db';
const STORE_NAME = 'queue';

export async function sendOrQueue(url, body) {
  if (navigator.onLine) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  const db = await openDB();

  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  await store.add({
    id: Date.now(),
    url,
    method: 'POST',
    body
  });

  const reg = await navigator.serviceWorker.ready;
  await reg.sync.register('sync-rehearsals');

  console.info('📡 Offline gespeichert → wird später gesendet');
}


/* =========================================================
   DB INIT (ROBUST!)
========================================================= */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
