"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthFrame } from "@/components/layout/auth-frame";
import { Button3D } from "@/components/design/button-3d";
import { GlassCard } from "@/components/design/glass-card";
import { GlowInput } from "@/components/design/glow-input";
import { cn } from "@/lib/utils";
import { registerSchema } from "@/lib/validators";
import { useAuthStore } from "@/stores/auth-store";

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerAccount = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.isLoading);
  const {
    register,
    watch,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { terms: false } });
  const password = watch("password") ?? "";
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  }, [password]);

  async function onSubmit(values: RegisterValues) {
    try {
      await registerAccount({ full_name: values.full_name, email: values.email, password: values.password });
      router.push("/dashboard");
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Registration failed" });
    }
  }

  return (
    <AuthFrame tagline="Create your secure AI health profile in seconds.">
      <GlassCard hover={false} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-bio-cyan">New Profile</p>
          <h1 className="mt-3 font-display text-4xl font-black text-bio-ice">Register</h1>
          <p className="mt-3 text-bio-muted">Your assessments, reports, and scans stay connected.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <GlowInput label="Full Name" icon={<User className="h-4 w-4" />} error={errors.full_name?.message} {...register("full_name")} />
          <GlowInput label="Email" type="email" icon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register("email")} />
          <GlowInput label="Password" type="password" icon={<Lock className="h-4 w-4" />} error={errors.password?.message} {...register("password")} />
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn("h-full rounded-full transition-all duration-500", strength < 50 ? "bg-bio-danger" : strength < 75 ? "bg-bio-warning" : "bg-bio-success")}
              style={{ width: `${strength}%` }}
            />
          </div>
          <GlowInput label="Confirm Password" type="password" icon={<Lock className="h-4 w-4" />} error={errors.confirm_password?.message} {...register("confirm_password")} />
          <label className="flex gap-3 text-sm text-bio-muted">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-bio-cyan/40 bg-black/40 accent-bio-cyan" {...register("terms")} />
            I agree to secure processing of my assessment data and understand this is not a substitute for emergency care.
          </label>
          {errors.terms ? <p className="text-sm text-bio-danger">{errors.terms.message}</p> : null}
          {errors.root ? <p className="rounded-xl border border-bio-danger/30 bg-bio-danger/10 p-3 text-sm text-bio-danger">{errors.root.message}</p> : null}
          <Button3D fullWidth loading={loading}>
            Create Account
          </Button3D>
        </form>
        <p className="mt-6 text-center text-sm text-bio-muted">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-bio-cyan">
            Login
          </Link>
        </p>
      </GlassCard>
    </AuthFrame>
  );
}
