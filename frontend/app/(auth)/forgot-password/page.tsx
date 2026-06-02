"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button3D } from "@/components/design/button-3d";
import { GlassCard } from "@/components/design/glass-card";
import { GlowInput } from "@/components/design/glow-input";
import { api } from "@/lib/api";
import { forgotSchema } from "@/lib/validators";

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(values: ForgotValues) {
    setLoading(true);
    try {
      await api.forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Reset request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <GlassCard hover={false} className="w-full max-w-md text-center">
        {sent ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <CheckCircle2 className="mx-auto h-16 w-16 text-bio-success" />
            <h1 className="mt-5 font-display text-3xl font-black text-bio-ice">Reset Link Sent</h1>
            <p className="mt-3 text-bio-muted">If the account exists, a secure reset workflow has been queued.</p>
            <Link href="/login" className="mt-8 inline-block">
              <Button3D>Back to Login</Button3D>
            </Link>
          </motion.div>
        ) : (
          <>
            <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-bio-cyan">Account Recovery</p>
            <h1 className="mt-3 font-display text-4xl font-black text-bio-ice">Forgot Password</h1>
            <p className="mt-3 text-bio-muted">Enter your email and HealthAI will queue a reset link.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4 text-left">
              <GlowInput label="Email" type="email" icon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register("email")} />
              {errors.root ? <p className="rounded-xl border border-bio-danger/30 bg-bio-danger/10 p-3 text-sm text-bio-danger">{errors.root.message}</p> : null}
              <Button3D fullWidth loading={loading}>
                Send Reset Link
              </Button3D>
            </form>
          </>
        )}
      </GlassCard>
    </main>
  );
}
