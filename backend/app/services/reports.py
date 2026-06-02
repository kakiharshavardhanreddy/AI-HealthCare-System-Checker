from io import BytesIO
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.models import Prediction, User


def build_report_payload(user: User, prediction: Prediction) -> dict[str, Any]:
    return {
        "patient": prediction.patient_info,
        "generated_for": {"id": user.id, "email": user.email, "full_name": user.full_name},
        "diagnosis": {
            "predicted_disease": prediction.predicted_disease,
            "confidence": prediction.confidence,
            "severity": prediction.severity,
            "risk_score": prediction.risk_score,
            "top_diseases": prediction.top_diseases,
        },
        "symptoms": prediction.symptom_keys,
        "explainability": prediction.feature_importance,
        "recommendations": prediction.recommendations,
        "disclaimer": "This AI report is informational and is not a substitute for clinical diagnosis.",
    }


def render_report_pdf(report_data: dict[str, Any]) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, title="HealthAI Assessment Report")
    styles = getSampleStyleSheet()
    story: list[Any] = []

    story.append(Paragraph("HEALTHAI ASSESSMENT REPORT", styles["Title"]))
    story.append(Spacer(1, 16))
    diagnosis = report_data["diagnosis"]
    patient = report_data["patient"]

    table_data = [
        ["Patient", patient.get("full_name", "Unknown")],
        ["Predicted Condition", diagnosis["predicted_disease"]],
        ["Confidence", f"{diagnosis['confidence']:.1f}%"],
        ["Severity", diagnosis["severity"]],
        ["Risk Score", f"{diagnosis['risk_score']:.1f}/100"],
    ]
    table = Table(table_data, colWidths=[170, 330])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#0a1628")),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#00d4ff")),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 18))
    story.append(Paragraph("Symptoms", styles["Heading2"]))
    story.append(Paragraph(", ".join(report_data["symptoms"]), styles["BodyText"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Recommendations", styles["Heading2"]))
    for section, items in report_data["recommendations"].items():
        story.append(Paragraph(section.replace("_", " ").title(), styles["Heading3"]))
        if isinstance(items, list):
            for item in items:
                story.append(Paragraph(f"- {item}", styles["BodyText"]))
        else:
            story.append(Paragraph(str(items), styles["BodyText"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(report_data["disclaimer"], styles["Italic"]))
    doc.build(story)
    return buffer.getvalue()
