"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { GlassCard } from "@/components/design/glass-card";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

export function StatCard({
  icon,
  label,
  value,
  trend,
  suffix = ""
}: {
  icon: ReactNode;
  label: string;
  value: number;
  trend: number;
  suffix?: string;
}) {
  const count = useCountUp(value);
  const positive = trend >= 0;
  return (
    <GlassCard className="min-h-36">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-button-gradient text-white shadow-neon">{icon}</div>
        <div className={cn("flex items-center gap-1 font-mono text-sm", positive ? "text-bio-success" : "text-bio-danger")}>
          {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>
      <p className="mt-5 text-sm text-bio-muted">{label}</p>
      <p className="mt-1 font-mono text-4xl font-black text-bio-cyan">
        {Math.round(count)}
        {suffix}
      </p>
    </GlassCard>
  );
}
