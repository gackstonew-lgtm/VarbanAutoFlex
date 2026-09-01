// Persistent IndexedDB Image Store for Vehicle Inventory
const DB_NAME = 'YardlyAutomotiveImageDB_v1';
const STORE_NAME = 'vehicle_image_blobs';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persists an image string (Data URL / Base64 / Blob) into IndexedDB
 */
export async function saveVehicleImageToIndexedDB(imageId: string, imageData: string): Promise<string> {
  if (!imageData || !imageData.startsWith('data:')) {
    return imageData;
  }
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(imageData, imageId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return imageData;
  } catch (err) {
    console.warn('IndexedDB write notice:', err);
    return imageData;
  }
}

/**
 * Retrieves a persisted image string from IndexedDB
 */
export async function getVehicleImageFromIndexedDB(imageId: string): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(imageId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Retrieves all stored vehicle image blobs from IndexedDB
 */
export async function getAllVehicleImagesFromIndexedDB(): Promise<Record<string, string>> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const result: Record<string, string> = {};
      const req = store.openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          result[cursor.key as string] = cursor.value as string;
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}
