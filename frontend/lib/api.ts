import type {
  DashboardCharts,
  DashboardOverview,
  Doctor,
  FollowUpQuestion,
  MedicalHistory,
  NotificationItem,
  Prediction,
  PrescriptionScan,
  Report,
  Symptom,
  TokenPair,
  User
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
  formData?: FormData;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {};
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (!options.formData) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.formData ?? (options.body ? JSON.stringify(options.body) : undefined),
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(payload?.error?.message ?? "Request failed", response.status, payload?.error?.detail ?? payload);
  }
  return response.json() as Promise<T>;
}

export const api = {
  register: (body: { full_name: string; email: string; password: string }) =>
    request<TokenPair>("/auth/register", { method: "POST", body }),
  login: (body: { email: string; password: string }) => request<TokenPair>("/auth/login", { method: "POST", body }),
  logout: (token: string) => request<{ message: string }>("/auth/logout", { method: "POST", token }),
  me: (token: string) => request<User>("/auth/me", { token }),
  forgotPassword: (email: string) => request<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } }),
  symptoms: (token: string, params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    return request<Symptom[]>(`/symptoms${query.size ? `?${query}` : ""}`, { token });
  },
  medicalHistory: (token: string) => request<MedicalHistory>("/medical-history", { token }),
  saveMedicalHistory: (token: string, body: MedicalHistory) =>
    request<MedicalHistory>("/medical-history", { method: "PUT", token, body }),
  questions: (token: string, symptomKeys: string[]) => {
    const query = new URLSearchParams();
    symptomKeys.forEach((item) => query.append("symptom_keys", item));
    return request<FollowUpQuestion[]>(`/symptoms/questions?${query}`, { token });
  },
  analyze: (token: string, body: unknown) => request<Prediction>("/predictions/analyze", { method: "POST", token, body }),
  predictions: (token: string) => request<Prediction[]>("/predictions", { token }),
  prediction: (token: string, id: number) => request<Prediction>(`/predictions/${id}`, { token }),
  createReport: (token: string, prediction_id: number) =>
    request<Report>("/reports", { method: "POST", token, body: { prediction_id } }),
  reports: (token: string) => request<Report[]>("/reports", { token }),
  report: (token: string, id: number) => request<Report>(`/reports/${id}`, { token }),
  emailReport: (token: string, id: number) => request<{ message: string }>(`/reports/${id}/email`, { method: "POST", token }),
  overview: (token: string) => request<DashboardOverview>("/dashboard/overview", { token }),
  charts: (token: string) => request<DashboardCharts>("/dashboard/charts", { token }),
  history: (token: string) => request<Prediction[]>("/dashboard/history", { token }),
  doctors: (token: string, specialty?: string) =>
    request<Doctor[]>(`/doctors${specialty ? `?specialty=${encodeURIComponent(specialty)}` : ""}`, { token }),
  notifications: (token: string) => request<NotificationItem[]>("/notifications", { token }),
  readNotifications: (token: string) => request<{ message: string }>("/notifications/read-all", { method: "PATCH", token }),
  chat: (token: string, body: { session_id: string; message: string }) =>
    request<{ answer: string; safety_level: string; messages: { role: string; content: string; created_at: string }[] }>("/chatbot/message", {
      method: "POST",
      token,
      body
    }),
  scan: (token: string, formData: FormData) => request<PrescriptionScan>("/ocr/scan", { method: "POST", token, formData }),
  scans: (token: string) => request<PrescriptionScan[]>("/ocr/scans", { token }),
  adminOverview: (token: string) =>
    request<{
      users: number;
      assessments: number;
      high_risk_alerts: number;
      scans: number;
      user_distribution: { region: string; users: number }[];
      activity: { title: string; message: string; type: string; created_at: string }[];
    }>("/admin/overview", { token }),
  adminUsers: (token: string, search?: string) =>
    request<User[]>(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`, { token }),
  suspendUser: (token: string, id: number) => request<{ message: string }>(`/admin/users/${id}/suspend`, { method: "PATCH", token })
};

export function reportDownloadUrl(reportId: number) {
  return `${API_URL}/api/v1/reports/${reportId}/download`;
}
