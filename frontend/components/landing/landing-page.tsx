"use client";

import Link from "next/link";
import { Activity, Bot, Brain, ChevronDown, ClipboardPlus, HeartPulse, History, ShieldAlert, Sparkles, Stethoscope, Star, UserRoundCheck } from "lucide-react";
import { motion } from "framer-motion";

import { Accordion } from "@/components/ui/accordion";
import { Button3D } from "@/components/design/button-3d";
import { GlassCard } from "@/components/design/glass-card";
import { HeroScene, NeuralNetworkScene } from "@/components/three/fallback-scenes";
import { useCountUp } from "@/hooks/use-count-up";

const features = [
  { icon: Bot, title: "AI Symptom Analysis", text: "Instant Random Forest predictions with probability-ranked differentials." },
  { icon: Brain, title: "Explainable AI", text: "Feature importance turns every prediction into a readable clinical signal map." },
  { icon: UserRoundCheck, title: "Body Visualization", text: "Affected regions glow by severity for quick risk comprehension." },
  { icon: History, title: "Health History", text: "Track symptom frequency, risk score, and assessments over time." },
  { icon: ShieldAlert, title: "Emergency Alerts", text: "High-risk patterns trigger red overlays, notifications, and admin activity." },
  { icon: Stethoscope, title: "Doctor Connect", text: "Recommended specialists and availability cards guide the next step." }
];

const faqs = [
  { question: "Is HealthAI a replacement for a doctor?", answer: "No. It is an AI triage and education platform. It helps organize symptoms and risk signals, but clinical diagnosis requires a licensed professional." },
  { question: "How does the AI explain predictions?", answer: "The backend maps Random Forest feature importance back to selected symptoms and marks strong or partial matches for the predicted disease." },
  { question: "What happens when high risk is detected?", answer: "The app shows a full emergency overlay, saves the alert, pushes a WebSocket notification, and recommends urgent medical attention." },
  { question: "Can I download my assessment?", answer: "Yes. Completed assessments generate persisted health reports with PDF download, email queue, and share actions." }
];

function CountStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const count = useCountUp(value, 1400);
  return (
    <div className="text-center">
      <p className="font-mono text-4xl font-black text-bio-cyan lg:text-5xl">
        {Math.round(count).toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm uppercase tracking-[0.16em] text-bio-muted">{label}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <section className="relative min-h-screen overflow-hidden">
        <HeroScene />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-24">
          <nav className="absolute left-4 right-4 top-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 font-display text-xl font-black text-bio-ice">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-button-gradient shadow-neon">
                <Activity className="h-5 w-5" />
              </span>
              HealthAI
            </Link>
            <div className="hidden items-center gap-6 text-sm text-bio-muted md:flex">
              {["features", "capabilities", "faq"].map((id) => (
                <a key={id} href={`#${id}`} className="relative transition hover:text-bio-cyan after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-bio-cyan after:transition-all hover:after:w-full">
                  {id[0].toUpperCase() + id.slice(1)}
                </a>
              ))}
            </div>
            <Link href="/login">
              <Button3D variant="secondary" className="min-h-10 px-5 py-2 text-xs">
                Login
              </Button3D>
            </Link>
          </nav>
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex rounded-full border border-bio-cyan/35 bg-bio-cyan/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-bio-cyan shadow-neon"
            >
              Powered By Artificial Intelligence
            </motion.div>
            <h1 className="font-display text-5xl font-black leading-[1.02] text-bio-ice sm:text-7xl lg:text-8xl">
              {["Your", "AI", "Doctor"].map((word, index) => (
                <motion.span key={word} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * index }} className="mr-4 inline-block">
                  {word}
                </motion.span>
              ))}
              <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="block bg-gradient-to-r from-bio-cyan to-bio-violet bg-clip-text text-transparent">
                Is Ready.
              </motion.span>
            </h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }} className="mt-6 max-w-2xl text-lg leading-8 text-bio-muted sm:text-xl">
              Advanced symptom analysis powered by machine learning. Get accurate health predictions in minutes with explainability, reports, and real-time safety alerts.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/assessment">
                <Button3D>
                  <ClipboardPlus className="h-4 w-4" />
                  Start Free Assessment
                </Button3D>
              </Link>
              <a href="#capabilities">
                <Button3D variant="secondary">
                  <Sparkles className="h-4 w-4" />
                  Watch Demo
                </Button3D>
              </a>
            </motion.div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-bio-muted">
              <span>500K+ Users</span>
              <span>98.7% Accuracy</span>
              <span>HIPAA Compliant</span>
            </div>
          </div>
          <FloatingHeroCards />
          <a href="#features" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-bio-cyan">
            <ChevronDown className="h-8 w-8 animate-bounce" />
          </a>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-24">
        <SectionHeading title="Clinical Intelligence Layer" text="Every core healthcare workflow is connected: intake, prediction, explanation, reporting, history, and action." />
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                <GlassCard className="h-full">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-button-gradient shadow-neon">
                    <Icon className="h-6 w-6 transition group-hover:rotate-180" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-bio-ice">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-bio-muted">{feature.text}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section id="capabilities" className="border-y border-bio-cyan/10 bg-black/20 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionHeading title="AI Capabilities" text="A live neural visualization mirrors the backend flow: symptoms become features, features become probabilities, probabilities become explainable guidance." align="left" />
            <div className="mt-10 grid grid-cols-2 gap-6">
              <CountStat value={50} suffix="M+" label="Symptoms Analyzed" />
              <CountStat value={98} suffix=".7%" label="Prediction Accuracy" />
              <CountStat value={10000} suffix="+" label="Diseases Mapped" />
              <CountStat value={500} suffix="K+" label="Users Helped" />
            </div>
          </div>
          <GlassCard hover={false} className="p-0">
            <NeuralNetworkScene />
          </GlassCard>
        </div>
      </section>

      <section className="bio-grid border-b border-bio-cyan/10 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <CountStat value={500} suffix="K+" label="Users" />
          <CountStat value={98} suffix=".7%" label="Accuracy" />
          <CountStat value={10000} suffix="+" label="Diseases" />
          <CountStat value={24} suffix="/7" label="Monitoring" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24">
        <SectionHeading title="Patient Signal" text="Autoplaying trust cards from users who want fast, understandable health context." />
        <div className="mt-10 overflow-hidden">
          <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 24, ease: "linear" }} className="flex w-max gap-5 hover:[animation-play-state:paused]">
            {[...testimonials, ...testimonials].map((item, index) => (
              <GlassCard key={`${item.name}-${index}`} className="w-80" hover={false}>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-button-gradient font-display font-black">{item.name[0]}</div>
                  <div>
                    <p className="font-semibold text-bio-ice">{item.name}</p>
                    <div className="flex text-bio-warning">{Array.from({ length: 5 }).map((_, star) => <Star key={star} className="h-4 w-4 fill-current" />)}</div>
                  </div>
                </div>
                <p className="mt-5 leading-7 text-bio-muted">"{item.quote}"</p>
              </GlassCard>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-4 py-24">
        <SectionHeading title="FAQ" text="Clear answers for the safety and workflow questions that matter." />
        <div className="mt-10">
          <Accordion items={faqs} />
        </div>
      </section>

      <footer className="border-t border-bio-cyan/10 px-4 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <div className="flex items-center gap-3 font-display text-xl font-black text-bio-ice">
              <Activity className="h-6 w-6 text-bio-cyan" />
              HealthAI
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-bio-muted">AI healthcare symptom checking, explainable predictions, and report automation in a production-ready stack.</p>
            <span className="mt-5 inline-flex rounded-full border border-bio-cyan/25 px-3 py-1 text-xs text-bio-cyan">Built with AI</span>
          </div>
          {["Platform", "Care", "Developers", "Company"].map((column) => (
            <div key={column}>
              <p className="font-display text-sm font-bold text-bio-ice">{column}</p>
              <div className="mt-4 space-y-3 text-sm text-bio-muted">
                <p>Dashboard</p>
                <p>Reports</p>
                <p>API Docs</p>
                <p>Security</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-7xl text-sm text-bio-muted">(c) 2026 HealthAI. Informational AI, not a substitute for emergency care.</p>
      </footer>
    </main>
  );
}

function SectionHeading({ title, text, align = "center" }: { title: string; text: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-bio-cyan">BioNeon Dark</p>
      <h2 className="mt-3 font-display text-4xl font-black text-bio-ice">{title}</h2>
      <p className="mt-4 text-lg leading-8 text-bio-muted">{text}</p>
    </div>
  );
}

function FloatingHeroCards() {
  const stats = [
    ["AI Diagnosis", "98.7% Accuracy"],
    ["Real-time Analysis", "Live pulse"],
    ["10,000+ Diseases", "Mapped"]
  ];
  return (
    <div className="pointer-events-none absolute right-6 top-28 hidden w-[360px] space-y-5 xl:block">
      {stats.map((item, index) => (
        <motion.div
          key={item[0]}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
          transition={{ opacity: { delay: 0.6 + index * 0.12 }, x: { delay: 0.6 + index * 0.12 }, y: { repeat: Infinity, duration: 4 + index } }}
          className="glass-panel rounded-2xl p-5"
          style={{ transform: `perspective(700px) rotateY(${-8 + index * 4}deg)` }}
        >
          <p className="font-display text-sm text-bio-cyan">{item[0]}</p>
          <p className="mt-2 font-mono text-2xl font-black text-bio-ice">{item[1]}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-button-gradient" initial={{ width: "0%" }} animate={{ width: `${86 + index * 5}%` }} transition={{ duration: 1.2, delay: 0.8 }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const testimonials = [
  { name: "Avery M.", quote: "The report explained why the AI reached its prediction, which made the next doctor visit much easier." },
  { name: "Jordan K.", quote: "The emergency alert was direct and impossible to miss. Exactly what healthcare software should do." },
  { name: "Priya S.", quote: "Fast, beautiful, and surprisingly practical. I could track symptoms and download a PDF in minutes." }
];
