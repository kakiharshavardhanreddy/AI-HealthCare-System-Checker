"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Ban, Search, ShieldAlert, UserRound, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button3D } from "@/components/design/button-3d";
import { GlassCard } from "@/components/design/glass-card";
import { Skeleton } from "@/components/design/loading";
import { StatCard } from "@/components/design/stat-card";
import { HealthGlobeWidget } from "@/components/three/fallback-scenes";
import { api, WS_URL } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";

export function AdminClient() {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pushToast = useNotificationStore((state) => state.pushToast);
  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: () => api.adminOverview(token!), enabled: Boolean(token) });
  const users = useQuery({ queryKey: ["admin-users", search], queryFn: () => api.adminUsers(token!, search), enabled: Boolean(token) });

  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}/ws/admin/activity`);
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      pushToast({ title: payload.title, message: payload.message, type: payload.type ?? "info" });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    };
    return () => socket.close();
  }, [pushToast, queryClient]);

  const pagedUsers = useMemo(() => (users.data ?? []).slice((page - 1) * 8, page * 8), [page, users.data]);
  const totalPages = Math.max(Math.ceil((users.data?.length ?? 0) / 8), 1);

  if (overview.isLoading) {
    return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36" />)}</div>;
  }

  const data = overview.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users className="h-6 w-6" />} label="Users" value={data?.users ?? 0} trend={8.4} />
        <StatCard icon={<Activity className="h-6 w-6" />} label="Assessments" value={data?.assessments ?? 0} trend={12.1} />
        <StatCard icon={<ShieldAlert className="h-6 w-6" />} label="High Risk Alerts" value={data?.high_risk_alerts ?? 0} trend={-2.6} />
        <StatCard icon={<UserRound className="h-6 w-6" />} label="Prescription Scans" value={data?.scans ?? 0} trend={5.2} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <GlassCard hover={false}>
          <h2 className="font-display text-2xl font-bold text-bio-ice">User Distribution</h2>
          <HealthGlobeWidget />
          <div className="space-y-2">
            {data?.user_distribution.map((item) => (
              <div key={item.region} className="flex justify-between rounded-xl border border-bio-cyan/10 bg-black/20 p-3 text-sm">
                <span className="text-bio-muted">{item.region}</span>
                <span className="font-mono text-bio-cyan">{item.users}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h2 className="font-display text-2xl font-bold text-bio-ice">Users</h2>
            <label className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bio-cyan" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." className="h-11 w-full rounded-xl border border-bio-cyan/20 bg-black/40 pl-11 pr-4 outline-none" />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-separate border-spacing-y-2 text-left">
              <thead className="text-xs uppercase tracking-[0.14em] text-bio-cyan">
                <tr>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map((user) => (
                  <tr key={user.id} className="bg-black/25 transition hover:bg-bio-cyan/10">
                    <td className="rounded-l-xl px-4 py-3">
                      <p className="font-semibold text-bio-ice">{user.full_name}</p>
                      <p className="text-sm text-bio-muted">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-bio-muted">{user.role}</td>
                    <td className="px-4 py-3">
                      <span className={user.is_active ? "text-bio-success" : "text-bio-danger"}>{user.is_active ? "Active" : "Suspended"}</span>
                    </td>
                    <td className="px-4 py-3 text-bio-muted">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="rounded-r-xl px-4 py-3 text-right">
                      <Button3D
                        variant="secondary"
                        className="min-h-9 px-3 py-1 text-xs"
                        onClick={async () => {
                          await api.suspendUser(token!, user.id);
                          queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                        }}
                      >
                        <Ban className="h-3 w-3" />
                        Toggle
                      </Button3D>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button3D variant="secondary" className="min-h-9 px-4 py-1 text-xs" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Prev</Button3D>
            <span className="font-mono text-sm text-bio-muted">{page}/{totalPages}</span>
            <Button3D variant="secondary" className="min-h-9 px-4 py-1 text-xs" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button3D>
          </div>
        </GlassCard>
      </div>

      <GlassCard hover={false}>
        <h2 className="font-display text-2xl font-bold text-bio-ice">Real-Time Activity</h2>
        <div className="mt-5 space-y-3">
          {data?.activity.map((item, index) => (
            <div key={`${item.title}-${index}`} className="rounded-xl border border-bio-cyan/10 bg-black/20 p-4">
              <p className="font-semibold text-bio-ice">{item.title}</p>
              <p className="mt-1 text-sm text-bio-muted">{item.message}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
