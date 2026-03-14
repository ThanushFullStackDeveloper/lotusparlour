// Cache configuration and utilities for PWA
const CACHE_CONFIG = {
  services: { key: 'lotus_services', ttl: 24 * 60 * 60 * 1000 }, // 24 hours
  gallery: { key: 'lotus_gallery', ttl: 12 * 60 * 60 * 1000 },   // 12 hours
  videos: { key: 'lotus_videos', ttl: 24 * 60 * 60 * 1000 },     // 24 hours
  staff: { key: 'lotus_staff', ttl: 24 * 60 * 60 * 1000 },       // 24 hours
  settings: { key: 'lotus_settings', ttl: 1 * 60 * 60 * 1000 },  // 1 hour
  reviews: { key: 'lotus_reviews', ttl: 6 * 60 * 60 * 1000 },    // 6 hours
};

// Broadcast channel for cache invalidation across tabs/windows
let broadcastChannel = null;
try {
  broadcastChannel = new BroadcastChannel('lotus_cache_channel');
  broadcastChannel.onmessage = (event) => {
    if (event.data.type === 'INVALIDATE_CACHE') {
      const cacheType = event.data.cacheType;
      if (cacheType) {
        clearCache(cacheType).then(() => {
          window.dispatchEvent(new CustomEvent('cache-invalidated', { 
            detail: { type: cacheType } 
          }));
        });
      }
    }
  };
} catch (e) {
  console.log('BroadcastChannel not supported');
}

// Invalidate cache and notify all tabs/service worker
export const invalidateCache = async (cacheType) => {
  await clearCache(cacheType);
  
  // Notify other tabs via BroadcastChannel
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'INVALIDATE_CACHE', cacheType });
  }
  
  // Notify service worker to clear its cache
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'INVALIDATE_API_CACHE',
      cacheType
    });
  }
  
  // Dispatch local event
  window.dispatchEvent(new CustomEvent('cache-invalidated', { 
    detail: { type: cacheType } 
  }));
};

// IndexedDB setup for larger data (images, etc.)
const DB_NAME = 'LotusBeautyCache';
const DB_VERSION = 1;
const STORE_NAME = 'apiCache';

let dbInstance = null;

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

// Get data from IndexedDB
const getFromIndexedDB = async (key) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.warn('IndexedDB get error:', error);
    return null;
  }
};

// Save data to IndexedDB
const saveToIndexedDB = async (key, data, ttl) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        key,
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttl
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('IndexedDB save error:', error);
  }
};

// Check if cache is valid
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) return false;
  return Date.now() < cacheEntry.expiry;
};

// Get cached data with fallback to network
export const getCachedData = async (cacheType, fetchFn) => {
  const config = CACHE_CONFIG[cacheType];
  if (!config) {
    console.warn(`Unknown cache type: ${cacheType}`);
    return fetchFn();
  }

  try {
    // Try to get from cache first
    const cached = await getFromIndexedDB(config.key);
    
    if (isCacheValid(cached)) {
      // Return cached data immediately
      // Trigger background refresh if cache is more than 50% through its TTL
      const agePercent = (Date.now() - cached.timestamp) / config.ttl;
      if (agePercent > 0.5) {
        // Background refresh
        refreshInBackground(cacheType, fetchFn, config);
      }
      return { data: cached.data, fromCache: true };
    }

    // Cache miss or expired - fetch fresh data
    const freshData = await fetchFn();
    await saveToIndexedDB(config.key, freshData, config.ttl);
    return { data: freshData, fromCache: false };
    
  } catch (error) {
    // If network fails, try to return stale cache
    const staleCache = await getFromIndexedDB(config.key);
    if (staleCache?.data) {
      return { data: staleCache.data, fromCache: true, stale: true };
    }
    throw error;
  }
};

// Background refresh without blocking UI
const refreshInBackground = async (cacheType, fetchFn, config) => {
  try {
    const freshData = await fetchFn();
    await saveToIndexedDB(config.key, freshData, config.ttl);
    // Dispatch event to notify components of new data
    window.dispatchEvent(new CustomEvent('cache-updated', { 
      detail: { type: cacheType, data: freshData } 
    }));
  } catch (error) {
    console.warn(`Background refresh failed for ${cacheType}:`, error);
  }
};

// Force refresh cache
export const refreshCache = async (cacheType, fetchFn) => {
  const config = CACHE_CONFIG[cacheType];
  if (!config) return;

  try {
    const freshData = await fetchFn();
    await saveToIndexedDB(config.key, freshData, config.ttl);
    return freshData;
  } catch (error) {
    console.error(`Cache refresh failed for ${cacheType}:`, error);
    throw error;
  }
};

// Clear specific cache
export const clearCache = async (cacheType) => {
  const config = CACHE_CONFIG[cacheType];
  if (!config) return;

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(config.key);
      request.onsuccess = () => {
        console.log(`Cache cleared for ${cacheType}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
};

// Clear all cache
export const clearAllCache = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
  } catch (error) {
    console.warn('Cache clear all error:', error);
  }
};

// Get cache status for debugging
export const getCacheStatus = async () => {
  const status = {};
  for (const [type, config] of Object.entries(CACHE_CONFIG)) {
    const cached = await getFromIndexedDB(config.key);
    status[type] = {
      cached: !!cached,
      valid: isCacheValid(cached),
      age: cached ? Math.round((Date.now() - cached.timestamp) / 1000 / 60) + ' mins' : null,
      ttl: Math.round(config.ttl / 1000 / 60 / 60) + ' hours'
    };
  }
  return status;
};

export default {
  getCachedData,
  refreshCache,
  clearCache,
  clearAllCache,
  getCacheStatus,
  CACHE_CONFIG
};
