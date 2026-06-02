import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

export function severityColor(severity: string) {
  if (severity === "High") return "text-bio-danger border-bio-danger/50 bg-bio-danger/10";
  if (severity === "Moderate") return "text-bio-warning border-bio-warning/50 bg-bio-warning/10";
  return "text-bio-success border-bio-success/50 bg-bio-success/10";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
