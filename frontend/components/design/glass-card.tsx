"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type GlassCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  hover?: boolean;
};

export function GlassCard({ children, className, hover = true, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn("glass-panel rounded-2xl p-6 transition-all duration-300 hover:border-bio-cyan/40 hover:shadow-neon", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
