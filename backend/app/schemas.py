from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime


class AdminUserOut(UserOut):
    last_login_at: datetime | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class MedicalHistoryIn(BaseModel):
    conditions: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    medications: list[str] = Field(default_factory=list)
    surgeries: list[str] = Field(default_factory=list)
    family_history: list[str] = Field(default_factory=list)


class MedicalHistoryOut(MedicalHistoryIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class SymptomCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    feature_key: str = Field(min_length=2, max_length=160)
    category: str
    body_area: str
    emergency_weight: float = Field(ge=0, le=1)
    description: str = ""


class SymptomOut(SymptomCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class FollowUpQuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    symptom_id: int
    question: str
    question_type: str
    options: list[dict[str, Any]]
    weight: float


class PatientInfo(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    age: int = Field(ge=0, le=120)
    gender: Literal["female", "male", "non_binary", "prefer_not_to_say"]
    blood_group: str = Field(pattern=r"^(A|B|AB|O)[+-]$|^Unknown$")
    height_cm: float = Field(gt=30, lt=260)
    weight_kg: float = Field(gt=1, lt=400)


class PredictionCreate(BaseModel):
    patient_info: PatientInfo
    medical_history: MedicalHistoryIn
    symptom_keys: list[str] = Field(min_length=1)
    follow_up_answers: dict[str, Any] = Field(default_factory=dict)

    @field_validator("symptom_keys")
    @classmethod
    def normalize_symptoms(cls, value: list[str]) -> list[str]:
        return sorted({item.strip().lower().replace(" ", "_") for item in value if item.strip()})


class DiseaseProbability(BaseModel):
    disease: str
    probability: float


class FeatureImportance(BaseModel):
    symptom: str
    feature_key: str
    importance: float
    match_strength: Literal["strong", "partial"]


class PredictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_info: dict[str, Any]
    medical_history_snapshot: dict[str, Any]
    symptom_keys: list[str]
    follow_up_answers: dict[str, Any]
    predicted_disease: str
    confidence: float
    severity: str
    risk_score: float
    top_diseases: list[DiseaseProbability]
    feature_importance: list[FeatureImportance]
    recommendations: dict[str, Any]
    created_at: datetime


class ReportCreate(BaseModel):
    prediction_id: int


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    prediction_id: int
    title: str
    report_data: dict[str, Any]
    created_at: datetime


class DoctorCreate(BaseModel):
    name: str
    specialty: str
    rating: float = Field(ge=0, le=5)
    experience_years: int = Field(ge=0, le=60)
    available_today: bool = True
    city: str = "Remote"


class DoctorOut(DoctorCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    type: str
    is_read: bool
    payload: dict[str, Any]
    created_at: datetime


class DashboardOverview(BaseModel):
    total_assessments: int
    average_confidence: float
    high_risk_count: int
    reports_generated: int
    trends: dict[str, float]


class DashboardCharts(BaseModel):
    symptom_frequency: list[dict[str, Any]]
    disease_distribution: list[dict[str, Any]]
    risk_trend: list[dict[str, Any]]
    weekly_activity: list[dict[str, Any]]


class ChatMessageRequest(BaseModel):
    session_id: str = Field(min_length=6, max_length=120)
    message: str = Field(min_length=1, max_length=2000)


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: str
    role: str
    content: str
    created_at: datetime


class ChatResponse(BaseModel):
    session_id: str
    answer: str
    safety_level: Literal["self_care", "doctor", "urgent"]
    messages: list[ChatMessageOut]


class PrescriptionScanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    content_type: str
    status: str
    extracted_medicines: list[dict[str, Any]]
    confidence: float
    raw_text: str
    created_at: datetime


class AdminOverview(BaseModel):
    users: int
    assessments: int
    high_risk_alerts: int
    scans: int
    user_distribution: list[dict[str, Any]]
    activity: list[dict[str, Any]]


class MessageResponse(BaseModel):
    message: str
