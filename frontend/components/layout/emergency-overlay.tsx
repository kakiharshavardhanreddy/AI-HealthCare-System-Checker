"use client";

import { AlertTriangle, Phone } from "lucide-react";
import { motion } from "framer-motion";

import { Button3D } from "@/components/design/button-3d";
import { useUiStore } from "@/stores/ui-store";

export function EmergencyOverlay() {
  const emergency = useUiStore((state) => state.emergency);
  const clear = useUiStore((state) => state.clearEmergency);
  if (!emergency) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[85] flex items-center justify-center bg-red-950/70 p-4 shadow-[inset_0_0_0_4px_rgba(239,68,68,0.45)]"
    >
      <motion.div
        initial={{ scale: 0.88, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-panel max-w-xl rounded-2xl border-bio-danger/60 p-8 text-center shadow-[0_0_80px_rgba(239,68,68,0.35)]"
      >
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-bio-danger/20 text-bio-danger">
          <AlertTriangle className="h-10 w-10" />
        </motion.div>
        <h2 className="mt-6 font-display text-4xl font-black text-bio-danger">HIGH RISK DETECTED</h2>
        <p className="mt-3 text-xl font-semibold text-bio-ice">{emergency.condition}</p>
        <p className="mt-2 text-bio-muted">{emergency.message}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button3D variant="danger" onClick={() => window.open("tel:911")}>
            <Phone className="h-4 w-4" />
            Emergency Hotline
          </Button3D>
          <Button3D variant="ghost" onClick={clear}>
            Continue Anyway
          </Button3D>
        </div>
      </motion.div>
    </motion.div>
  );
}
