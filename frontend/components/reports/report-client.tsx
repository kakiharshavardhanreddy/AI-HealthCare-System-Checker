"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download, Mail, Share2 } from "lucide-react";

import { Button3D } from "@/components/design/button-3d";
import { GlassCard } from "@/components/design/glass-card";
import { Skeleton } from "@/components/design/loading";
import { api, reportDownloadUrl } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";

export function ReportClient() {
  const params = useParams<{ id: string }>();
  const token = useAuthStore((state) => state.accessToken);
  const pushToast = useNotificationStore((state) => state.pushToast);
  const id = Number(params.id);
  const report = useQuery({ queryKey: ["report", id], queryFn: () => api.report(token!, id), enabled: Boolean(token && id) });

  async function download() {
    if (!token) return;
    const response = await fetch(reportDownloadUrl(id), { headers: { Authorization: `Bearer ${token}` } });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `healthai-report-${id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (report.isLoading) return <Skeleton className="h-[520px]" />;
  if (!report.data) return <GlassCard hover={false}>Report not found.</GlassCard>;

  const data = report.data.report_data as {
    patient?: Record<string, string | number>;
    diagnosis?: Record<string, string | number>;
    symptoms?: string[];
    recommendations?: Record<string, string[] | string>;
    disclaimer?: string;
  };

  return (
    <GlassCard hover={false} className="mx-auto max-w-5xl">
      <div className="rounded-2xl border border-bio-cyan/15 bg-slate-950/80 p-6">
        <div className="border-b border-bio-cyan/15 pb-5">
          <p className="font-display text-sm uppercase tracking-[0.18em] text-bio-cyan">HealthAI</p>
          <h2 className="mt-2 font-display text-3xl font-black text-bio-ice">{report.data.title}</h2>
          <p className="mt-2 font-mono text-sm text-bio-muted">{new Date(report.data.created_at).toLocaleString()}</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Object.entries(data.patient ?? {}).map(([key, value]) => <InfoBox key={key} label={key} value={String(value)} />)}
          {Object.entries(data.diagnosis ?? {}).filter(([, value]) => typeof value !== "object").map(([key, value]) => <InfoBox key={key} label={key} value={String(value)} />)}
        </div>
        <section className="mt-6 rounded-xl border border-bio-cyan/10 bg-black/20 p-4">
          <h3 className="font-display text-xl font-bold text-bio-ice">Symptoms</h3>
          <p className="mt-2 text-bio-muted">{data.symptoms?.join(", ")}</p>
        </section>
        <section className="mt-4 rounded-xl border border-bio-cyan/10 bg-black/20 p-4">
          <h3 className="font-display text-xl font-bold text-bio-ice">Recommendations</h3>
          <div className="mt-3 space-y-3">
            {Object.entries(data.recommendations ?? {}).map(([key, value]) => (
              <div key={key}>
                <p className="font-semibold capitalize text-bio-cyan">{key.replaceAll("_", " ")}</p>
                <p className="mt-1 text-bio-muted">{Array.isArray(value) ? value.join(" ") : value}</p>
              </div>
            ))}
          </div>
        </section>
        <p className="mt-5 text-sm text-bio-muted">{data.disclaimer}</p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button3D onClick={download}><Download className="h-4 w-4" />Download PDF</Button3D>
        <Button3D variant="secondary" onClick={async () => {
          if (!token) return;
          await api.emailReport(token, id);
          pushToast({ title: "Report email queued", message: "The report email request was saved.", type: "success" });
        }}><Mail className="h-4 w-4" />Email</Button3D>
        <Button3D variant="secondary" onClick={() => navigator.clipboard.writeText(window.location.href)}><Share2 className="h-4 w-4" />Share</Button3D>
      </div>
    </GlassCard>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-bio-cyan/10 bg-black/20 p-4">
      <p className="text-sm capitalize text-bio-muted">{label.replaceAll("_", " ")}</p>
      <p className="mt-1 font-semibold text-bio-ice">{value}</p>
    </div>
  );
}
