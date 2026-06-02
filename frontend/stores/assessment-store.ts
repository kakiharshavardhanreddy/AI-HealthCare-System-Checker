"use client";

import { create } from "zustand";

import type { MedicalHistory, PatientInfo, Prediction, Report } from "@/lib/types";

type AssessmentState = {
  step: number;
  patientInfo: PatientInfo;
  medicalHistory: MedicalHistory;
  selectedSymptoms: string[];
  followUpAnswers: Record<string, unknown>;
  prediction: Prediction | null;
  report: Report | null;
  setStep: (step: number) => void;
  setPatientInfo: (patientInfo: PatientInfo) => void;
  setMedicalHistory: (medicalHistory: MedicalHistory) => void;
  toggleSymptom: (symptom: string) => void;
  setFollowUpAnswer: (key: string, value: unknown) => void;
  setPrediction: (prediction: Prediction) => void;
  setReport: (report: Report) => void;
  reset: () => void;
};

const initialPatient: PatientInfo = {
  full_name: "",
  age: 30,
  gender: "prefer_not_to_say",
  blood_group: "Unknown",
  height_cm: 170,
  weight_kg: 70
};

const initialHistory: MedicalHistory = {
  conditions: [],
  allergies: [],
  medications: [],
  surgeries: [],
  family_history: []
};

export const useAssessmentStore = create<AssessmentState>((set) => ({
  step: 1,
  patientInfo: initialPatient,
  medicalHistory: initialHistory,
  selectedSymptoms: [],
  followUpAnswers: {},
  prediction: null,
  report: null,
  setStep: (step) => set({ step }),
  setPatientInfo: (patientInfo) => set({ patientInfo }),
  setMedicalHistory: (medicalHistory) => set({ medicalHistory }),
  toggleSymptom: (symptom) =>
    set((state) => ({
      selectedSymptoms: state.selectedSymptoms.includes(symptom)
        ? state.selectedSymptoms.filter((item) => item !== symptom)
        : [...state.selectedSymptoms, symptom]
    })),
  setFollowUpAnswer: (key, value) =>
    set((state) => ({ followUpAnswers: { ...state.followUpAnswers, [key]: value } })),
  setPrediction: (prediction) => set({ prediction }),
  setReport: (report) => set({ report }),
  reset: () =>
    set({
      step: 1,
      patientInfo: initialPatient,
      medicalHistory: initialHistory,
      selectedSymptoms: [],
      followUpAnswers: {},
      prediction: null,
      report: null
    })
}));
