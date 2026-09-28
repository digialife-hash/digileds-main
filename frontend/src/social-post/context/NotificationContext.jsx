import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addNotification,
  getNotifications,
  NOTIFICATIONS_CHANGED_EVENT,
  saveNotifications,
} from "../utils/notifications.js";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(getNotifications);

  const refresh = useCallback(() => setNotifications(getNotifications()), []);

  useEffect(() => {
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const markAsRead = useCallback((id) => {
    const next = getNotifications().map((item) => item.id === id ? { ...item, read: true } : item);
    saveNotifications(next);
  }, []);

  const markAllAsRead = useCallback(() => {
    saveNotifications(getNotifications().map((item) => ({ ...item, read: true })));
  }, []);

  const removeNotification = useCallback((id) => {
    saveNotifications(getNotifications().filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => saveNotifications([]), []);

  const value = useMemo(() => ({
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  }), [notifications, markAsRead, markAllAsRead, removeNotification, clearAll]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}
