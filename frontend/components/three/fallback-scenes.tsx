"use client";

import { Activity, Brain, Dna, HeartPulse, Orbit, ShieldPlus } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function GlobalBackgroundFallback() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-hero-gradient">
      <div className="absolute inset-0 bio-grid opacity-30" />
      <motion.div
        className="absolute right-[-12rem] top-16 h-[34rem] w-[34rem] rounded-full border border-bio-cyan/20 bg-bio-cyan/5 shadow-[0_0_100px_rgba(0,212,255,0.18)]"
        animate={{ rotate: 360, scale: [1, 1.04, 1] }}
        transition={{ rotate: { duration: 80, repeat: Infinity, ease: "linear" }, scale: { duration: 6, repeat: Infinity } }}
      />
      <motion.div
        className="absolute left-[-10rem] bottom-[-8rem] h-[28rem] w-[28rem] rounded-full border border-bio-violet/20 bg-bio-violet/10 shadow-[0_0_100px_rgba(124,58,237,0.2)]"
        animate={{ y: [0, -24, 0], x: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_20%,rgba(0,212,255,0.16),transparent_18rem),radial-gradient(circle_at_80%_35%,rgba(124,58,237,0.15),transparent_20rem),radial-gradient(circle_at_45%_85%,rgba(16,185,129,0.12),transparent_18rem)]" />
      {Array.from({ length: 36 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-bio-cyan/70 shadow-[0_0_12px_rgba(0,212,255,0.8)]"
          style={{ left: `${(index * 29) % 100}%`, top: `${(index * 47) % 100}%` }}
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -12, 0] }}
          transition={{ duration: 2.5 + (index % 5), repeat: Infinity, delay: index * 0.08 }}
        />
      ))}
    </div>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <GlobalBackgroundFallback />
      <motion.div
        className="absolute right-[7%] top-[18%] hidden h-[30rem] w-[30rem] rounded-full border border-bio-cyan/30 bg-[radial-gradient(circle_at_35%_30%,rgba(16,185,129,0.28),rgba(0,212,255,0.12)_35%,rgba(2,8,23,0.1)_70%)] shadow-[0_0_90px_rgba(0,212,255,0.28)] lg:block"
        animate={{ rotate: 360, scale: [1, 1.025, 1] }}
        transition={{ rotate: { duration: 45, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
      >
        <div className="absolute inset-8 rounded-full border border-bio-cyan/20" />
        <div className="absolute inset-20 rounded-full border border-bio-violet/20" />
        {[HeartPulse, Dna, ShieldPlus, Brain, Activity, Orbit].map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute grid h-12 w-12 place-items-center rounded-full border border-bio-cyan/30 bg-bio-panel/80 text-bio-cyan shadow-neon"
            style={{ left: `${45 + Math.cos(index) * 42}%`, top: `${45 + Math.sin(index) * 42}%` }}
            animate={{ y: [0, -10, 0], rotate: [0, 12, 0] }}
            transition={{ duration: 2.8 + index * 0.2, repeat: Infinity }}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="absolute bottom-20 left-0 h-px w-full bg-gradient-to-r from-transparent via-bio-green to-transparent shadow-[0_0_24px_rgba(16,185,129,0.7)]"
        animate={{ x: ["-20%", "20%", "-20%"], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 3.2, repeat: Infinity }}
      />
    </div>
  );
}

export function NeuralNetworkScene() {
  return (
    <div className="relative h-[420px] overflow-hidden rounded-2xl bg-black/20">
      <div className="absolute inset-0 bio-grid opacity-30" />
      {Array.from({ length: 18 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute h-3 w-3 rounded-full bg-bio-violet shadow-[0_0_22px_rgba(124,58,237,0.9)]"
          style={{ left: `${8 + ((index * 17) % 84)}%`, top: `${12 + ((index * 29) % 76)}%` }}
          animate={{ scale: [0.75, 1.35, 0.75], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2 + (index % 4) * 0.4, repeat: Infinity }}
        />
      ))}
      <motion.div className="absolute inset-x-8 top-1/2 h-px bg-bio-cyan/40 shadow-neon" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2.4, repeat: Infinity }} />
      <motion.div className="absolute bottom-12 left-1/4 top-12 w-px bg-bio-cyan/30 shadow-neon" animate={{ opacity: [0.15, 0.8, 0.15] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.div className="absolute bottom-20 right-1/3 top-20 w-px rotate-45 bg-bio-cyan/30 shadow-neon" animate={{ opacity: [0.2, 0.9, 0.2] }} transition={{ duration: 2.7, repeat: Infinity }} />
    </div>
  );
}

export function MedicalGlobeScene({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-hero-gradient", className)}>
      <HeroScene />
    </div>
  );
}

export function PatientAvatarScene({ age, gender }: { age?: number; gender?: string }) {
  return (
    <div className="grid min-h-[340px] place-items-center">
      <motion.div className="relative h-56 w-36" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <div className="mx-auto h-16 w-16 rounded-full border border-bio-cyan/40 bg-bio-cyan/10 shadow-neon" />
        <div className="mx-auto mt-4 h-32 w-28 rounded-[44px] border border-bio-cyan/35 bg-bio-panel/70 shadow-neon" />
        <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-bio-muted">{gender ?? "Patient"} {age ? `- ${age}` : ""}</p>
      </motion.div>
    </div>
  );
}

export function AnalysisBrainScene({ progress }: { progress: number }) {
  return (
    <div className="mx-auto my-8 grid min-h-[280px] max-w-xl place-items-center">
      <motion.div
        className="grid h-44 w-44 place-items-center rounded-full border border-bio-cyan/40 bg-bio-violet/20 shadow-[0_0_70px_rgba(0,212,255,0.24)]"
        animate={{ scale: [1, 1.06, 1], rotate: 360 }}
        transition={{ scale: { duration: 1.4, repeat: Infinity }, rotate: { duration: 18, repeat: Infinity, ease: "linear" } }}
      >
        <Brain className="h-20 w-20 text-bio-cyan" />
      </motion.div>
      <div className="mt-8 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full bg-button-gradient" animate={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function HealthGlobeWidget() {
  return (
    <div className="mt-6 grid h-[300px] place-items-center overflow-hidden rounded-2xl border border-bio-cyan/15 bg-black/20">
      <motion.div
        className="relative h-40 w-40 rounded-full border border-bio-cyan/35 bg-bio-cyan/10 shadow-[0_0_70px_rgba(0,212,255,0.24)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-8 rounded-full border border-bio-violet/30" />
        <span className="absolute left-8 top-10 h-2 w-2 rounded-full bg-bio-green shadow-neon" />
        <span className="absolute right-10 top-20 h-2 w-2 rounded-full bg-bio-cyan shadow-neon" />
        <span className="absolute bottom-9 left-16 h-2 w-2 rounded-full bg-bio-violet shadow-neon" />
      </motion.div>
    </div>
  );
}
