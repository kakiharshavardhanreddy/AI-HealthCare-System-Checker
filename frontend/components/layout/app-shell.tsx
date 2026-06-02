"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, ClipboardList, History, LayoutDashboard, LogOut, Menu, ScanLine, Shield, Stethoscope, UserRound, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Button3D } from "@/components/design/button-3d";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { cn, initials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessment", label: "Assessment", icon: ClipboardList },
  { href: "/history", label: "History", icon: History },
  { href: "/scanner", label: "Scanner", icon: ScanLine }
];

export function AppShell({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!isAuthenticated) router.replace("/login");
      if (adminOnly && user?.role !== "admin") router.replace("/dashboard");
    }, 120);
    return () => window.clearTimeout(timer);
  }, [adminOnly, isAuthenticated, router, user?.role]);

  if (!isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="font-display text-xl text-bio-ice">Authorizing secure session...</p>
        </div>
      </main>
    );
  }

  const items = user.role === "admin" ? [...nav, { href: "/admin", label: "Admin", icon: Shield }] : nav;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-bio-cyan/30 bg-bio-panel/80 text-bio-cyan lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <aside
        className={cn(
          "glass-panel fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col rounded-none border-y-0 border-l-0 p-5 transition-transform lg:sticky lg:top-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-display text-xl font-black text-bio-ice">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-button-gradient shadow-neon">
              <Activity className="h-5 w-5" />
            </span>
            HealthAI
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="text-bio-muted lg:hidden" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border-l-2 px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "border-l-bio-cyan bg-bio-cyan/10 text-bio-cyan shadow-[inset_0_0_20px_rgba(0,212,255,0.06)]"
                    : "border-l-transparent text-bio-muted hover:bg-white/5 hover:text-bio-ice"
                )}
              >
                <Icon className="h-5 w-5 transition group-hover:rotate-6" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-bio-cyan/15 bg-black/20 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-button-gradient font-display font-black">{initials(user.full_name)}</div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-bio-ice">{user.full_name}</p>
              <p className="text-xs uppercase tracking-[0.08em] text-bio-muted">{user.role}</p>
            </div>
          </div>
          <Button3D
            variant="secondary"
            fullWidth
            className="mt-4 min-h-10 py-2 text-xs"
            onClick={async () => {
              await logout();
              router.replace("/");
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button3D>
        </div>
      </aside>
      <main className="min-w-0 px-4 pb-12 pt-20 lg:px-8 lg:pt-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.22em] text-bio-cyan">BioNeon Command Center</p>
            <h1 className="mt-2 font-display text-3xl font-black text-bio-ice lg:text-4xl">
              {pathname === "/admin" ? "Admin Dashboard" : pathname === "/assessment" ? "AI Assessment" : pathname === "/history" ? "Health History" : pathname === "/scanner" ? "Prescription Scanner" : "User Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link href="/assessment" className="hidden sm:block">
              <Button3D>
                <Stethoscope className="h-4 w-4" />
                Assess
              </Button3D>
            </Link>
            <div className="grid h-12 w-12 place-items-center rounded-full border border-bio-cyan/25 bg-white/5">
              <UserRound className="h-5 w-5 text-bio-cyan" />
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
