"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

type GlowInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  error?: string;
};

export const GlowInput = forwardRef<HTMLInputElement, GlowInputProps>(({ label, icon, error, className, type, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <label className={cn("group relative block", error && "animate-shake")}>
      {icon ? <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-bio-cyan/70">{icon}</span> : null}
      <input
        ref={ref}
        type={isPassword && visible ? "text" : type}
        placeholder=" "
        className={cn(
          "peer h-14 w-full rounded-[10px] border border-bio-cyan/20 bg-black/40 px-4 pt-4 font-sans text-bio-ice outline-none transition-all duration-300 placeholder:text-transparent focus:border-bio-cyan/80 focus:shadow-[0_0_20px_rgba(0,212,255,0.22)]",
          icon && "pl-11",
          isPassword && "pr-12",
          error && "border-bio-danger focus:border-bio-danger",
          className
        )}
        {...props}
      />
      <span
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-bio-muted transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-bio-cyan peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
          icon ? "left-11" : "left-4"
        )}
      >
        {label}
      </span>
      {isPassword ? (
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((value) => !value)}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-bio-muted transition hover:text-bio-cyan"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      ) : null}
      {error ? <span className="mt-2 block text-sm text-bio-danger">{error}</span> : null}
    </label>
  );
});

GlowInput.displayName = "GlowInput";
