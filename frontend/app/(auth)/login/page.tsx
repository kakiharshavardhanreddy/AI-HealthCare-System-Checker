"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthFrame } from "@/components/layout/auth-frame";
import { Button3D } from "@/components/design/button-3d";
import { GlassCard } from "@/components/design/glass-card";
import { GlowInput } from "@/components/design/glow-input";
import { loginSchema } from "@/lib/validators";
import { useAuthStore } from "@/stores/auth-store";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.isLoading);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    try {
      await login(values.email, values.password);
      router.push("/dashboard");
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Login failed" });
    }
  }

  return (
    <AuthFrame tagline="Welcome back to your AI health command center.">
      <GlassCard hover={false} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-bio-cyan">Secure Access</p>
          <h1 className="mt-3 font-display text-4xl font-black text-bio-ice">Welcome Back</h1>
          <p className="mt-3 text-bio-muted">Sign in to continue your assessment timeline.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <GlowInput label="Email" type="email" icon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register("email")} />
          <GlowInput label="Password" type="password" icon={<Lock className="h-4 w-4" />} error={errors.password?.message} {...register("password")} />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-bio-cyan transition hover:text-bio-ice">
              Forgot Password?
            </Link>
          </div>
          {errors.root ? <p className="rounded-xl border border-bio-danger/30 bg-bio-danger/10 p-3 text-sm text-bio-danger">{errors.root.message}</p> : null}
          <Button3D fullWidth loading={loading}>
            Login
          </Button3D>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-bio-muted">
          <span className="h-px flex-1 bg-bio-cyan/15" />
          or continue with
          <span className="h-px flex-1 bg-bio-cyan/15" />
        </div>
        <Button3D
          type="button"
          variant="secondary"
          fullWidth
          onClick={() => setError("root", { message: "Google OAuth is ready for provider credentials in production settings." })}
        >
          Google OAuth
        </Button3D>
        <p className="mt-6 text-center text-sm text-bio-muted">
          New to HealthAI?{" "}
          <Link href="/register" className="font-semibold text-bio-cyan">
            Create account
          </Link>
        </p>
      </GlassCard>
    </AuthFrame>
  );
}
