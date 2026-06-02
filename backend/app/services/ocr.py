import re
from pathlib import Path

KNOWN_MEDICINES = {
    "amoxicillin": "Antibiotic",
    "azithromycin": "Antibiotic",
    "ibuprofen": "Pain relief",
    "paracetamol": "Fever and pain relief",
    "acetaminophen": "Fever and pain relief",
    "metformin": "Diabetes medication",
    "atorvastatin": "Cholesterol medication",
    "cetirizine": "Allergy medication",
    "omeprazole": "Acid reflux medication",
    "salbutamol": "Bronchodilator",
}


async def extract_prescription(file_bytes: bytes, filename: str, content_type: str) -> tuple[list[dict], float, str]:
    text_candidates = filename.lower().replace("_", " ").replace("-", " ")
    if content_type in {"text/plain", "application/json"}:
        text_candidates += " " + file_bytes.decode("utf-8", errors="ignore").lower()

    found = []
    for medicine, usage in KNOWN_MEDICINES.items():
        if re.search(rf"\b{re.escape(medicine)}\b", text_candidates):
            found.append(
                {
                    "name": medicine.title(),
                    "dosage": "Verify dosage from original prescription",
                    "instructions": usage,
                    "confidence": 0.92,
                }
            )

    if not found:
        stem_words = [word for word in re.split(r"\W+", Path(filename).stem.lower()) if len(word) > 4]
        found = [
            {
                "name": word.title(),
                "dosage": "Requires pharmacist verification",
                "instructions": "Extracted as a candidate medicine token",
                "confidence": 0.58,
            }
            for word in stem_words[:3]
        ]

    confidence = round(sum(item["confidence"] for item in found) / max(len(found), 1), 2)
    raw_text = text_candidates[:2000]
    return found, confidence, raw_text
