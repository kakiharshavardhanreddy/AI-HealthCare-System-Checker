"use client";

import { Activity } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-bio-bg">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full border border-bio-cyan/40 bg-bio-cyan/10 shadow-neon"
        >
          <Activity className="h-11 w-11 text-bio-cyan" />
        </motion.div>
        <h2 className="font-display text-2xl font-black text-bio-ice">Initializing HealthAI...</h2>
        <div className="mt-5 h-2 w-72 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-button-gradient"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("relative overflow-hidden rounded-xl bg-white/5 before:absolute before:inset-0 before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-bio-cyan/10 before:to-transparent before:content-['']", className)} />;
}

export function LoadingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((item) => (
        <motion.span
          key={item}
          className="h-2 w-2 rounded-full bg-bio-cyan"
          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: item * 0.12 }}
        />
      ))}
    </span>
  );
}
