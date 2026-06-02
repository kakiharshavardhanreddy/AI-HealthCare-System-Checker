"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  HeartPulse,
  Mail,
  Pill,
  Search,
  Share2,
  Stethoscope,
  User,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button3D } from "@/components/design/button-3d";
import { GlassCard } from "@/components/design/glass-card";
import { GlowInput } from "@/components/design/glow-input";
import { SeverityBadge } from "@/components/design/severity-badge";
import { Skeleton } from "@/components/design/loading";
import { AnalysisBrainScene, PatientAvatarScene } from "@/components/three/fallback-scenes";
import { api, reportDownloadUrl } from "@/lib/api";
import type { FollowUpQuestion, Symptom } from "@/lib/types";
import { cn, formatPercent } from "@/lib/utils";
import { patientSchema } from "@/lib/validators";
import { useAssessmentStore } from "@/stores/assessment-store";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useUiStore } from "@/stores/ui-store";

type PatientValues = z.infer<typeof patientSchema>;

const steps = [
  "Patient Info",
  "Medical History",
  "Symptoms",
  "Follow-Up",
  "AI Analysis",
  "Results",
  "Body Map",
  "Recommendations",
  "Report"
];

const conditionCards = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart disease",
  "Kidney disease",
  "Pregnancy",
  "Immunocompromised",
  "Recent surgery",
  "Medication allergies"
];

const categories = ["All", "Head", "Chest", "Abdomen", "Limbs", "Skin", "Mental", "General"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

export function AssessmentFlow() {
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const store = useAssessmentStore();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [view, setView] = useState<"front" | "back">("front");
  const [historyHydrated, setHistoryHydrated] = useState(false);
  const pushToast = useNotificationStore((state) => state.pushToast);
  const showEmergency = useUiStore((state) => state.showEmergency);

  const symptomsQuery = useQuery({
    queryKey: ["symptoms", category, search],
    queryFn: () => api.symptoms(token!, { category, search }),
    enabled: Boolean(token)
  });

  const questionsQuery = useQuery({
    queryKey: ["questions", store.selectedSymptoms],
    queryFn: () => api.questions(token!, store.selectedSymptoms),
    enabled: Boolean(token && store.selectedSymptoms.length > 0)
  });

  const medicalHistoryQuery = useQuery({
    queryKey: ["medical-history"],
    queryFn: () => api.medicalHistory(token!),
    enabled: Boolean(token)
  });

  const doctorsQuery = useQuery({
    queryKey: ["doctors", store.prediction?.predicted_disease],
    queryFn: () => api.doctors(token!, store.prediction?.recommendations.doctors?.[0]),
    enabled: Boolean(token && store.step >= 8)
  });

  useEffect(() => {
    if (user && !store.patientInfo.full_name) {
      store.setPatientInfo({ ...store.patientInfo, full_name: user.full_name });
    }
  }, [store, user]);

  useEffect(() => {
    if (!medicalHistoryQuery.data || historyHydrated) return;
    store.setMedicalHistory({
      conditions: medicalHistoryQuery.data.conditions ?? [],
      allergies: medicalHistoryQuery.data.allergies ?? [],
      medications: medicalHistoryQuery.data.medications ?? [],
      surgeries: medicalHistoryQuery.data.surgeries ?? [],
      family_history: medicalHistoryQuery.data.family_history ?? []
    });
    setHistoryHydrated(true);
  }, [historyHydrated, medicalHistoryQuery.data, store]);

  useEffect(() => {
    if (store.step !== 5 || !token || store.prediction || analysisProgress > 0) return;
    let progress = 0;
    const timer = window.setInterval(() => {
      progress = Math.min(progress + 12, 96);
      setAnalysisProgress(progress);
    }, 420);

    async function run() {
      try {
        const prediction = await api.analyze(token!, {
          patient_info: store.patientInfo,
          medical_history: store.medicalHistory,
          symptom_keys: store.selectedSymptoms,
          follow_up_answers: store.followUpAnswers
        });
        store.setPrediction(prediction);
        const report = await api.createReport(token!, prediction.id);
        store.setReport(report);
        setAnalysisProgress(100);
        if (prediction.severity === "High") {
          showEmergency(prediction.predicted_disease, "Seek immediate medical attention or call your local emergency number.");
        }
        pushToast({ title: "Assessment complete", message: `${prediction.predicted_disease} predicted with ${formatPercent(prediction.confidence)} confidence.`, type: prediction.severity === "High" ? "danger" : "success" });
        window.setTimeout(() => store.setStep(6), 700);
      } catch (error) {
        setAnalysisError(error instanceof Error ? error.message : "Analysis failed");
      } finally {
        window.clearInterval(timer);
      }
    }

    run();
    return () => window.clearInterval(timer);
  }, [analysisProgress, pushToast, showEmergency, store, token]);

  const selectedSymptomNames = useMemo(() => {
    const map = new Map((symptomsQuery.data ?? []).map((symptom) => [symptom.feature_key, symptom.name]));
    return store.selectedSymptoms.map((key) => map.get(key) ?? key.replaceAll("_", " "));
  }, [store.selectedSymptoms, symptomsQuery.data]);

  return (
    <div className="space-y-6">
      <ProgressNav current={store.step} />
      <motion.div key={store.step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
        {store.step === 1 ? <PatientStep /> : null}
        {store.step === 2 ? <HistoryStep /> : null}
        {store.step === 3 ? (
          <SymptomsStep
            symptoms={symptomsQuery.data ?? []}
            loading={symptomsQuery.isLoading}
            category={category}
            search={search}
            setCategory={setCategory}
            setSearch={setSearch}
            selectedNames={selectedSymptomNames}
          />
        ) : null}
        {store.step === 4 ? (
          <FollowUpStep
            questions={questionsQuery.data ?? []}
            loading={questionsQuery.isLoading}
            index={questionIndex}
            setIndex={setQuestionIndex}
          />
        ) : null}
        {store.step === 5 ? <AnalysisStep progress={analysisProgress} error={analysisError} /> : null}
        {store.step === 6 && store.prediction ? <ResultsStep /> : null}
        {store.step === 7 && store.prediction ? <BodyStep view={view} setView={setView} symptoms={symptomsQuery.data ?? []} /> : null}
        {store.step === 8 && store.prediction ? <RecommendationsStep doctors={doctorsQuery.data ?? []} loading={doctorsQuery.isLoading} /> : null}
        {store.step === 9 && store.prediction ? <ReportStep /> : null}
      </motion.div>
    </div>
  );
}

function ProgressNav({ current }: { current: number }) {
  const store = useAssessmentStore();
  return (
    <GlassCard hover={false} className="p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-bio-muted">
        <span>Step {current} of {steps.length}</span>
        <span>{steps[current - 1]}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full bg-button-gradient" animate={{ width: `${(current / steps.length) * 100}%` }} />
      </div>
      <div className="mt-4 hidden grid-cols-9 gap-2 lg:grid">
        {steps.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => index + 1 < 5 || store.prediction ? store.setStep(index + 1) : undefined}
            className={cn("rounded-lg border px-2 py-2 text-[11px] transition", current === index + 1 ? "border-bio-cyan bg-bio-cyan/10 text-bio-cyan" : "border-bio-cyan/10 text-bio-muted")}
          >
            {index + 1}. {step}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

function PatientStep() {
  const store = useAssessmentStore();
  const form = useForm<PatientValues>({ resolver: zodResolver(patientSchema), defaultValues: store.patientInfo });

  return (
    <GlassCard hover={false} className="mx-auto max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={form.handleSubmit((values) => {
            store.setPatientInfo(values);
            store.setStep(2);
          })}
          className="space-y-5"
        >
          <StepTitle title="Patient Information" text="Tell HealthAI who the assessment is for." />
          <div className="grid gap-4 md:grid-cols-2">
            <GlowInput label="Full Name" icon={<User className="h-4 w-4" />} error={form.formState.errors.full_name?.message} {...form.register("full_name")} />
            <GlowInput label="Age" type="number" error={form.formState.errors.age?.message} {...form.register("age")} />
            <label className="block">
              <span className="mb-2 block text-sm text-bio-muted">Gender</span>
              <select className="h-14 w-full rounded-[10px] border border-bio-cyan/20 bg-black/40 px-4 text-bio-ice outline-none focus:border-bio-cyan/80" {...form.register("gender")}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non_binary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </label>
            <div>
              <span className="mb-2 block text-sm text-bio-muted">Blood Group</span>
              <div className="grid grid-cols-3 gap-2">
                {bloodGroups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => form.setValue("blood_group", group)}
                    className={cn("rounded-full border px-3 py-2 text-sm transition", form.watch("blood_group") === group ? "border-bio-cyan bg-bio-cyan/10 text-bio-cyan" : "border-bio-cyan/15 text-bio-muted hover:border-bio-cyan/50")}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
            <GlowInput label="Height (cm)" type="number" error={form.formState.errors.height_cm?.message} {...form.register("height_cm")} />
            <GlowInput label="Weight (kg)" type="number" error={form.formState.errors.weight_kg?.message} {...form.register("weight_kg")} />
          </div>
          <StepActions hideBack nextLabel="Continue" />
        </form>
        <div className="rounded-2xl border border-bio-cyan/15 bg-black/20">
          <PatientAvatarScene age={Number(form.watch("age"))} gender={form.watch("gender")} />
        </div>
      </div>
    </GlassCard>
  );
}

function HistoryStep() {
  const token = useAuthStore((state) => state.accessToken);
  const store = useAssessmentStore();
  const [allergies, setAllergies] = useState(store.medicalHistory.allergies.join(", "));
  const [medications, setMedications] = useState(store.medicalHistory.medications.join(", "));
  const [saving, setSaving] = useState(false);

  function toggle(condition: string) {
    const next = store.medicalHistory.conditions.includes(condition)
      ? store.medicalHistory.conditions.filter((item) => item !== condition)
      : [...store.medicalHistory.conditions, condition];
    store.setMedicalHistory({ ...store.medicalHistory, conditions: next });
  }

  return (
    <GlassCard hover={false} className="mx-auto max-w-5xl">
      <StepTitle title="Medical History" text="Select relevant conditions and add medication context." />
      <div className="grid gap-4 md:grid-cols-3">
        {conditionCards.map((condition) => {
          const active = store.medicalHistory.conditions.includes(condition);
          return (
            <button
              key={condition}
              type="button"
              onClick={() => toggle(condition)}
              className={cn("rounded-2xl border p-5 text-left transition", active ? "border-bio-cyan bg-bio-cyan/10 shadow-neon" : "border-bio-cyan/15 bg-black/20 hover:border-bio-cyan/40")}
            >
              <HeartPulse className={cn("mb-4 h-6 w-6", active ? "text-bio-cyan" : "text-bio-muted")} />
              <p className="font-semibold text-bio-ice">{condition}</p>
              <p className="mt-2 text-sm text-bio-muted">{active ? "Flagged for AI context" : "Tap to include"}</p>
            </button>
          );
        })}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <GlowInput label="Allergies (comma separated)" value={allergies} onChange={(event) => setAllergies(event.target.value)} />
        <GlowInput label="Current Medications" value={medications} onChange={(event) => setMedications(event.target.value)} />
      </div>
      <div className="mt-8 flex justify-between gap-3">
        <Button3D variant="secondary" type="button" onClick={() => store.setStep(1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button3D>
        <Button3D
          type="button"
          loading={saving}
          onClick={async () => {
            const nextHistory = {
              ...store.medicalHistory,
              allergies: splitList(allergies),
              medications: splitList(medications)
            };
            store.setMedicalHistory(nextHistory);
            if (token) {
              setSaving(true);
              try {
                await api.saveMedicalHistory(token, nextHistory);
              } finally {
                setSaving(false);
              }
            }
            store.setStep(3);
          }}
        >
          Save & Continue
          <ArrowRight className="h-4 w-4" />
        </Button3D>
      </div>
    </GlassCard>
  );
}

function SymptomsStep({
  symptoms,
  loading,
  category,
  search,
  setCategory,
  setSearch,
  selectedNames
}: {
  symptoms: Symptom[];
  loading: boolean;
  category: string;
  search: string;
  setCategory: (value: string) => void;
  setSearch: (value: string) => void;
  selectedNames: string[];
}) {
  const store = useAssessmentStore();
  return (
    <GlassCard hover={false}>
      <StepTitle title="Symptom Selection" text="Search and choose every symptom that applies right now." />
      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bio-cyan" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search symptoms..." className="h-12 w-full rounded-xl border border-bio-cyan/20 bg-black/40 pl-11 pr-4 outline-none focus:border-bio-cyan/80" />
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} className={cn("rounded-full border px-4 py-2 text-sm transition", category === item ? "border-bio-cyan bg-bio-cyan/10 text-bio-cyan" : "border-bio-cyan/15 text-bio-muted")}>
              {item}
            </button>
          ))}
        </div>
      </div>
      {selectedNames.length ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {selectedNames.map((name, index) => (
            <span key={`${name}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-bio-cyan/30 bg-bio-cyan/10 px-3 py-1 text-sm text-bio-cyan">
              {name}
              <button type="button" onClick={() => store.toggleSymptom(store.selectedSymptoms[index])} aria-label={`Remove ${name}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-36" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {symptoms.map((symptom) => {
            const selected = store.selectedSymptoms.includes(symptom.feature_key);
            return (
              <motion.button
                whileTap={{ scale: 0.96 }}
                key={symptom.id}
                type="button"
                onClick={() => store.toggleSymptom(symptom.feature_key)}
                className={cn("relative min-h-36 rounded-2xl border p-4 text-left transition", selected ? "scale-[1.02] border-bio-cyan bg-bio-cyan/10 shadow-neon" : "border-bio-cyan/15 bg-black/20 hover:border-bio-cyan/50")}
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-button-gradient">
                  <Activity className="h-5 w-5" />
                </div>
                <p className="font-display text-sm font-bold text-bio-ice">{symptom.name}</p>
                <p className="mt-2 text-xs text-bio-muted">{symptom.category} / {symptom.body_area}</p>
                {selected ? <Check className="absolute right-4 top-4 h-5 w-5 text-bio-cyan" /> : null}
              </motion.button>
            );
          })}
        </div>
      )}
      <StepActions onNext={() => store.selectedSymptoms.length ? store.setStep(4) : undefined} nextDisabled={!store.selectedSymptoms.length} />
    </GlassCard>
  );
}

function FollowUpStep({ questions, loading, index, setIndex }: { questions: FollowUpQuestion[]; loading: boolean; index: number; setIndex: (value: number) => void }) {
  const store = useAssessmentStore();
  const question = questions[index];
  if (loading) return <GlassCard hover={false}><Skeleton className="h-72" /></GlassCard>;
  if (!question) {
    return (
      <GlassCard hover={false} className="mx-auto max-w-3xl text-center">
        <StepTitle title="Follow-Up Questions" text="No additional follow-up questions are needed for this symptom set." />
        <Button3D className="mt-6" onClick={() => store.setStep(5)}>
          Begin AI Analysis
        </Button3D>
      </GlassCard>
    );
  }

  const answerKey = `q_${question.id}`;
  const answer = store.followUpAnswers[answerKey];
  return (
    <GlassCard hover={false} className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between text-sm text-bio-muted">
        <span>Question {index + 1} of {questions.length}</span>
        <div className="flex gap-2">
          {questions.map((item, dot) => <span key={item.id} className={cn("h-2 w-2 rounded-full", dot <= index ? "bg-bio-cyan" : "bg-white/20")} />)}
        </div>
      </div>
      <motion.h2 key={question.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-3xl font-black leading-tight text-bio-ice">
        {question.question}
      </motion.h2>
      {question.question_type === "scale" ? (
        <div className="mt-10">
          <input type="range" min={1} max={10} value={Number(answer ?? 5)} onChange={(event) => store.setFollowUpAnswer(answerKey, Number(event.target.value))} className="w-full accent-bio-cyan" />
          <div className="mt-3 flex justify-between font-mono text-sm text-bio-muted">
            <span>1</span>
            <span className="text-bio-cyan">Pain {String(answer ?? 5)}/10</span>
            <span>10</span>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {question.options.map((option) => (
            <button key={String(option.value)} type="button" onClick={() => store.setFollowUpAnswer(answerKey, option.value)} className={cn("rounded-full border px-5 py-4 text-left transition", answer === option.value ? "border-bio-cyan bg-bio-cyan/10 text-bio-cyan" : "border-bio-cyan/15 text-bio-muted hover:border-bio-cyan/50")}>
              {option.label}
            </button>
          ))}
        </div>
      )}
      <div className="mt-8 flex justify-between gap-3">
        <Button3D variant="secondary" onClick={() => (index === 0 ? store.setStep(3) : setIndex(index - 1))}>
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button3D>
        <Button3D onClick={() => (index === questions.length - 1 ? store.setStep(5) : setIndex(index + 1))}>
          {index === questions.length - 1 ? "Analyze" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </Button3D>
      </div>
    </GlassCard>
  );
}

function AnalysisStep({ progress, error }: { progress: number; error: string | null }) {
  const statuses = [
    ["Symptoms received", progress > 10],
    ["Analyzing patterns...", progress > 35],
    ["Calculating risk score", progress > 62],
    ["Generating recommendations", progress > 88]
  ] as const;
  return (
    <GlassCard hover={false} className="mx-auto max-w-5xl text-center">
      <h2 className="font-display text-3xl font-black text-bio-ice">AI is analyzing your symptoms...</h2>
      <AnalysisBrainScene progress={progress} />
      <div className="mx-auto max-w-lg space-y-3 text-left">
        {statuses.map(([label, done]) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-bio-cyan/10 bg-black/20 p-3">
            {done ? <Check className="h-5 w-5 text-bio-cyan" /> : <Activity className="h-5 w-5 animate-spin text-bio-muted" />}
            <span className={done ? "text-bio-ice" : "text-bio-muted"}>{label}</span>
          </div>
        ))}
      </div>
      {error ? <p className="mt-6 rounded-xl border border-bio-danger/30 bg-bio-danger/10 p-3 text-bio-danger">{error}</p> : null}
    </GlassCard>
  );
}

function ResultsStep() {
  const store = useAssessmentStore();
  const prediction = store.prediction!;
  return (
    <GlassCard hover={false}>
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="text-center">
          <p className="font-display text-xs uppercase tracking-[0.22em] text-bio-cyan">Predicted Condition</p>
          <h2 className="mt-4 bg-gradient-to-r from-bio-cyan to-bio-violet bg-clip-text font-display text-5xl font-black text-transparent">{prediction.predicted_disease}</h2>
          <div className="mx-auto mt-8 grid h-48 w-48 place-items-center rounded-full border-[10px] border-bio-cyan shadow-neon">
            <span className="font-mono text-5xl font-black text-bio-cyan">{Math.round(prediction.confidence)}%</span>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <SeverityBadge severity={prediction.severity} />
            <span className="rounded-full border border-bio-cyan/25 px-3 py-1 font-mono text-sm text-bio-cyan">Risk {prediction.risk_score}/100</span>
          </div>
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold text-bio-ice">Disease Comparison</h3>
          <div className="mt-5 space-y-4">
            {prediction.top_diseases.map((item, index) => (
              <div key={item.disease}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-bio-ice">{item.disease}</span>
                  <span className="font-mono text-bio-cyan">{item.probability}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full bg-button-gradient" initial={{ width: 0 }} animate={{ width: `${item.probability}%` }} transition={{ delay: index * 0.12 }} />
                </div>
              </div>
            ))}
          </div>
          <h3 className="mt-9 font-display text-2xl font-bold text-bio-ice">Why AI Predicted This</h3>
          <div className="mt-5 space-y-3">
            {prediction.feature_importance.map((item) => (
              <div key={item.feature_key} className="rounded-xl border border-bio-cyan/10 bg-black/20 p-4">
                <div className="mb-2 flex justify-between">
                  <span className={item.match_strength === "strong" ? "text-bio-cyan" : "text-bio-warning"}>{item.symptom}</span>
                  <span className="font-mono text-sm text-bio-muted">{item.importance}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={cn("h-full rounded-full", item.match_strength === "strong" ? "bg-bio-cyan" : "bg-bio-warning")} style={{ width: `${Math.min(item.importance * 10, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <StepActions onNext={() => store.setStep(7)} nextLabel="View Body Map" />
    </GlassCard>
  );
}

function BodyStep({ view, setView, symptoms }: { view: "front" | "back"; setView: (view: "front" | "back") => void; symptoms: Symptom[] }) {
  const store = useAssessmentStore();
  const selected = symptoms.filter((symptom) => store.selectedSymptoms.includes(symptom.feature_key));
  const areas = Array.from(new Set(selected.map((symptom) => symptom.body_area)));
  return (
    <GlassCard hover={false}>
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div>
          <StepTitle title="Body Visualization" text="Affected areas pulse by selected symptom location." />
          <div className="mb-6 flex gap-2">
            {(["front", "back"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setView(item)} className={cn("rounded-full border px-4 py-2 text-sm capitalize", view === item ? "border-bio-cyan bg-bio-cyan/10 text-bio-cyan" : "border-bio-cyan/15 text-bio-muted")}>
                {item} view
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {areas.map((area) => (
              <div key={area} className="flex items-center justify-between rounded-xl border border-bio-cyan/10 bg-black/20 p-3">
                <span className="text-bio-ice">{area}</span>
                <SeverityBadge severity={store.prediction!.severity} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="relative w-full max-w-sm transition-transform duration-300 hover:rotate-1">
            <HumanBodySvg areas={areas} severity={store.prediction!.severity} view={view} />
          </div>
        </div>
      </div>
      <StepActions onNext={() => store.setStep(8)} nextLabel="Recommendations" />
    </GlassCard>
  );
}

function RecommendationsStep({ doctors, loading }: { doctors: { id: number; name: string; specialty: string; rating: number; experience_years: number; available_today: boolean }[]; loading: boolean }) {
  const store = useAssessmentStore();
  const prediction = store.prediction!;
  return (
    <GlassCard hover={false}>
      <div className="grid gap-5 xl:grid-cols-3">
        <RecommendationColumn title="Home Care" icon={<HeartPulse className="h-5 w-5" />} items={prediction.recommendations.home_care} />
        <RecommendationColumn title="Medications" icon={<Pill className="h-5 w-5" />} items={prediction.recommendations.medications} />
        <div className="rounded-2xl border border-bio-cyan/15 bg-black/20 p-5">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold text-bio-ice"><Stethoscope className="h-5 w-5 text-bio-cyan" /> Doctors</h3>
          <div className="mt-5 space-y-4">
            {loading ? <Skeleton className="h-32" /> : doctors.map((doctor) => (
              <div key={doctor.id} className="rounded-xl border border-bio-cyan/10 bg-bio-panel/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-button-gradient font-display font-black">{doctor.name[0]}</div>
                  <div>
                    <p className="font-semibold text-bio-ice">{doctor.name}</p>
                    <p className="font-display text-xs text-bio-cyan">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-between text-sm text-bio-muted">
                  <span>Star {doctor.rating}</span>
                  <span>{doctor.experience_years} years</span>
                </div>
                <p className="mt-2 text-sm text-bio-success">Available Today</p>
                <Button3D variant="secondary" fullWidth className="mt-4 min-h-10 py-2 text-xs">
                  Book Appointment
                </Button3D>
              </div>
            ))}
          </div>
        </div>
      </div>
      <StepActions onNext={() => store.setStep(9)} nextLabel="Build Report" />
    </GlassCard>
  );
}

function ReportStep() {
  const token = useAuthStore((state) => state.accessToken);
  const store = useAssessmentStore();
  const report = store.report;
  const prediction = store.prediction!;
  const pushToast = useNotificationStore((state) => state.pushToast);

  async function download() {
    if (!token || !report) return;
    const response = await fetch(reportDownloadUrl(report.id), { headers: { Authorization: `Bearer ${token}` } });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `healthai-report-${report.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function email() {
    if (!token || !report) return;
    await api.emailReport(token, report.id);
    pushToast({ title: "Report email queued", message: "Your report email request was saved.", type: "success" });
  }

  return (
    <GlassCard hover={false} className="mx-auto max-w-5xl">
      <div className="rounded-2xl border border-bio-cyan/15 bg-slate-950/80 p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-bio-cyan/15 pb-5 md:flex-row md:items-center">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.18em] text-bio-cyan">HealthAI</p>
            <h2 className="mt-2 font-display text-3xl font-black text-bio-ice">Health Assessment Report</h2>
          </div>
          <p className="font-mono text-sm text-bio-muted">{new Date().toLocaleString()}</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ReportRow label="Patient" value={prediction.patient_info.full_name} />
          <ReportRow label="Diagnosis" value={prediction.predicted_disease} />
          <ReportRow label="Confidence" value={formatPercent(prediction.confidence)} />
          <ReportRow label="Severity" value={prediction.severity} />
        </div>
        <div className="mt-6 rounded-xl border border-bio-cyan/10 bg-black/20 p-4">
          <p className="font-semibold text-bio-ice">Symptoms</p>
          <p className="mt-2 text-bio-muted">{prediction.symptom_keys.join(", ")}</p>
        </div>
        <div className="mt-4 rounded-xl border border-bio-cyan/10 bg-black/20 p-4">
          <p className="font-semibold text-bio-ice">Recommendations</p>
          <ul className="mt-2 space-y-1 text-bio-muted">
            {prediction.recommendations.home_care.map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button3D onClick={download}>
          <Download className="h-4 w-4" />
          Download PDF
        </Button3D>
        <Button3D variant="secondary" onClick={email}>
          <Mail className="h-4 w-4" />
          Email Report
        </Button3D>
        <Button3D variant="secondary" onClick={() => navigator.clipboard.writeText(window.location.href)}>
          <Share2 className="h-4 w-4" />
          Share
        </Button3D>
      </div>
    </GlassCard>
  );
}

function StepTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-6">
      <p className="font-display text-xs uppercase tracking-[0.22em] text-bio-cyan">Assessment</p>
      <h2 className="mt-2 font-display text-3xl font-black text-bio-ice">{title}</h2>
      <p className="mt-2 text-bio-muted">{text}</p>
    </div>
  );
}

function StepActions({ onNext, nextLabel = "Next", nextDisabled, hideBack }: { onNext?: () => void; nextLabel?: string; nextDisabled?: boolean; hideBack?: boolean }) {
  const store = useAssessmentStore();
  return (
    <div className="mt-8 flex justify-between gap-3">
      {hideBack ? <span /> : (
        <Button3D variant="secondary" type="button" onClick={() => store.setStep(Math.max(store.step - 1, 1))}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button3D>
      )}
      <Button3D type={onNext ? "button" : "submit"} disabled={nextDisabled} onClick={onNext}>
        {nextLabel}
        <ArrowRight className="h-4 w-4" />
      </Button3D>
    </div>
  );
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function RecommendationColumn({ title, icon, items }: { title: string; icon: ReactNode; items: string[] }) {
  return (
    <div className="rounded-2xl border border-bio-cyan/15 bg-black/20 p-5">
      <h3 className="flex items-center gap-2 font-display text-xl font-bold text-bio-ice">
        <span className="text-bio-cyan">{icon}</span>
        {title}
      </h3>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item} className="rounded-xl border border-bio-cyan/10 bg-bio-panel/50 p-4 text-bio-muted">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-bio-cyan/10 bg-black/20 p-4">
      <p className="text-sm text-bio-muted">{label}</p>
      <p className="mt-1 font-semibold text-bio-ice">{value}</p>
    </div>
  );
}

function HumanBodySvg({ areas, severity, view }: { areas: string[]; severity: string; view: "front" | "back" }) {
  const danger = severity === "High" ? "#ef4444" : severity === "Moderate" ? "#f59e0b" : "#00d4ff";
  const active = (area: string) => areas.some((item) => item.toLowerCase().includes(area));
  return (
    <svg viewBox="0 0 260 520" className="w-full drop-shadow-[0_0_30px_rgba(0,212,255,0.25)]">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <circle cx="130" cy="62" r="40" fill={active("head") || active("face") || active("brain") || active("eyes") ? danger : "#0a1628"} stroke="#00d4ff" strokeWidth="2" filter="url(#glow)" />
      <rect x="82" y="112" width="96" height="150" rx="42" fill={active("chest") || active("heart") || active("lungs") || active("respiratory") ? danger : "#0a1628"} stroke="#00d4ff" strokeWidth="2" filter="url(#glow)" />
      <rect x="88" y="252" width="84" height="100" rx="34" fill={active("abdomen") || active("stomach") || active("pelvis") || active("urinary") ? danger : "#0a1628"} stroke="#00d4ff" strokeWidth="2" filter="url(#glow)" />
      <path d="M82 130 C35 160 34 245 52 320" fill="none" stroke={active("arm") || active("hands") ? danger : "#00d4ff"} strokeWidth="20" strokeLinecap="round" filter="url(#glow)" />
      <path d="M178 130 C225 160 226 245 208 320" fill="none" stroke={active("arm") || active("hands") ? danger : "#00d4ff"} strokeWidth="20" strokeLinecap="round" filter="url(#glow)" />
      <path d="M104 344 C80 410 78 465 86 505" fill="none" stroke={active("leg") || active("limbs") ? danger : "#00d4ff"} strokeWidth="22" strokeLinecap="round" filter="url(#glow)" />
      <path d="M156 344 C180 410 182 465 174 505" fill="none" stroke={active("leg") || active("limbs") ? danger : "#00d4ff"} strokeWidth="22" strokeLinecap="round" filter="url(#glow)" />
      <text x="130" y="500" fill="#94a3b8" fontSize="12" textAnchor="middle">{view.toUpperCase()} VIEW</text>
    </svg>
  );
}
