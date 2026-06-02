"use client";

import { create } from "zustand";

import type { NotificationItem } from "@/lib/types";

type Toast = Pick<NotificationItem, "title" | "message" | "type"> & { id: string };

type NotificationState = {
  notifications: NotificationItem[];
  toasts: Toast[];
  unread: number;
  setNotifications: (items: NotificationItem[]) => void;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  toasts: [],
  unread: 0,
  setNotifications: (items) => set({ notifications: items, unread: items.filter((item) => !item.is_read).length }),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }].slice(-4),
      unread: state.unread + 1
    })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }))
}));
