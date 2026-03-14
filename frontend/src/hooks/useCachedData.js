import { useState, useEffect, useCallback, useContext } from 'react';
import { getCachedData, refreshCache, clearCache } from '../utils/cacheManager';
import WebSocketContext from '../contexts/WebSocketContext';

/**
 * Custom hook for cached data fetching
 * Shows cached data immediately, then fetches fresh data
 */
export const useCachedData = (cacheType, fetchFn, dependencies = []) => {
  // Try to get localStorage cache immediately
  const getLocalCache = () => {
    try {
      const cached = localStorage.getItem(`cached_${cacheType}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const [data, setData] = useState(getLocalCache);
  const [loading, setLoading] = useState(!getLocalCache());
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(!!getLocalCache());
  const [isStale, setIsStale] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const wsContext = useContext(WebSocketContext);
  const lastUpdate = wsContext?.lastUpdate;

  const stableFetchFn = useCallback(fetchFn, dependencies);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const freshData = await stableFetchFn();
      setData(freshData);
      setFromCache(false);
      setIsStale(false);
      // Save to localStorage
      localStorage.setItem(`cached_${cacheType}`, JSON.stringify(freshData));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [cacheType, stableFetchFn]);

  // Listen for WebSocket updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.entity === cacheType && lastUpdate.timestamp) {
      refresh();
    }
  }, [lastUpdate?.timestamp, cacheType, refresh]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // If we have cached data, don't show loading
        if (!data) {
          setLoading(true);
        }
        
        const freshData = await stableFetchFn();
        
        if (isMounted) {
          setData(freshData);
          setFromCache(false);
          setIsStale(false);
          setLoading(false);
          // Save to localStorage
          localStorage.setItem(`cached_${cacheType}`, JSON.stringify(freshData));
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    loadData();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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
