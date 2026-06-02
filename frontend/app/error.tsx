"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button3D } from "@/components/design/button-3d";
import { GlassCard } from "@/components/design/glass-card";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <GlassCard className="max-w-xl text-center">
        <AlertTriangle className="mx-auto mb-5 h-12 w-12 text-bio-danger" />
        <h1 className="font-display text-3xl font-black text-bio-ice">System Fault Detected</h1>
        <p className="mt-3 text-bio-muted">The HealthAI interface hit an unexpected state. The error boundary caught it safely.</p>
        <Button3D className="mt-8" onClick={reset}>
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button3D>
      </GlassCard>
    </main>
  );
}
