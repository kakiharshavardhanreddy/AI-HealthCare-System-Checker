"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type Button3DProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
};

export function Button3D({ variant = "primary", loading, fullWidth, className, disabled, children, onClick, ...props }: Button3DProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ripple = { id: Date.now(), x: event.clientX - rect.left, y: event.clientY - rect.top };
    setRipples((items) => [...items, ripple]);
    window.setTimeout(() => setRipples((items) => items.filter((item) => item.id !== ripple.id)), 650);
    onClick?.(event);
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.04, rotateX: disabled ? 0 : 1.5, rotateY: disabled ? 0 : -1.5 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      disabled={disabled || loading}
      onClick={handleClick}
      className={cn(
        "group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-xl px-7 py-3 text-center font-display text-sm font-bold uppercase tracking-[0.1em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth && "w-full",
        variant === "primary" &&
          "bg-button-gradient text-white shadow-[0_0_20px_rgba(0,212,255,0.4),0_0_60px_rgba(0,212,255,0.1)] hover:shadow-[0_0_40px_rgba(0,212,255,0.8)]",
        variant === "secondary" &&
          "border border-bio-cyan/40 bg-transparent text-bio-cyan hover:border-bio-cyan/80 hover:bg-bio-cyan/10 hover:shadow-neon",
        variant === "danger" &&
          "bg-alert-gradient text-white shadow-[0_0_20px_rgba(239,68,68,0.42)] hover:shadow-[0_0_36px_rgba(239,68,68,0.72)]",
        variant === "ghost" && "text-bio-muted hover:bg-white/5 hover:text-bio-ice",
        className
      )}
      {...props}
    >
      <span className="shimmer pointer-events-none absolute inset-0 opacity-50" />
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute h-10 w-10 rounded-full bg-white/30"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            animation: "pulseRing 650ms ease-out forwards"
          }}
        />
      ))}
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </motion.button>
  );
}
