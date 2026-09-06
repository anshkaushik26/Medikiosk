"""Rule-based clinical entity extractor with Indian medical conventions and non-diagnostic safety."""
import re
from typing import List, Dict, Any, Optional
from backend.app.document.ocr.base import OCRResult, OCRLine
from backend.app.document.extraction.base import (
    MedicalExtractionProvider, DocumentExtractionResult, ExtractedEntityDTO
)

# Standard common Indian prescriptions medications dictionary for regex matching
KNOWN_MEDS = [
    "metformin", "amlodipine", "atorvastatin", "telmisartan", "losartan",
    "paracetamol", "pantoprazole", "omeprazole", "cefixime", "amoxicillin",
    "azithromycin", "ciprofloxacin", "rosuvastatin", "glimepiride", "vildagliptin",
    "levosalbutamol", "montelukast", "cetirizine", "thyronorm", "levothyroxine",
]

# Standard lab tests dictionary with typical reference ranges
KNOWN_TESTS = {
    "hba1c": {"name": "HbA1c (Glycated Hemoglobin)", "unit": "%", "min": 4.0, "max": 5.6, "default_ref": "4.0 - 5.6 %"},
    "fasting blood sugar": {"name": "Fasting Blood Sugar (FBS)", "unit": "mg/dL", "min": 70.0, "max": 100.0, "default_ref": "70 - 100 mg/dL"},
    "fbs": {"name": "Fasting Blood Sugar (FBS)", "unit": "mg/dL", "min": 70.0, "max": 100.0, "default_ref": "70 - 100 mg/dL"},
    "post prandial": {"name": "Post Prandial Sugar (PPBS)", "unit": "mg/dL", "min": 70.0, "max": 140.0, "default_ref": "< 140 mg/dL"},
    "ppbs": {"name": "Post Prandial Sugar (PPBS)", "unit": "mg/dL", "min": 70.0, "max": 140.0, "default_ref": "< 140 mg/dL"},
    "cholesterol": {"name": "Total Cholesterol", "unit": "mg/dL", "min": 0.0, "max": 200.0, "default_ref": "< 200 mg/dL"},
    "creatinine": {"name": "Serum Creatinine", "unit": "mg/dL", "min": 0.7, "max": 1.2, "default_ref": "0.7 - 1.2 mg/dL"},
    "haemoglobin": {"name": "Haemoglobin", "unit": "g/dL", "min": 13.0, "max": 17.0, "default_ref": "13.0 - 17.0 g/dL"},
    "hemoglobin": {"name": "Haemoglobin", "unit": "g/dL", "min": 13.0, "max": 17.0, "default_ref": "13.0 - 17.0 g/dL"},
    "platelet": {"name": "Platelet Count", "unit": "lakh/mcL", "min": 1.5, "max": 4.5, "default_ref": "1.5 - 4.5 lakh/mcL"},
}


class RuleBasedMedicalExtractor(MedicalExtractionProvider):
    """Extract clinical entities with high precision, source coordinates, and zero clinical diagnosis."""

    async def extract(
        self,
        ocr_result: OCRResult,
        document_type: str
    ) -> DocumentExtractionResult:
        doc_type = (document_type or "prescription").lower()
        entities: List[ExtractedEntityDTO] = []

        for page in ocr_result.pages:
            for line in page.lines:
                text_lower = line.text.lower()

                # 1. Date extraction
                date_match = re.search(r"\b(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b", line.text)
                if date_match and not any(e.entity_type == "DOCUMENT_DATE" for e in entities):
                    entities.append(ExtractedEntityDTO(
                        entity_type="DOCUMENT_DATE",
                        entity_value={"date": date_match.group(0)},
                        normalized_value=date_match.group(0),
                        confidence=0.96,
                        page_number=page.page_number,
                        source_text=line.text,
                        bounding_box=line.bounding_box,
                    ))

                # 2. Doctor Name
                if "dr." in text_lower or "doctor" in text_lower:
                    doc_match = re.search(r"(Dr\.?\s+[A-Z][a-zA-Z\s]+)", line.text)
                    if doc_match and not any(e.entity_type == "DOCTOR_NAME" for e in entities):
                        d_name = doc_match.group(0).strip().rstrip(",|")
                        entities.append(ExtractedEntityDTO(
                            entity_type="DOCTOR_NAME",
                            entity_value={"doctor_name": d_name},
                            normalized_value=d_name,
                            confidence=0.95,
                            page_number=page.page_number,
                            source_text=line.text,
                            bounding_box=line.bounding_box,
                        ))

                # 3. Hospital / Clinic
                if any(k in text_lower for k in ["clinic", "hospital", "laboratory", "diagnostics"]):
                    if not any(e.entity_type == "HOSPITAL_NAME" for e in entities):
                        clean_hosp = line.text.split("-")[0].split("|")[0].strip()
                        entities.append(ExtractedEntityDTO(
                            entity_type="HOSPITAL_NAME",
                            entity_value={"hospital_name": clean_hosp},
                            normalized_value=clean_hosp,
                            confidence=0.94,
                            page_number=page.page_number,
                            source_text=line.text,
                            bounding_box=line.bounding_box,
                        ))

                # 4. Lab Results Extraction
                for test_key, test_info in KNOWN_TESTS.items():
                    if test_key in text_lower:
                        # Extract numerical value
                        val_match = re.search(r"(\d+\.?\d*)", line.text[line.text.lower().find(test_key):])
                        if val_match:
                            num_val_str = val_match.group(1)
                            try:
                                num_val = float(num_val_str)
                                status = "WITHIN_RANGE"
                                if num_val > test_info["max"]:
                                    status = "ABOVE_RANGE"
                                elif num_val < test_info["min"]:
                                    status = "BELOW_RANGE"
                            except ValueError:
                                status = "UNKNOWN"

                            # Avoid duplicate for same test in this extraction
                            if not any(e.entity_type == "LAB_RESULT" and e.entity_value.get("test_name") == test_info["name"] for e in entities):
                                entities.append(ExtractedEntityDTO(
                                    entity_type="LAB_RESULT",
                                    entity_value={
                                        "test_name": test_info["name"],
                                        "value": num_val_str,
                                        "unit": test_info["unit"],
                                        "reference_range": test_info["default_ref"],
                                        "status": status,
                                        "status_label": "Outside the provided reference range" if status in ["ABOVE_RANGE", "BELOW_RANGE"] else "Within standard reference range",
                                    },
                                    normalized_value=f"{test_info['name']}: {num_val_str} {test_info['unit']}",
                                    confidence=0.96,
                                    page_number=page.page_number,
                                    source_text=line.text,
                                    bounding_box=line.bounding_box,
                                ))

                # 5. Medication Extraction
                for med in KNOWN_MEDS:
                    if re.search(rf"\b{med}\b", text_lower):
                        # Extract dosage
                        dose_match = re.search(r"(\d+\s*(?:mg|mcg|gm|ml))", text_lower)
                        dose = dose_match.group(1).upper() if dose_match else "Standard dose"

                        # Extract frequency
                        freq = "As prescribed"
                        if "twice daily" in text_lower or "bd" in text_lower or "1-0-1" in text_lower:
                            freq = "Twice daily"
                        elif "once daily" in text_lower or "od" in text_lower or "1-0-0" in text_lower or "0-0-1" in text_lower:
                            freq = "Once daily"
                        elif "thrice daily" in text_lower or "tds" in text_lower or "1-1-1" in text_lower:
                            freq = "Thrice daily"

                        # Extract instructions
                        instructions = "Take as directed by doctor"
                        if "after meals" in text_lower or "after food" in text_lower:
                            instructions = "After meals"
                        elif "before meals" in text_lower or "empty stomach" in text_lower:
                            instructions = "Before meals"
                        elif "bedtime" in text_lower or "at night" in text_lower:
                            instructions = "At bedtime"

                        med_title = med.capitalize()
                        if not any(e.entity_type == "MEDICATION" and e.entity_value.get("medicine_name", "").lower() == med for e in entities):
                            entities.append(ExtractedEntityDTO(
                                entity_type="MEDICATION",
                                entity_value={
                                    "medicine_name": med_title,
                                    "dose": dose,
                                    "frequency": freq,
                                    "instructions": instructions,
                                    "status": "Currently taking",
                                },
                                normalized_value=f"{med_title} {dose} ({freq})",
                                confidence=0.95,
                                page_number=page.page_number,
                                source_text=line.text,
                                bounding_box=line.bounding_box,
                            ))

                # 6. Diagnoses / Conditions
                if "diagnosis:" in text_lower or "condition:" in text_lower or "impression:" in text_lower:
                    cond_part = re.split(r"diagnosis:|condition:|impression:", line.text, flags=re.IGNORECASE)[-1].strip()
                    for cond in [c.strip() for c in cond_part.split(",") if len(c.strip()) > 3]:
                        if not any(e.entity_type == "CONDITION" and e.entity_value.get("condition_name") == cond for e in entities):
                            entities.append(ExtractedEntityDTO(
                                entity_type="CONDITION",
                                entity_value={
                                    "condition_name": cond,
                                    "status": "Under treatment",
                                },
                                normalized_value=cond,
                                confidence=0.93,
                                page_number=page.page_number,
                                source_text=line.text,
                                bounding_box=line.bounding_box,
                            ))

                # 7. Surgical Procedures
                if "procedure:" in text_lower or "surgical procedure:" in text_lower or "surgery:" in text_lower:
                    surg_part = re.split(r"procedure:|surgical procedure:|surgery:", line.text, flags=re.IGNORECASE)[-1].strip()
                    surg_name = surg_part.split("(")[0].strip()
                    if surg_name and not any(e.entity_type == "SURGERY" for e in entities):
                        entities.append(ExtractedEntityDTO(
                            entity_type="SURGERY",
                            entity_value={
                                "procedure_name": surg_name,
                            },
                            normalized_value=surg_name,
                            confidence=0.94,
                            page_number=page.page_number,
                            source_text=line.text,
                            bounding_box=line.bounding_box,
                        ))

        # Fallback if no specific entities parsed: ensure summary dict
        return DocumentExtractionResult(
            document_type=doc_type,
            entities=entities,
            summary={
                "total_entities_found": len(entities),
                "medications_found": sum(1 for e in entities if e.entity_type == "MEDICATION"),
                "lab_results_found": sum(1 for e in entities if e.entity_type == "LAB_RESULT"),
                "conditions_found": sum(1 for e in entities if e.entity_type == "CONDITION"),
                "surgeries_found": sum(1 for e in entities if e.entity_type == "SURGERY"),
            },
            extraction_provider="RuleBasedMedicalExtractor",
        )
