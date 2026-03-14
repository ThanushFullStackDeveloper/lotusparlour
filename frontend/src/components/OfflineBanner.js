import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineBanner = ({ isOffline, isStale, onRefresh }) => {
  if (!isOffline && !isStale) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] safe-area-top"
        data-testid="offline-banner"
      >
        <div className={`px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium ${
          isOffline 
            ? 'bg-gray-800 text-white' 
            : 'bg-yellow-500 text-yellow-900'
        }`}>
          {isOffline ? (
            <>
              <WifiOff size={16} />
              <span>You're offline. Viewing cached data.</span>
            </>
          ) : (
            <>
              <span>Viewing cached data.</span>
              {onRefresh && (
                <button 
                  onClick={onRefresh}
                  className="flex items-center gap-1 underline hover:no-underline"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineBanner;
