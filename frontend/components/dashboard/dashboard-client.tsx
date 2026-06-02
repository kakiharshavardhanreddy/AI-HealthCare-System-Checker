"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, ClipboardList, FileText } from "lucide-react";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { GlassCard } from "@/components/design/glass-card";
import { Skeleton } from "@/components/design/loading";
import { StatCard } from "@/components/design/stat-card";
import { HealthGlobeWidget } from "@/components/three/fallback-scenes";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const palette = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#22c55e"];

export function DashboardClient() {
  const token = useAuthStore((state) => state.accessToken);
  const overview = useQuery({ queryKey: ["overview"], queryFn: () => api.overview(token!), enabled: Boolean(token) });
  const charts = useQuery({ queryKey: ["charts"], queryFn: () => api.charts(token!), enabled: Boolean(token) });

  if (overview.isLoading || charts.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36" />)}</div>
        <div className="grid gap-5 xl:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-80" />)}</div>
      </div>
    );
  }

  const data = overview.data ?? { total_assessments: 0, average_confidence: 0, high_risk_count: 0, reports_generated: 0, trends: {} };
  const chartData = charts.data ?? { symptom_frequency: [], disease_distribution: [], risk_trend: [], weekly_activity: [] };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<ClipboardList className="h-6 w-6" />} label="Assessments" value={data.total_assessments} trend={data.trends.assessments ?? 0} />
        <StatCard icon={<Activity className="h-6 w-6" />} label="Avg Confidence" value={data.average_confidence} trend={data.trends.confidence ?? 0} suffix="%" />
        <StatCard icon={<AlertTriangle className="h-6 w-6" />} label="High Risk" value={data.high_risk_count} trend={data.trends.risk ?? 0} />
        <StatCard icon={<FileText className="h-6 w-6" />} label="Reports" value={data.reports_generated} trend={data.trends.reports ?? 0} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard title="Symptom Frequency">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData.symptom_frequency}>
                <CartesianGrid stroke="rgba(0,212,255,0.1)" />
                <XAxis dataKey="symptom" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Disease Distribution">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={chartData.disease_distribution} dataKey="value" nameKey="name" outerRadius={92}>
                  {chartData.disease_distribution.map((_, index) => <Cell key={index} fill={palette[index % palette.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Risk Score Trend">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData.risk_trend}>
                <defs>
                  <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(0,212,255,0.1)" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="risk" stroke="#00d4ff" fill="url(#riskFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Weekly Activity">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData.weekly_activity}>
                <CartesianGrid stroke="rgba(0,212,255,0.1)" />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="assessments" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <GlassCard hover={false} className="h-fit">
          <h2 className="font-display text-2xl font-bold text-bio-ice">3D Health Globe</h2>
          <p className="mt-2 text-sm text-bio-muted">Assessment signals appear as biometric dots across your health timeline.</p>
          <HealthGlobeWidget />
        </GlassCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <GlassCard hover={false} className="min-h-80">
      <h2 className="mb-5 font-display text-xl font-bold text-bio-ice">{title}</h2>
      {children}
    </GlassCard>
  );
}

const tooltipStyle = {
  background: "rgba(10,22,40,0.94)",
  border: "1px solid rgba(0,212,255,0.25)",
  borderRadius: "12px",
  color: "#f0f9ff"
};
