'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationContainer } from '@shared/components/Notification';
import type { NotificationData, NotificationType } from '@shared/components/Notification';

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'info', duration = 3000) => {
      const id = `${Date.now()}-${Math.random()}`;
      const notification: NotificationData = {
        id,
        type,
        message,
        duration,
      };

      setNotifications((prev) => [...prev, notification]);
    },
    []
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'success', duration);
    },
    [showNotification]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'error', duration);
    },
    [showNotification]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'info', duration);
    },
    [showNotification]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'warning', duration);
    },
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{ showNotification, success, error, info, warning }}
    >
      {children}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
