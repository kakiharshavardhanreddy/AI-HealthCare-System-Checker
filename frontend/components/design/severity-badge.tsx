import { cn, severityColor } from "@/lib/utils";

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.08em]", severityColor(severity))}>
      {severity}
    </span>
  );
}
