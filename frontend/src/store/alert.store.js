import { create } from 'zustand';

export const useAlertStore = create((set) => ({
  alerts: [],
  unreadCount: 0,
  setAlerts: (alerts) => set({ alerts }),
  setUnreadCount: (n) => set({ unreadCount: n }),
  addAlert: (alert) =>
    set((s) => ({ alerts: [alert, ...s.alerts].slice(0, 50), unreadCount: s.unreadCount + 1 })),
  markRead: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a._id === id ? { ...a, read: true } : a)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  markAllRead: () =>
    set((s) => ({ alerts: s.alerts.map((a) => ({ ...a, read: true })), unreadCount: 0 })),
}));
