// App-icon badge (Badging API) for installed PWAs, incl. iOS 16.4+.
//
// iOS does NOT badge a PWA icon automatically from a push — it must be set
// explicitly with navigator.setAppBadge(). The window is the source of truth
// (unread count from the DB); the service worker increments the SAME persisted
// counter when a push arrives while the app is closed. Both sides read/write
// IndexedDB key 'gc-badge' so they stay in agreement.

const DB_NAME = 'gc-badge';
const STORE = 'kv';
const KEY = 'count';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function writeCount(value: number): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/**
 * Set the app-icon badge to `count` (clears it at 0) and persist that value so
 * the service worker keeps counting from the right number. Safe no-op on
 * platforms without the Badging API.
 */
export async function syncAppBadge(count: number): Promise<void> {
  const n = Math.max(0, Math.floor(count || 0));
  try { await writeCount(n); } catch { /* IndexedDB unavailable — ignore */ }
  try {
    const nav = navigator as unknown as {
      setAppBadge?: (n?: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    if (typeof nav.setAppBadge === 'function') {
      if (n > 0) await nav.setAppBadge(n);
      else if (typeof nav.clearAppBadge === 'function') await nav.clearAppBadge();
    }
  } catch { /* badging unsupported — ignore */ }
}
