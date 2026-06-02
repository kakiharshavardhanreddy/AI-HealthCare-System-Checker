"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import type { ReactNode } from "react";

import { MedicalGlobeScene } from "@/components/three/fallback-scenes";

export function AuthFrame({ children, tagline }: { children: ReactNode; tagline: string }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.4fr_0.9fr]">
      <section className="relative hidden overflow-hidden border-r border-bio-cyan/15 lg:block">
        <MedicalGlobeScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-bio-bg/20 via-transparent to-bio-bg/80" />
        <div className="absolute bottom-12 left-12 max-w-2xl">
          <Link href="/" className="mb-8 inline-flex items-center gap-3 font-display text-xl font-black text-bio-ice">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-button-gradient shadow-neon">
              <Activity className="h-5 w-5" />
            </span>
            HealthAI
          </Link>
          <h1 className="font-display text-5xl font-black leading-tight text-bio-ice">{tagline}</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-bio-muted">Secure assessment, explainable AI, and human-centered healthcare workflows in one BioNeon interface.</p>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        {children}
      </section>
    </main>
  );
}
