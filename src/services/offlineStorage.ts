/**
 * Offline Storage Manager
 * Handles storing survey responses and data when offline
 * Uses IndexedDB for large storage capacity and localStorage as fallback
 */

interface StoredResponse {
  id: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

const DB_NAME = 'ARTA_CSS_DB';
const DB_VERSION = 1;
const STORE_NAMES = {
  responses: 'pending_responses',
  cache: 'offline_cache'
};

/**
 * Initialize IndexedDB
 */
export async function initializeDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORE_NAMES.responses)) {
        const responseStore = db.createObjectStore(STORE_NAMES.responses, { keyPath: 'id', autoIncrement: true });
        responseStore.createIndex('timestamp', 'timestamp', { unique: false });
        responseStore.createIndex('synced', 'synced', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.cache)) {
        db.createObjectStore(STORE_NAMES.cache, { keyPath: 'url' });
      }
    };
  });
}

/**
 * Save a survey response for offline persistence
 */
export async function saveOfflineResponse(responseData: any): Promise<void> {
  try {
    // Try IndexedDB first
    if ('indexedDB' in window) {
      const db = await initializeDatabase();
      const transaction = db.transaction([STORE_NAMES.responses], 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.responses);

      const storedResponse: StoredResponse = {
        id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data: responseData,
        timestamp: Date.now(),
        synced: false
      };

      return new Promise((resolve, reject) => {
        const request = store.add(storedResponse);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          console.log('✅ Response saved to IndexedDB:', storedResponse.id);
          resolve();
        };
      });
    }
  } catch (error) {
    console.warn('IndexedDB not available, trying localStorage:', error);
    // Fallback to localStorage
    saveToLocalStorage(responseData);
  }
}

/**
 * Get all pending responses (not yet synced)
 */
export async function getPendingResponses(): Promise<StoredResponse[]> {
  try {
    if ('indexedDB' in window) {
      const db = await initializeDatabase();
      const transaction = db.transaction([STORE_NAMES.responses], 'readonly');
      const store = transaction.objectStore(STORE_NAMES.responses);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          // Filter for unsynced responses
          const allResponses = request.result as StoredResponse[];
          const pending = allResponses.filter(r => !r.synced);
          console.log('📋 Found pending responses:', pending.length);
          resolve(pending);
        };
      });
    }
  } catch (error) {
    console.warn('Error getting pending responses from IndexedDB:', error);
    // Fallback to localStorage
    return getFromLocalStorage();
  }

  return [];
}

/**
 * Mark a response as synced
 */
export async function markResponseAsSynced(id: string): Promise<void> {
  try {
    if ('indexedDB' in window) {
      const db = await initializeDatabase();
      const transaction = db.transaction([STORE_NAMES.responses], 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.responses);

      return new Promise((resolve, reject) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const response = getRequest.result;
          if (response) {
            response.synced = true;
            const updateRequest = store.put(response);
            updateRequest.onsuccess = () => {
              console.log('✔️ Response marked as synced:', id);
              resolve();
            };
            updateRequest.onerror = () => reject(updateRequest.error);
          } else {
            resolve();
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    }
  } catch (error) {
    console.warn('Error marking response as synced:', error);
  }
}

/**
 * Delete a response after successful sync
 */
export async function deleteResponse(id: string): Promise<void> {
  try {
    if ('indexedDB' in window) {
      const db = await initializeDatabase();
      const transaction = db.transaction([STORE_NAMES.responses], 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.responses);

      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
          console.log('🗑️ Response deleted:', id);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    }
  } catch (error) {
    console.warn('Error deleting response:', error);
  }
}

/**
 * Clear all offline data
 */
export async function clearOfflineData(): Promise<void> {
  try {
    if ('indexedDB' in window) {
      const db = await initializeDatabase();
      const transaction = db.transaction([STORE_NAMES.responses], 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.responses);

      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => {
          console.log('🧹 All offline data cleared');
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    }
  } catch (error) {
    console.warn('Error clearing offline data:', error);
  }
}

/**
 * Get storage status and quota
 */
export async function getStorageStatus(): Promise<{ usage: number; quota: number }> {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
  } catch (error) {
    console.warn('Error getting storage status:', error);
  }

  return { usage: 0, quota: 0 };
}

/**
 * Request persistent storage permission
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const isPersistent = await navigator.storage.persist();
      if (isPersistent) {
        console.log('✅ Persistent storage granted');
      } else {
        console.log('⚠️ Persistent storage denied');
      }
      return isPersistent;
    }
  } catch (error) {
    console.warn('Error requesting persistent storage:', error);
  }

  return false;
}

/**
 * LocalStorage fallback functions
 */
const LS_KEY = 'ARTA_PENDING_RESPONSES';

function saveToLocalStorage(responseData: any): void {
  try {
    const existing = localStorage.getItem(LS_KEY);
    const responses = existing ? JSON.parse(existing) : [];
    
    const storedResponse = {
      id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: responseData,
      timestamp: Date.now(),
      synced: false
    };

    responses.push(storedResponse);
    localStorage.setItem(LS_KEY, JSON.stringify(responses));
    console.log('✅ Response saved to localStorage:', storedResponse.id);
  } catch (error) {
    console.error('❌ Error saving to localStorage:', error);
  }
}

function getFromLocalStorage(): StoredResponse[] {
  try {
    const existing = localStorage.getItem(LS_KEY);
    if (!existing) return [];
    
    const responses = JSON.parse(existing);
    const pending = responses.filter((r: StoredResponse) => !r.synced);
    console.log('📋 Found pending responses in localStorage:', pending.length);
    return pending;
  } catch (error) {
    console.error('❌ Error reading from localStorage:', error);
    return [];
  }
}
