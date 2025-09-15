import { HistoryRecord } from '../types';

const DB_NAME = 'ImageStudioHistoryDB';
const STORE_NAME = 'generations';
const METADATA_STORE_NAME = 'metadata';
const DB_VERSION = 3; // Incremented version for new index

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(new Error('Failed to open IndexedDB.'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      let store;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        store = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      } else {
        store = (event.target as any).transaction.objectStore(STORE_NAME);
      }

      if (!store.indexNames.contains('sourceImage')) {
        store.createIndex('sourceImage', 'sourceImage', { unique: false });
      }

      if (!dbInstance.objectStoreNames.contains(METADATA_STORE_NAME)) {
        dbInstance.createObjectStore(METADATA_STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

export const addHistory = async (item: HistoryRecord): Promise<void> => {
  const dbInstance = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Failed to add history item:', request.error);
      reject(new Error('Could not save history item.'));
    };
  });
};

export const getAllHistory = async (): Promise<HistoryRecord[]> => {
  const dbInstance = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll();

    request.onsuccess = () => {
      // Sort descending (newest first)
      resolve(request.result.reverse());
    };

    request.onerror = () => {
      console.error('Failed to get history:', request.error);
      reject(new Error('Could not retrieve history.'));
    };
  });
};

export const findHistoryBySourceImage = async (sourceImage: string): Promise<HistoryRecord | null> => {
    const dbInstance = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('sourceImage');
        const request = index.getAll(sourceImage);

        request.onsuccess = () => {
            const results = request.result;
            if (results && results.length > 0) {
                // Find the one that is a parent itself (no parentId)
                const parent = results.find(r => !r.parentId);
                if (parent) {
                    resolve(parent);
                } else {
                    // Fallback to the oldest if no explicit parent found
                    results.sort((a, b) => a.timestamp - b.timestamp);
                    resolve(results[0]);
                }
            } else {
                resolve(null);
            }
        };

        request.onerror = () => {
            console.error('Failed to find history by source image:', request.error);
            reject(new Error('Could not find history by source image.'));
        };
    });
};

export const removeHistoryItem = async (id: string): Promise<void> => {
    const dbInstance = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Failed to remove history item:', request.error);
            reject(new Error('Could not remove history item.'));
        };
    });
};

export const clearHistory = async (): Promise<void> => {
  const dbInstance = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Failed to clear history:', request.error);
      reject(new Error('Could not clear history.'));
    };
  });
};

const getMetadata = async <T>(key: string): Promise<T | null> => {
    const dbInstance = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(METADATA_STORE_NAME, 'readonly');
        const store = transaction.objectStore(METADATA_STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
            resolve(request.result ? request.result.value : null);
        };
        request.onerror = () => {
            console.error(`Failed to get metadata for key: ${key}`, request.error);
            reject(new Error(`Could not retrieve metadata for key: ${key}.`));
        };
    });
};

const setMetadata = async (key: string, value: any): Promise<void> => {
    const dbInstance = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(METADATA_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(METADATA_STORE_NAME);
        const request = store.put({ key, value });

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error(`Failed to set metadata for key: ${key}`, request.error);
            reject(new Error(`Could not save metadata for key: ${key}.`));
        };
    });
};


export const getTags = async (): Promise<string[]> => {
    return (await getMetadata<string[]>('allTags')) || [];
};

export const saveTags = async (tags: string[]): Promise<void> => {
    await setMetadata('allTags', tags);
};