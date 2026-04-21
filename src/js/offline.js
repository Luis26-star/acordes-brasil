/* =========================================================
   OFFLINE MODULE – SENIOR LEVEL
========================================================= */

export async function sendOrQueue(url, body) {
  if (navigator.onLine) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  const db = await openDB();

  const tx = db.transaction('queue', 'readwrite');
  const store = tx.objectStore('queue');

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
   DB (robust)
========================================================= */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('choir-db', 1);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
