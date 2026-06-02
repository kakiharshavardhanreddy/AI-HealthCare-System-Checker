export type User = {
  id: number;
  email: string;
  full_name: string;
  role: "user" | "admin";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  user: User;
};

export type Symptom = {
  id: number;
  name: string;
  feature_key: string;
  category: string;
  body_area: string;
  emergency_weight: number;
  description: string;
};

export type FollowUpQuestion = {
  id: number;
  symptom_id: number;
  question: string;
  question_type: "scale" | "single_choice";
  options: { label: string; value: string | number }[];
  weight: number;
};

export type PatientInfo = {
  full_name: string;
  age: number;
  gender: "female" | "male" | "non_binary" | "prefer_not_to_say";
  blood_group: string;
  height_cm: number;
  weight_kg: number;
};

export type MedicalHistory = {
  conditions: string[];
  allergies: string[];
  medications: string[];
  surgeries: string[];
  family_history: string[];
};

export type Prediction = {
  id: number;
  patient_info: PatientInfo;
  medical_history_snapshot: MedicalHistory;
  symptom_keys: string[];
  follow_up_answers: Record<string, unknown>;
  predicted_disease: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High";
  risk_score: number;
  top_diseases: { disease: string; probability: number }[];
  feature_importance: { symptom: string; feature_key: string; importance: number; match_strength: "strong" | "partial" }[];
  recommendations: {
    home_care: string[];
    medications: string[];
    doctors: string[];
    disclaimer: string;
  };
  created_at: string;
};

export type Report = {
  id: number;
  user_id: number;
  prediction_id: number;
  title: string;
  report_data: Record<string, unknown>;
  created_at: string;
};

export type Doctor = {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  experience_years: number;
  available_today: boolean;
  city: string;
};

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "danger";
  is_read: boolean;
  payload: Record<string, unknown>;
  created_at: string;
};

export type DashboardOverview = {
  total_assessments: number;
  average_confidence: number;
  high_risk_count: number;
  reports_generated: number;
  trends: Record<string, number>;
};

export type DashboardCharts = {
  symptom_frequency: { symptom: string; count: number }[];
  disease_distribution: { name: string; value: number }[];
  risk_trend: { date: string; risk: number }[];
  weekly_activity: { week: string; assessments: number }[];
};

export type PrescriptionScan = {
  id: number;
  filename: string;
  content_type: string;
  status: string;
  extracted_medicines: { name: string; dosage: string; instructions: string; confidence: number }[];
  confidence: number;
  raw_text: string;
  created_at: string;
};
