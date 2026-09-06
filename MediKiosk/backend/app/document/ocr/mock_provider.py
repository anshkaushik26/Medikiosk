"""Deterministic high-fidelity Mock OCR provider for testing, demos, and local development."""
from typing import Optional
from backend.app.document.ocr.base import (
    OCRProvider, OCRResult, OCRPage, OCRLine, OCRWord, BoundingBox
)


class MockOCRProvider(OCRProvider):
    """
    Mock OCR Provider that provides realistic structured text and source bounding boxes
    based on document classification and filename patterns.
    """

    async def process(
        self,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        document_type: Optional[str] = None
    ) -> OCRResult:
        doc_type = (document_type or "prescription").lower()
        lower_name = filename.lower()

        # Check if Hindi document demo
        is_hindi = "hindi" in lower_name or "parcha" in lower_name

        if "blood" in lower_name or "lab" in lower_name or doc_type == "lab_report":
            return self._build_lab_report(is_hindi)
        elif "discharge" in lower_name or doc_type == "discharge_summary":
            return self._build_discharge_summary(is_hindi)
        else:
            return self._build_prescription(is_hindi)

    def _build_lab_report(self, is_hindi: bool) -> OCRResult:
        lines_data = [
            ("CITY HEALTH CLINIC - LABORATORY SERVICES", 15.0, 8.0, 70.0, 3.5),
            ("Patient: Ramesh Kumar | Age: 68 | Gender: Male", 15.0, 13.0, 60.0, 2.8),
            ("Collection Date: 12 Aug 2026 | Ref By: Dr. Rajesh Sharma", 15.0, 16.5, 65.0, 2.8),
            ("------------------------------------------------------------", 15.0, 20.0, 70.0, 1.5),
            ("INVESTIGATION                  RESULT    UNIT     REFERENCE", 15.0, 23.0, 68.0, 2.5),
            ("Fasting Blood Sugar (FBS)     142       mg/dL    70 - 100", 15.0, 27.5, 68.0, 3.0),
            ("Post Prandial Sugar (PPBS)    186       mg/dL    < 140", 15.0, 32.0, 68.0, 3.0),
            ("HbA1c (Glycated Hemoglobin)   7.2       %        4.0 - 5.6", 15.0, 36.5, 68.0, 3.2),
            ("Total Cholesterol             218       mg/dL    < 200", 15.0, 41.0, 68.0, 3.0),
            ("Serum Creatinine              1.0       mg/dL    0.7 - 1.2", 15.0, 45.5, 68.0, 3.0),
            ("Haemoglobin                   13.8      g/dL     13.0 - 17.0", 15.0, 50.0, 68.0, 3.0),
            ("Platelet Count                2.4       lakh/mcL 1.5 - 4.5", 15.0, 54.5, 68.0, 3.0),
            ("------------------------------------------------------------", 15.0, 59.0, 70.0, 1.5),
            ("Comments: Blood sugar and lipid values above standard reference range.", 15.0, 62.0, 65.0, 3.0),
            ("Verified by: Dr. Rajesh Sharma, MD (Pathology)", 15.0, 67.0, 55.0, 2.8),
        ]

        ocr_lines = []
        for text, x, y, w, h in lines_data:
            bbox = BoundingBox(x=x, y=y, width=w, height=h)
            words = [OCRWord(text=w_text, confidence=0.98) for w_text in text.split()]
            ocr_lines.append(OCRLine(text=text, confidence=0.97, words=words, bounding_box=bbox))

        full_text = "\n".join(l[0] for l in lines_data)
        page = OCRPage(page_number=1, lines=ocr_lines, full_text=full_text, confidence=0.97)

        return OCRResult(
            full_text=full_text,
            pages=[page],
            detected_language="hi" if is_hindi else "en",
            average_confidence=0.97,
            provider_name="MockOCRProvider",
        )

    def _build_prescription(self, is_hindi: bool) -> OCRResult:
        lines_data = [
            ("CITY HEALTH CLINIC - DR. RAJESH SHARMA, MD", 15.0, 8.0, 65.0, 3.5),
            ("Consultant Physician & Family Medicine", 15.0, 12.0, 50.0, 2.5),
            ("Reg No: DMC-2012-45890 | Phone: +91 98765 00001", 15.0, 15.0, 55.0, 2.2),
            ("Date: 10 Aug 2026 | Patient: Ramesh Kumar (Age 68)", 15.0, 18.5, 60.0, 2.8),
            ("Diagnosis: Type 2 Diabetes Mellitus, Essential Hypertension", 15.0, 23.0, 68.0, 3.2),
            ("Rx:", 15.0, 28.0, 10.0, 2.5),
            ("1. Tab. Metformin 500 mg - 1 tab twice daily after meals (30 days)", 18.0, 32.0, 65.0, 3.5),
            ("   Instructions: Take after breakfast and dinner with water", 21.0, 36.0, 60.0, 2.5),
            ("2. Tab. Amlodipine 5 mg - 1 tab once daily in morning (30 days)", 18.0, 40.5, 65.0, 3.5),
            ("   Instructions: Regular morning dose for blood pressure", 21.0, 44.5, 60.0, 2.5),
            ("3. Tab. Atorvastatin 10 mg - 1 tab once daily at bedtime (30 days)", 18.0, 49.0, 65.0, 3.5),
            ("   Instructions: Take at night for cholesterol management", 21.0, 53.0, 60.0, 2.5),
            ("Advice: Brisk walk 30 mins daily. Low salt and low sugar diet.", 15.0, 58.5, 68.0, 3.0),
            ("Next follow up after 1 month with FBS and PPBS report.", 15.0, 63.0, 62.0, 2.8),
            ("Signature: Dr. Rajesh Sharma", 55.0, 70.0, 30.0, 3.0),
        ]

        ocr_lines = []
        for text, x, y, w, h in lines_data:
            bbox = BoundingBox(x=x, y=y, width=w, height=h)
            words = [OCRWord(text=w_text, confidence=0.96) for w_text in text.split()]
            ocr_lines.append(OCRLine(text=text, confidence=0.96, words=words, bounding_box=bbox))

        full_text = "\n".join(l[0] for l in lines_data)
        page = OCRPage(page_number=1, lines=ocr_lines, full_text=full_text, confidence=0.96)

        return OCRResult(
            full_text=full_text,
            pages=[page],
            detected_language="hi" if is_hindi else "en",
            average_confidence=0.96,
            provider_name="MockOCRProvider",
        )

    def _build_discharge_summary(self, is_hindi: bool) -> OCRResult:
        lines_data = [
            ("CITY GENERAL HOSPITAL - DISCHARGE SUMMARY", 15.0, 8.0, 65.0, 3.5),
            ("Patient: Ramesh Kumar | IPD No: CGH-2025-9842", 15.0, 13.0, 55.0, 2.8),
            ("Date of Admission: 14 Oct 2025 | Date of Discharge: 16 Oct 2025", 15.0, 16.5, 65.0, 2.8),
            ("Treating Doctor: Dr. Anita Desai, MS (General Surgery)", 15.0, 20.0, 60.0, 2.8),
            ("Final Diagnosis: Acute Appendicitis", 15.0, 24.5, 50.0, 3.2),
            ("Surgical Procedure: Laparoscopic Appendectomy (14 Oct 2025)", 15.0, 29.0, 65.0, 3.2),
            ("Hospital Course: Underwent uneventful surgery, recovered well.", 15.0, 33.5, 68.0, 2.8),
            ("Discharge Condition: Stable, sutures intact, afebrile.", 15.0, 37.5, 60.0, 2.8),
            ("Discharge Medications: Tab. Cefixime 200mg BD x 5 days, Tab. Paracetamol 650mg TDS PRN", 15.0, 42.0, 70.0, 3.5),
        ]

        ocr_lines = []
        for text, x, y, w, h in lines_data:
            bbox = BoundingBox(x=x, y=y, width=w, height=h)
            words = [OCRWord(text=w_text, confidence=0.95) for w_text in text.split()]
            ocr_lines.append(OCRLine(text=text, confidence=0.95, words=words, bounding_box=bbox))

        full_text = "\n".join(l[0] for l in lines_data)
        page = OCRPage(page_number=1, lines=ocr_lines, full_text=full_text, confidence=0.95)

        return OCRResult(
            full_text=full_text,
            pages=[page],
            detected_language="en",
            average_confidence=0.95,
            provider_name="MockOCRProvider",
        )
