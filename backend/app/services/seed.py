from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.ml.model import ml_model
from app.models import Doctor, FollowUpQuestion, MedicalHistory, Symptom, User, UserRole


def seed_database(db: Session) -> None:
    ml_model.load_or_train()
    if not db.scalar(select(User).where(User.email == "admin@healthai.com")):
        admin = User(
            email="admin@healthai.com",
            full_name="HealthAI Admin",
            hashed_password=get_password_hash("AdminPass123!"),
            role=UserRole.ADMIN.value,
            is_verified=True,
        )
        db.add(admin)

    existing_symptoms = {row[0] for row in db.execute(select(Symptom.feature_key)).all()}
    for item in ml_model.symptoms():
        if item["feature_key"] not in existing_symptoms:
            db.add(Symptom(**item))
    db.flush()

    symptoms = db.scalars(select(Symptom)).all()
    existing_questions = db.scalar(select(FollowUpQuestion.id).limit(1))
    if not existing_questions:
        for symptom in symptoms:
            db.add(
                FollowUpQuestion(
                    symptom_id=symptom.id,
                    question=f"How severe is your {symptom.name.lower()} right now?",
                    question_type="scale",
                    options=[{"label": str(i), "value": i} for i in range(1, 11)],
                    weight=max(symptom.emergency_weight, 0.2),
                )
            )
            db.add(
                FollowUpQuestion(
                    symptom_id=symptom.id,
                    question=f"Did your {symptom.name.lower()} start suddenly or get worse quickly?",
                    question_type="single_choice",
                    options=[
                        {"label": "No", "value": "no"},
                        {"label": "Yes", "value": "yes"},
                    ],
                    weight=max(symptom.emergency_weight, 0.3),
                )
            )

    if not db.scalar(select(Doctor.id).limit(1)):
        doctors = [
            Doctor(name="Dr. Maya Srinivasan", specialty="Internal Medicine", rating=4.9, experience_years=14, city="Remote"),
            Doctor(name="Dr. Elias Chen", specialty="Emergency Medicine", rating=4.8, experience_years=11, city="Remote"),
            Doctor(name="Dr. Naomi Wright", specialty="Pulmonology", rating=4.9, experience_years=16, city="Remote"),
            Doctor(name="Dr. Farah Khan", specialty="Neurology", rating=4.7, experience_years=10, city="Remote"),
            Doctor(name="Dr. Mateo Alvarez", specialty="Cardiology", rating=4.9, experience_years=18, city="Remote"),
        ]
        db.add_all(doctors)

    for user in db.scalars(select(User)).all():
        if not db.scalar(select(MedicalHistory).where(MedicalHistory.user_id == user.id)):
            db.add(MedicalHistory(user_id=user.id))

    db.commit()
