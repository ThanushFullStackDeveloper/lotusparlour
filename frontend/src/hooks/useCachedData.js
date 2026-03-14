import { useState, useEffect, useCallback } from 'react';
import { getCachedData, refreshCache } from '../utils/cacheManager';

/**
 * Custom hook for cached data fetching
 * Implements cache-first strategy with background updates
 */
export const useCachedData = (cacheType, fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Stable fetch function reference
  const stableFetchFn = useCallback(fetchFn, dependencies);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getCachedData(cacheType, stableFetchFn);
        
        if (isMounted) {
          setData(result.data);
          setFromCache(result.fromCache);
          setIsStale(result.stale || false);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    loadData();

    // Listen for cache updates from background refresh
    const handleCacheUpdate = (event) => {
      if (event.detail.type === cacheType && isMounted) {
        setData(event.detail.data);
        setFromCache(false);
        setIsStale(false);
      }
    };

    window.addEventListener('cache-updated', handleCacheUpdate);

    // Listen for online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      window.removeEventListener('cache-updated', handleCacheUpdate);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [cacheType, stableFetchFn]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const freshData = await refreshCache(cacheType, stableFetchFn);
      setData(freshData);
      setFromCache(false);
      setIsStale(false);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, [cacheType, stableFetchFn]);

  return {
    data,
    loading,
    error,
    fromCache,
    isStale,
    isOffline,
    refresh
  };
};

/**
 * Hook for detecting online/offline status
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useCachedData;
