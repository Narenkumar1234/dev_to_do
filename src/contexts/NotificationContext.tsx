import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/Notification';

interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'sync';
  message: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (type: NotificationData['type'], message: string, duration?: number) => void;
  showSyncNotification: (message: string) => void;
  showSuccessNotification: (message: string) => void;
  showErrorNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((type: NotificationData['type'], message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: NotificationData = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);
  }, []);

  const showSyncNotification = useCallback((message: string) => {
    showNotification('sync', message, 3000);
  }, [showNotification]);

  const showSuccessNotification = useCallback((message: string) => {
    showNotification('success', message, 4000);
  }, [showNotification]);

  const showErrorNotification = useCallback((message: string) => {
    showNotification('error', message, 6000);
  }, [showNotification]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const value: NotificationContextType = {
    showNotification,
    showSyncNotification,
    showSuccessNotification,
    showErrorNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
