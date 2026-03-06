import { useCallback } from 'react';

/**
 * Hook for offline storage using IndexedDB.
 *
 * Stores encodings locally so the app works without network.
 * Implements the three-layer pattern:
 *   1. React state (instant UI)
 *   2. IndexedDB (durable, survives refresh)
 *   3. Sync queue (retry when online)
 */

const DB_NAME = 'gle-app';
const DB_VERSION = 1;
const ENCODINGS_STORE = 'encodings';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(ENCODINGS_STORE)) {
        db.createObjectStore(ENCODINGS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function useOfflineStorage() {
  const saveEncoding = useCallback(async (encoding, metadata = {}) => {
    const db = await openDB();
    const tx = db.transaction(ENCODINGS_STORE, 'readwrite');
    tx.objectStore(ENCODINGS_STORE).add({
      encoding: Array.from(encoding),
      timestamp: Date.now(),
      label: metadata?.label || '',
      source: metadata?.source || '',
    });
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }, []);

  const getEncodings = useCallback(async () => {
    const db = await openDB();
    const tx = db.transaction(ENCODINGS_STORE, 'readonly');
    const req = tx.objectStore(ENCODINGS_STORE).getAll();
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        const records = (req.result || []).filter(
          r => Array.isArray(r.encoding) && typeof r.timestamp === 'number'
        );
        resolve(records);
      };
      req.onerror = () => reject(req.error);
    });
  }, []);

  const clearEncodings = useCallback(async () => {
    const db = await openDB();
    const tx = db.transaction(ENCODINGS_STORE, 'readwrite');
    tx.objectStore(ENCODINGS_STORE).clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }, []);

  return { saveEncoding, getEncodings, clearEncodings };
}
