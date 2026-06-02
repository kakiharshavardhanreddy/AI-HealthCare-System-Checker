"use client";

import { AlertTriangle, CheckCircle2, Info, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import { useNotificationStore } from "@/stores/notification-store";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  danger: Zap
};

export function ToastStack() {
  const { toasts, dismissToast } = useNotificationStore();

  return (
    <div className="fixed right-4 top-4 z-[70] flex w-[min(390px,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => dismissToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({
  toast,
  onClose
}: {
  toast: { id: string; title: string; message: string; type: "success" | "info" | "warning" | "danger" };
  onClose: () => void;
}) {
  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="glass-panel relative overflow-hidden rounded-2xl p-4"
    >
      <div className="flex gap-3">
        <Icon
          className={cn(
            "mt-1 h-5 w-5 shrink-0",
            toast.type === "success" && "text-bio-success",
            toast.type === "info" && "text-bio-cyan",
            toast.type === "warning" && "text-bio-warning",
            toast.type === "danger" && "text-bio-danger"
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-bio-ice">{toast.title}</p>
          <p className="mt-1 text-sm leading-6 text-bio-muted">{toast.message}</p>
        </div>
        <button type="button" onClick={onClose} className="text-bio-muted transition hover:text-bio-ice" aria-label="Dismiss notification">
          <X className="h-4 w-4" />
        </button>
      </div>
      <motion.div className="absolute bottom-0 left-0 h-1 bg-button-gradient" initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 5 }} />
    </motion.div>
  );
}
