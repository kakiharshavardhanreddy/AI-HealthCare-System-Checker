"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button3D } from "@/components/design/button-3d";
import { GlassCard } from "@/components/design/glass-card";
import { SeverityBadge } from "@/components/design/severity-badge";
import { Skeleton } from "@/components/design/loading";
import { HealthGlobeWidget } from "@/components/three/fallback-scenes";
import { api, reportDownloadUrl } from "@/lib/api";
import type { Prediction } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export function HistoryClient() {
  const token = useAuthStore((state) => state.accessToken);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const history = useQuery({ queryKey: ["history"], queryFn: () => api.history(token!), enabled: Boolean(token) });

  const filtered = useMemo(() => {
    return (history.data ?? []).filter((item) => {
      const date = item.created_at.slice(0, 10);
      const matchesSearch = item.predicted_disease.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severity === "All" || item.severity === severity;
      const matchesFrom = !from || date >= from;
      const matchesTo = !to || date <= to;
      return matchesSearch && matchesSeverity && matchesFrom && matchesTo;
    });
  }, [from, history.data, search, severity, to]);

  async function download(prediction: Prediction) {
    if (!token) return;
    const report = await api.createReport(token, prediction.id);
    const response = await fetch(reportDownloadUrl(report.id), { headers: { Authorization: `Bearer ${token}` } });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `healthai-${prediction.predicted_disease}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <GlassCard hover={false}>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bio-cyan" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search disease..." className="h-12 w-full rounded-xl border border-bio-cyan/20 bg-black/40 pl-11 pr-4 outline-none focus:border-bio-cyan/70" />
          </label>
          <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="h-12 rounded-xl border border-bio-cyan/20 bg-black/40 px-4 text-bio-ice outline-none">
            {["All", "Low", "Moderate", "High"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-12 rounded-xl border border-bio-cyan/20 bg-black/40 px-4 text-bio-ice outline-none" />
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-12 rounded-xl border border-bio-cyan/20 bg-black/40 px-4 text-bio-ice outline-none" />
        </div>
      </GlassCard>

      {history.isLoading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40" />)}</div>
      ) : filtered.length ? (
        <div className="relative space-y-6 pl-8 before:absolute before:bottom-0 before:left-3 before:top-0 before:w-px before:bg-bio-cyan/30">
          {filtered.map((item) => (
            <GlassCard key={item.id} hover className="relative">
              <span className="absolute -left-[39px] top-8 grid h-7 w-7 place-items-center rounded-full border border-bio-cyan bg-bio-bg text-bio-cyan">
                <Filter className="h-4 w-4" />
              </span>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-mono text-sm text-bio-muted">{new Date(item.created_at).toLocaleString()}</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-bio-ice">{item.predicted_disease}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.symptom_keys.slice(0, 8).map((symptom) => (
                      <span key={symptom} className="rounded-full border border-bio-cyan/20 px-3 py-1 text-xs text-bio-muted">
                        {symptom.replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 md:items-end">
                  <SeverityBadge severity={item.severity} />
                  <p className="font-mono text-bio-cyan">{item.confidence}% confidence</p>
                  <Button3D variant="secondary" className="min-h-10 py-2 text-xs" onClick={() => download(item)}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button3D>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard hover={false} className="text-center">
          <HealthGlobeWidget />
          <h2 className="font-display text-2xl font-bold text-bio-ice">No assessments yet</h2>
          <p className="mt-2 text-bio-muted">Your health timeline will activate after your first AI assessment.</p>
        </GlassCard>
      )}
    </div>
  );
}
