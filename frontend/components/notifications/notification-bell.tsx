"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { api, WS_URL } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { notifications, unread, setNotifications, pushToast } = useNotificationStore();

  useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const items = await api.notifications(token!);
      setNotifications(items);
      return items;
    },
    enabled: Boolean(token)
  });

  useEffect(() => {
    if (!user) return;
    const socket = new WebSocket(`${WS_URL}/ws/notifications/${user.id}`);
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      pushToast({ title: payload.title, message: payload.message, type: payload.type ?? "info" });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };
    return () => socket.close();
  }, [pushToast, queryClient, user]);

  if (!token) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-12 w-12 place-items-center rounded-full border border-bio-cyan/30 bg-white/5 text-bio-cyan transition hover:rotate-12 hover:border-bio-cyan hover:shadow-neon"
      >
        <Bell className="h-5 w-5" />
        {unread ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-bio-danger px-1 font-mono text-[10px] text-white">
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="glass-panel absolute right-0 mt-3 w-80 rounded-2xl p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-sm font-bold text-bio-ice">Notifications</p>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-bio-cyan"
              onClick={async () => {
                await api.readNotifications(token);
                queryClient.invalidateQueries({ queryKey: ["notifications"] });
              }}
            >
              <CheckCheck className="h-3 w-3" />
              Read all
            </button>
          </div>
          <div className="max-h-80 space-y-2 overflow-auto pr-1">
            {notifications.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-xl border border-bio-cyan/10 bg-black/20 p-3">
                <p className="text-sm font-semibold text-bio-ice">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-bio-muted">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
