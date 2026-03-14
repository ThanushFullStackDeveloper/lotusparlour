import React, { createContext, useContext, useCallback, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import { toast } from 'sonner';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [lastUpdate, setLastUpdate] = useState(null);

  const handleUpdate = useCallback((data) => {
    console.log('Received update:', data);
    setLastUpdate({
      ...data,
      timestamp: Date.now()
    });

    // Show toast notification for updates
    const entityNames = {
      services: 'Services',
      staff: 'Staff',
      gallery: 'Gallery',
      videos: 'Videos',
      settings: 'Settings'
    };

    const entityName = entityNames[data.entity] || data.entity;
    toast.info(`${entityName} updated! Refreshing...`, {
      duration: 2000,
    });
  }, []);

  const { isConnected } = useWebSocket(handleUpdate);

  return (
    <WebSocketContext.Provider value={{ lastUpdate, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
