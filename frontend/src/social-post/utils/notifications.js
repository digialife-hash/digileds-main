export const NOTIFICATIONS_STORAGE_KEY = "socialpost_notifications";
export const NOTIFICATIONS_CHANGED_EVENT = "socialpost-notifications-changed";

export function getNotifications() {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifications) {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export function addNotification(notification) {
  const notifications = getNotifications();
  const next = {
    id: notification.id || `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...notification,
  };
  saveNotifications([next, ...notifications.filter((item) => item.id !== next.id)].slice(0, 100));
  return next;
}
