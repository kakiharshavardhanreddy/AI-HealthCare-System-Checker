from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

DATA_PATH = Path(__file__).resolve().parent / "data" / "columbia_symptom_disease.csv"
ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_PATH = ARTIFACT_DIR / "healthai_random_forest.joblib"


@dataclass
class PredictionResult:
    predicted_disease: str
    confidence: float
    severity: str
    risk_score: float
    top_diseases: list[dict[str, float | str]]
    feature_importance: list[dict[str, float | str]]
    recommendations: dict[str, Any]


class SymptomDiseaseModel:
    def __init__(self) -> None:
        self.classifier: RandomForestClassifier | None = None
        self.encoder: LabelEncoder | None = None
        self.symptom_keys: list[str] = []
        self.symptom_catalog: pd.DataFrame | None = None
        self.disease_symptoms: dict[str, set[str]] = {}

    def load_or_train(self) -> None:
        if MODEL_PATH.exists():
            payload = joblib.load(MODEL_PATH)
            self.classifier = payload["classifier"]
            self.encoder = payload["encoder"]
            self.symptom_keys = payload["symptom_keys"]
            self.symptom_catalog = payload["symptom_catalog"]
            self.disease_symptoms = payload["disease_symptoms"]
            return
        self.train()

    def train(self) -> None:
        ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
        df = pd.read_csv(DATA_PATH)
        self.symptom_catalog = df.drop_duplicates("feature_key").copy()
        self.symptom_keys = sorted(df["feature_key"].unique().tolist())
        self.disease_symptoms = {
            disease: set(group["feature_key"].tolist()) for disease, group in df.groupby("disease")
        }

        rng = np.random.default_rng(2075)
        rows: list[list[int]] = []
        labels: list[str] = []
        for disease, keys in self.disease_symptoms.items():
            key_list = sorted(keys)
            for _ in range(48):
                keep_count = int(rng.integers(max(2, len(key_list) - 2), len(key_list) + 1))
                selected = set(rng.choice(key_list, size=keep_count, replace=False).tolist())
                if rng.random() < 0.35:
                    selected.update(rng.choice(self.symptom_keys, size=1, replace=False).tolist())
                rows.append([1 if key in selected else 0 for key in self.symptom_keys])
                labels.append(disease)

        self.encoder = LabelEncoder()
        y = self.encoder.fit_transform(labels)
        self.classifier = RandomForestClassifier(
            n_estimators=260,
            max_depth=12,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=2075,
        )
        self.classifier.fit(np.array(rows), y)
        joblib.dump(
            {
                "classifier": self.classifier,
                "encoder": self.encoder,
                "symptom_keys": self.symptom_keys,
                "symptom_catalog": self.symptom_catalog,
                "disease_symptoms": self.disease_symptoms,
            },
            MODEL_PATH,
        )

    def _vectorize(self, symptom_keys: list[str]) -> np.ndarray:
        selected = set(symptom_keys)
        return np.array([[1 if key in selected else 0 for key in self.symptom_keys]])

    def predict(self, symptom_keys: list[str], follow_up_answers: dict[str, Any] | None = None) -> PredictionResult:
        if self.classifier is None or self.encoder is None or self.symptom_catalog is None:
            self.load_or_train()

        assert self.classifier is not None
        assert self.encoder is not None
        assert self.symptom_catalog is not None

        vector = self._vectorize(symptom_keys)
        probabilities = self.classifier.predict_proba(vector)[0]
        top_indices = np.argsort(probabilities)[::-1][:3]
        top_diseases = [
            {
                "disease": str(self.encoder.inverse_transform([index])[0]),
                "probability": round(float(probabilities[index] * 100), 1),
            }
            for index in top_indices
        ]
        predicted = str(top_diseases[0]["disease"])
        confidence = float(top_diseases[0]["probability"])

        catalog = self.symptom_catalog.set_index("feature_key")
        emergency = [
            float(catalog.loc[key]["emergency_weight"])
            for key in symptom_keys
            if key in catalog.index
        ]
        emergency_score = min(sum(emergency) / max(len(symptom_keys), 1), 1) * 100
        follow_up_score = _follow_up_risk(follow_up_answers or {})
        risk_score = round(min((emergency_score * 0.55) + (confidence * 0.3) + (follow_up_score * 0.15), 100), 1)
        severity = "High" if risk_score >= 72 else "Moderate" if risk_score >= 42 else "Low"

        importances = self.classifier.feature_importances_
        selected_importance = []
        disease_keys = self.disease_symptoms.get(predicted, set())
        for key in symptom_keys:
            if key not in self.symptom_keys:
                continue
            row = catalog.loc[key]
            selected_importance.append(
                {
                    "symptom": str(row["symptom"]),
                    "feature_key": key,
                    "importance": round(float(importances[self.symptom_keys.index(key)] * 100), 2),
                    "match_strength": "strong" if key in disease_keys else "partial",
                }
            )
        selected_importance.sort(key=lambda item: float(item["importance"]), reverse=True)

        return PredictionResult(
            predicted_disease=predicted,
            confidence=round(confidence, 1),
            severity=severity,
            risk_score=risk_score,
            top_diseases=top_diseases,
            feature_importance=selected_importance[:8],
            recommendations=_recommendations(predicted, severity),
        )

    def symptoms(self) -> list[dict[str, Any]]:
        if self.symptom_catalog is None:
            self.load_or_train()
        assert self.symptom_catalog is not None
        return [
            {
                "name": row.symptom,
                "feature_key": row.feature_key,
                "category": row.category,
                "body_area": row.body_area,
                "emergency_weight": float(row.emergency_weight),
                "description": f"Symptom associated with {row.body_area.lower()} assessment signals.",
            }
            for row in self.symptom_catalog.itertuples()
        ]


def _follow_up_risk(answers: dict[str, Any]) -> float:
    if not answers:
        return 0
    risk = 0
    for value in answers.values():
        if isinstance(value, (int, float)):
            risk += min(float(value) * 10, 100)
        elif str(value).lower() in {"yes", "severe", "worsening", "constant"}:
            risk += 65
        else:
            risk += 15
    return min(risk / max(len(answers), 1), 100)


def _recommendations(disease: str, severity: str) -> dict[str, Any]:
    urgent = severity == "High"
    return {
        "home_care": [
            "Rest and hydrate while monitoring symptoms every 2 to 4 hours.",
            "Record temperature, pain score, and any new warning signs.",
            "Avoid strenuous activity until symptoms improve.",
        ],
        "medications": [
            "Use over-the-counter medication only as directed on the label.",
            "Avoid combining medicines without pharmacist or clinician guidance.",
            "Do not start antibiotics or prescription drugs without a prescription.",
        ],
        "doctors": [
            "Emergency Medicine" if urgent else "Primary Care",
            "Internal Medicine",
            "Relevant specialist based on symptom location",
        ],
        "disclaimer": f"AI screening suggests {disease}. Seek urgent care now if symptoms escalate.",
    }


ml_model = SymptomDiseaseModel()
