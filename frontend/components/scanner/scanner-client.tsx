"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCopy, FileImage, Pill, Save, UploadCloud } from "lucide-react";
import { DragEvent, useRef, useState } from "react";

import { Button3D } from "@/components/design/button-3d";
import { GlassCard } from "@/components/design/glass-card";
import { Skeleton } from "@/components/design/loading";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";

export function ScannerClient() {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const pushToast = useNotificationStore((state) => state.pushToast);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const scans = useQuery({ queryKey: ["scans"], queryFn: () => api.scans(token!), enabled: Boolean(token) });

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const next = event.dataTransfer.files[0];
    if (next) setFile(next);
  }

  async function upload() {
    if (!token || !file) return;
    const formData = new FormData();
    formData.append("file", file);
    setScanning(true);
    try {
      const result = await api.scan(token, formData);
      pushToast({ title: "Prescription scanned", message: `${result.extracted_medicines.length} medicine candidates extracted.`, type: "success" });
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["scans"] });
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <GlassCard hover={false}>
        <div
          onDrop={onDrop}
          onDragOver={(event) => event.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="relative grid min-h-[340px] cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-bio-cyan/45 bg-black/30 p-8 text-center transition hover:border-bio-cyan hover:bg-bio-cyan/5"
        >
          {scanning ? <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bio-cyan/35 to-transparent blur-sm animate-scan" /> : null}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,application/pdf,text/plain" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <div>
            <UploadCloud className="mx-auto h-16 w-16 animate-bounce text-bio-cyan" />
            <h2 className="mt-5 font-display text-3xl font-black text-bio-ice">Drop your prescription image here</h2>
            <p className="mt-3 text-bio-muted">Accepted formats: JPG, PNG, PDF, or text prescription exports.</p>
            {file ? (
              <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-xl border border-bio-cyan/20 bg-bio-cyan/10 p-3 text-bio-cyan">
                <FileImage className="h-5 w-5" />
                {file.name}
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button3D disabled={!file} loading={scanning} onClick={upload}>
            <Save className="h-4 w-4" />
            Scan & Save
          </Button3D>
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <h2 className="font-display text-2xl font-bold text-bio-ice">Scan Results</h2>
        <div className="mt-5 space-y-4">
          {scans.isLoading ? (
            <Skeleton className="h-36" />
          ) : scans.data?.length ? (
            scans.data.slice(0, 5).map((scan) => (
              <div key={scan.id} className="rounded-2xl border border-bio-cyan/15 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="truncate font-semibold text-bio-ice">{scan.filename}</p>
                  <span className="font-mono text-sm text-bio-cyan">{Math.round(scan.confidence * 100)}%</span>
                </div>
                <div className="space-y-3">
                  {scan.extracted_medicines.map((medicine) => (
                    <div key={`${scan.id}-${medicine.name}`} className="rounded-xl border border-bio-cyan/10 bg-bio-panel/50 p-3">
                      <div className="flex items-start gap-3">
                        <Pill className="mt-1 h-5 w-5 text-bio-cyan" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-bio-ice">{medicine.name}</p>
                          <p className="text-sm text-bio-muted">{medicine.dosage}</p>
                          <p className="mt-1 text-xs text-bio-muted">{medicine.instructions}</p>
                        </div>
                        <button type="button" aria-label="Copy medicine" onClick={() => navigator.clipboard.writeText(JSON.stringify(medicine))} className="text-bio-muted hover:text-bio-cyan">
                          <ClipboardCopy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-bio-cyan/10 bg-black/20 p-5 text-bio-muted">No prescription scans yet.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
