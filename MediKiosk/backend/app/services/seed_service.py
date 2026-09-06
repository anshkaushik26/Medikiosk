"""Seed and reset demo data service."""
import os
import uuid
from datetime import datetime, timezone
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.user import User, UserRole
from backend.app.models.identity import Identity, IdentityType
from backend.app.models.patient import PatientProfile
from backend.app.models.doctor import DoctorProfile
from backend.app.models.preferences import UserPreferences
from backend.app.models.clinical import (
    Condition,
    Medication,
    Allergy,
    FamilyHistory,
    Surgery,
    MedicalDocument,
    TimelineEvent,
    LabResult,
    DocumentExtraction,
    ExtractedEntity,
)
from backend.app.models.interview import (
    ClinicalInterview,
    InterviewAnswer,
    UrgentInterviewAlert,
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def seed_demo_data(db: AsyncSession) -> dict:
    """Seed synthetic demo accounts, clinical history, and extractions for testing (Ramesh Kumar and Dr. Sharma)."""
    # 1. Check if Ramesh Kumar exists
    stmt = select(Identity).where(
        Identity.identifier_value.in_(["+91 98765 43210", "9876543210", "91-1234-5678-9012"])
    )
    res = await db.execute(stmt)
    existing_patient_id = res.scalars().first()

    if not existing_patient_id:
        patient_user = User(
            id=str(uuid.uuid4()),
            role=UserRole.PATIENT,
            is_active=True,
        )
        db.add(patient_user)
        await db.flush()

        # Identities for Ramesh Kumar (Mobile + ABHA)
        id_mobile = Identity(
            id=str(uuid.uuid4()),
            user_id=patient_user.id,
            identity_type=IdentityType.MOBILE,
            identifier_value="+91 98765 43210",
            verified_at=datetime.now(timezone.utc),
        )
        id_abha = Identity(
            id=str(uuid.uuid4()),
            user_id=patient_user.id,
            identity_type=IdentityType.ABHA,
            identifier_value="91-1234-5678-9012",
            verified_at=datetime.now(timezone.utc),
        )
        patient_profile = PatientProfile(
            id=str(uuid.uuid4()),
            user_id=patient_user.id,
            full_name="Ramesh Kumar",
            date_of_birth="1958-05-15",
            gender="Male",
            phone_number="+91 98765 43210",
            address="Sector 4, Rohini, New Delhi, 110085",
            blood_group="B+",
            emergency_contact="+91 98765 43211 (Son - Amit)",
            onboarding_completed=True,
        )
        patient_pref = UserPreferences(
            id=str(uuid.uuid4()),
            user_id=patient_user.id,
            language="hi",
            text_size="large",
            high_contrast=False,
            voice_enabled=True,
        )
        db.add_all([id_mobile, id_abha, patient_profile, patient_pref])
        await db.flush()

        pid = patient_profile.id

        # 1. Conditions
        c1 = Condition(
            id=str(uuid.uuid4()),
            patient_id=pid,
            condition_name="Type 2 Diabetes",
            diagnosis_date="10 Jun 2021",
            status="Under treatment",
            doctor_hospital="Dr. Rajesh Sharma, City Health Clinic",
            notes="Diagnosed 5 years ago. Monitored with HbA1c every 3 months.",
        )
        c2 = Condition(
            id=str(uuid.uuid4()),
            patient_id=pid,
            condition_name="Hypertension",
            diagnosis_date="15 Jan 2019",
            status="Under treatment",
            doctor_hospital="Apollo Clinic Rohini",
            notes="Blood pressure elevated without morning medication.",
        )
        db.add_all([c1, c2])

        # 2. Medications
        m1 = Medication(
            id=str(uuid.uuid4()),
            patient_id=pid,
            medicine_name="Metformin",
            dose="500 mg",
            frequency="Twice daily after meals",
            route="Oral tablet",
            start_date="12 Jun 2021",
            prescribed_by="Dr. Rajesh Sharma",
            purpose="Type 2 Diabetes blood sugar control",
            status="Currently taking",
            notes="Take with plenty of water after breakfast and dinner.",
        )
        m2 = Medication(
            id=str(uuid.uuid4()),
            patient_id=pid,
            medicine_name="Amlodipine",
            dose="5 mg",
            frequency="Once daily in morning",
            route="Oral tablet",
            start_date="20 Jan 2019",
            prescribed_by="Dr. Gupta, Apollo Clinic",
            purpose="High Blood Pressure",
            status="Currently taking",
            notes="Keep morning blood pressure below 130/80.",
        )
        m3 = Medication(
            id=str(uuid.uuid4()),
            patient_id=pid,
            medicine_name="Atorvastatin",
            dose="10 mg",
            frequency="Once daily at bedtime",
            route="Oral tablet",
            start_date="05 Aug 2023",
            prescribed_by="Dr. Rajesh Sharma",
            purpose="Cholesterol management",
            status="Currently taking",
            notes="Routine lipid panel check recommended annually.",
        )
        db.add_all([m1, m2, m3])

        # 3. Allergies
        a1 = Allergy(
            id=str(uuid.uuid4()),
            patient_id=pid,
            allergen="Penicillin",
            reaction="Severe skin rash, facial itching, and mild breathing discomfort",
            severity="Severe",
            notes="Occurred in 2015 during dental abscess treatment. STRICTLY CONTRAINDICATED.",
        )
        a2 = Allergy(
            id=str(uuid.uuid4()),
            patient_id=pid,
            allergen="Sulfa drugs",
            reaction="Urticaria and nausea",
            severity="Moderate",
            notes="Informed by family doctor in 2018.",
        )
        db.add_all([a1, a2])

        # 4. Family History
        f1 = FamilyHistory(
            id=str(uuid.uuid4()),
            patient_id=pid,
            relation="Mother",
            condition="Type 2 Diabetes",
            age_at_diagnosis="Around age 52",
            status="Deceased",
            notes="Managed with oral hypoglycemic agents.",
        )
        f2 = FamilyHistory(
            id=str(uuid.uuid4()),
            patient_id=pid,
            relation="Father",
            condition="Hypertension & Heart Disease",
            age_at_diagnosis="Around age 58",
            status="Deceased",
            notes="Had bypass surgery at age 64.",
        )
        db.add_all([f1, f2])

        # 5. Surgeries
        s1 = Surgery(
            id=str(uuid.uuid4()),
            patient_id=pid,
            procedure_name="Appendectomy",
            surgery_date="21 Nov 2018",
            hospital="City General Hospital, Delhi",
            doctor="Dr. K. S. Verma",
            reason="Acute Appendicitis",
            notes="Laparoscopic procedure. Fully recovered with no post-op complications.",
        )
        db.add(s1)

        # 6. Medical Documents (with real dummy text/pdf files created on disk)
        sample_doc_key1 = "demo_blood_test_aug_2026.txt"
        sample_doc_path1 = os.path.join(UPLOAD_DIR, sample_doc_key1)
        with open(sample_doc_path1, "w", encoding="utf-8") as f:
            f.write("CITY HEALTH CLINIC - LABORATORY SERVICES\n"
                    "Patient: Ramesh Kumar (Age 68, Male)\n"
                    "Date of Collection: 12 Aug 2026\n\n"
                    "INVESTIGATION                  RESULT    UNIT     REFERENCE\n"
                    "Fasting Blood Sugar (FBS)     142       mg/dL    70 - 100\n"
                    "Post Prandial Sugar (PPBS)    186       mg/dL    < 140\n"
                    "HbA1c (Glycated Hemoglobin)   7.2       %        4.0 - 5.6\n"
                    "Total Cholesterol             218       mg/dL    < 200\n"
                    "Serum Creatinine              1.0       mg/dL    0.7 - 1.2\n\n"
                    "Verified by: Dr. Rajesh Sharma, MD (Internal Medicine)\n")

        d1 = MedicalDocument(
            id=str(uuid.uuid4()),
            patient_id=pid,
            document_type="lab_report",
            file_name="Blood_Test_Report_Aug_2026.txt",
            storage_key=sample_doc_key1,
            file_url=f"/api/v1/patient/documents/file/{sample_doc_key1}",
            mime_type="text/plain",
            file_size=os.path.getsize(sample_doc_path1),
            document_date="12 Aug 2026",
            hospital_name="City Health Clinic",
            doctor_name="Dr. Rajesh Sharma",
            patient_notes="Routine 3-month sugar check. HbA1c and fasting blood sugar evaluated.",
            verification_status="Patient verified",
        )

        sample_doc_key2 = "demo_prescription_jul_2026.txt"
        sample_doc_path2 = os.path.join(UPLOAD_DIR, sample_doc_key2)
        with open(sample_doc_path2, "w", encoding="utf-8") as f:
            f.write("PRESCRIPTION - DR. RAJESH SHARMA, MD\n"
                    "City Health Clinic, Rohini, New Delhi\n"
                    "Date: 25 Jul 2026\n"
                    "Patient: Ramesh Kumar\n\n"
                    "Rx:\n"
                    "1. Tab. Metformin 500 mg - 1 tab twice daily after meals (30 days)\n"
                    "2. Tab. Amlodipine 5 mg - 1 tab morning after breakfast (30 days)\n"
                    "3. Tab. Atorvastatin 10 mg - 1 tab at bedtime (30 days)\n\n"
                    "Advice:\n"
                    "- 30 minutes brisk morning walk\n"
                    "- Low sodium, low glycemic diet\n"
                    "- Review after 3 months with FBS & HbA1c\n")

        d2 = MedicalDocument(
            id=str(uuid.uuid4()),
            patient_id=pid,
            document_type="prescription",
            file_name="Prescription_Jul_2026.txt",
            storage_key=sample_doc_key2,
            file_url=f"/api/v1/patient/documents/file/{sample_doc_key2}",
            mime_type="text/plain",
            file_size=os.path.getsize(sample_doc_path2),
            document_date="25 Jul 2026",
            hospital_name="City Health Clinic",
            doctor_name="Dr. Rajesh Sharma",
            patient_notes="Prescription renewed for ongoing BP and diabetes management.",
            verification_status="Patient added",
        )

        sample_doc_key3 = "demo_discharge_summary_2025.txt"
        sample_doc_path3 = os.path.join(UPLOAD_DIR, sample_doc_key3)
        with open(sample_doc_path3, "w", encoding="utf-8") as f:
            f.write("DISCHARGE SUMMARY\n"
                    "City General Hospital, New Delhi\n"
                    "Date of Admission: 14 Oct 2025\n"
                    "Date of Discharge: 16 Oct 2025\n"
                    "Patient: Ramesh Kumar\n\n"
                    "Diagnosis: Viral Gastroenteritis with Mild Dehydration\n"
                    "Course in Hospital: Patient presented with fever, loose motions and weakness. Rehydrated with IV fluids. Electrolytes corrected.\n"
                    "Condition at Discharge: Hemodynamically stable, afebrile, accepting oral diet.\n")

        d3 = MedicalDocument(
            id=str(uuid.uuid4()),
            patient_id=pid,
            document_type="discharge_summary",
            file_name="Discharge_Summary_Oct_2025.txt",
            storage_key=sample_doc_key3,
            file_url=f"/api/v1/patient/documents/file/{sample_doc_key3}",
            mime_type="text/plain",
            file_size=os.path.getsize(sample_doc_path3),
            document_date="16 Oct 2025",
            hospital_name="City General Hospital",
            doctor_name="Dr. Anita Desai",
            patient_notes="Brief 2-day hospital admission for stomach infection, resolved completely.",
            verification_status="Patient added",
        )
        db.add_all([d1, d2, d3])
        await db.flush()

        # 7. Seed Verified Lab Results for Ramesh Kumar (Phase 3)
        lab1 = LabResult(
            id=str(uuid.uuid4()),
            patient_id=pid,
            document_id=d1.id,
            test_name="HbA1c (Glycated Hemoglobin)",
            value="6.8",
            unit="%",
            reference_range="4.0 - 5.6 %",
            status="WITHIN_RANGE",
            test_date="12 Aug 2026",
            source_page=1,
            source_text="HbA1c (Glycated Hemoglobin)   6.8       %        4.0 - 5.6",
            confidence=0.98,
            verification_status="PATIENT_VERIFIED",
        )
        lab2 = LabResult(
            id=str(uuid.uuid4()),
            patient_id=pid,
            document_id=d1.id,
            test_name="Fasting Blood Sugar (FBS)",
            value="118",
            unit="mg/dL",
            reference_range="70 - 100 mg/dL",
            status="ABOVE_RANGE",
            test_date="12 Aug 2026",
            source_page=1,
            source_text="Fasting Blood Sugar (FBS)     118       mg/dL    70 - 100",
            confidence=0.97,
            verification_status="PATIENT_VERIFIED",
        )
        lab3 = LabResult(
            id=str(uuid.uuid4()),
            patient_id=pid,
            document_id=d1.id,
            test_name="Total Cholesterol",
            value="184",
            unit="mg/dL",
            reference_range="< 200 mg/dL",
            status="WITHIN_RANGE",
            test_date="12 Aug 2026",
            source_page=1,
            source_text="Total Cholesterol             184       mg/dL    < 200",
            confidence=0.96,
            verification_status="PATIENT_VERIFIED",
        )
        db.add_all([lab1, lab2, lab3])

        # 8. Seed Pre-extracted Document Intelligence Entities for d1 (Ready for Review Demo)
        ext1 = DocumentExtraction(
            id=str(uuid.uuid4()),
            document_id=d1.id,
            patient_id=pid,
            extraction_status="NEEDS_REVIEW",
            current_step="Preparing for your review",
            ocr_text="CITY HEALTH CLINIC - LABORATORY SERVICES\nPatient: Ramesh Kumar\nHbA1c: 7.2 %\nFasting Sugar: 142 mg/dL",
            detected_language="en",
            ocr_confidence=0.97,
            structured_data={"total_entities": 3, "lab_results": 3},
            processing_provider="MockOCRProvider",
            quality_issues=None,
            processed_at=datetime.now(timezone.utc),
        )
        db.add(ext1)
        await db.flush()

        ent_hba1c = ExtractedEntity(
            id=str(uuid.uuid4()),
            document_extraction_id=ext1.id,
            entity_type="LAB_RESULT",
            entity_value={
                "test_name": "HbA1c (Glycated Hemoglobin)",
                "value": "7.2",
                "unit": "%",
                "reference_range": "4.0 - 5.6 %",
                "status": "ABOVE_RANGE",
                "status_label": "Outside the provided reference range",
            },
            normalized_value="HbA1c: 7.2 %",
            confidence=0.98,
            page_number=1,
            source_text="HbA1c (Glycated Hemoglobin)   7.2       %        4.0 - 5.6",
            bounding_box={"x": 15.0, "y": 36.5, "width": 68.0, "height": 3.2},
            verification_status="NEEDS_REVIEW",
            patient_corrected=False,
        )
        ent_fbs = ExtractedEntity(
            id=str(uuid.uuid4()),
            document_extraction_id=ext1.id,
            entity_type="LAB_RESULT",
            entity_value={
                "test_name": "Fasting Blood Sugar (FBS)",
                "value": "142",
                "unit": "mg/dL",
                "reference_range": "70 - 100 mg/dL",
                "status": "ABOVE_RANGE",
                "status_label": "Outside the provided reference range",
            },
            normalized_value="Fasting Blood Sugar: 142 mg/dL",
            confidence=0.97,
            page_number=1,
            source_text="Fasting Blood Sugar (FBS)     142       mg/dL    70 - 100",
            bounding_box={"x": 15.0, "y": 27.5, "width": 68.0, "height": 3.0},
            verification_status="NEEDS_REVIEW",
            patient_corrected=False,
        )
        ent_chol = ExtractedEntity(
            id=str(uuid.uuid4()),
            document_extraction_id=ext1.id,
            entity_type="LAB_RESULT",
            entity_value={
                "test_name": "Total Cholesterol",
                "value": "218",
                "unit": "mg/dL",
                "reference_range": "< 200 mg/dL",
                "status": "ABOVE_RANGE",
                "status_label": "Outside the provided reference range",
            },
            normalized_value="Total Cholesterol: 218 mg/dL",
            confidence=0.96,
            page_number=1,
            source_text="Total Cholesterol             218       mg/dL    < 200",
            bounding_box={"x": 15.0, "y": 41.0, "width": 68.0, "height": 3.0},
            verification_status="NEEDS_REVIEW",
            patient_corrected=False,
        )
        db.add_all([ent_hba1c, ent_fbs, ent_chol])

        # 9. Timeline Events
        t_events = [
            TimelineEvent(
                id=str(uuid.uuid4()),
                patient_id=pid,
                event_type="REPORT",
                event_date="12 Aug 2026",
                title="Blood Test Report Added",
                description="Fasting blood sugar 118, HbA1c 6.8% - controlled.",
                source_type="REPORT",
                source_id=d1.id,
            ),
            TimelineEvent(
                id=str(uuid.uuid4()),
                patient_id=pid,
                event_type="REPORT",
                event_date="25 Jul 2026",
                title="Prescription Renewed",
                description="Dr. Rajesh Sharma renewed Metformin and Amlodipine.",
                source_type="REPORT",
                source_id=d2.id,
            ),
            TimelineEvent(
                id=str(uuid.uuid4()),
                patient_id=pid,
                event_type="REPORT",
                event_date="16 Oct 2025",
                title="Hospital Discharge Summary",
                description="Treated for viral gastroenteritis, full recovery.",
                source_type="REPORT",
                source_id=d3.id,
            ),
            TimelineEvent(
                id=str(uuid.uuid4()),
                patient_id=pid,
                event_type="MEDICATION",
                event_date="05 Aug 2023",
                title="Atorvastatin Started",
                description="10 mg once daily at bedtime for cholesterol.",
                source_type="MEDICATION",
                source_id=m3.id,
            ),
            TimelineEvent(
                id=str(uuid.uuid4()),
                patient_id=pid,
                event_type="CONDITION",
                event_date="10 Jun 2021",
                title="Type 2 Diabetes Diagnosed",
                description="Diagnosed at City Health Clinic, started on Metformin.",
                source_type="CONDITION",
                source_id=c1.id,
            ),
            TimelineEvent(
                id=str(uuid.uuid4()),
                patient_id=pid,
                event_type="MEDICATION",
                event_date="12 Jun 2021",
                title="Metformin Started",
                description="500 mg twice daily for diabetes control.",
                source_type="MEDICATION",
                source_id=m1.id,
            ),
            TimelineEvent(
                id=str(uuid.uuid4()),
                patient_id=pid,
                event_type="CONDITION",
                event_date="15 Jan 2019",
                title="Hypertension Diagnosed",
                description="High BP discovered during routine annual check.",
                source_type="CONDITION",
                source_id=c2.id,
            ),
            TimelineEvent(
                id=str(uuid.uuid4()),
                patient_id=pid,
                event_type="MEDICATION",
                event_date="20 Jan 2019",
                title="Amlodipine Started",
                description="5 mg morning tablet for high blood pressure.",
                source_type="MEDICATION",
                source_id=m2.id,
            ),
            TimelineEvent(
                id=str(uuid.uuid4()),
                patient_id=pid,
                event_type="SURGERY",
                event_date="21 Nov 2018",
                title="Laparoscopic Appendectomy",
                description="Performed at City General Hospital by Dr. K. S. Verma.",
                source_type="SURGERY",
                source_id=s1.id,
            ),
            TimelineEvent(
                id=str(uuid.uuid4()),
                patient_id=pid,
                event_type="ALLERGY",
                event_date="10 Mar 2015",
                title="Severe Penicillin Allergy Recorded",
                description="Severe rash and breathing difficulty after dental injection.",
                source_type="ALLERGY",
                source_id=a1.id,
            ),
        ]
        db.add_all(t_events)

    # 2. Check if Dr. Sharma exists
    stmt = select(Identity).where(
        Identity.identifier_value.in_(["+91 98765 00001", "9876500001", "drsharma@abdm"])
    )
    res = await db.execute(stmt)
    existing_doc_id = res.scalars().first()

    if not existing_doc_id:
        doctor_user = User(
            id=str(uuid.uuid4()),
            role=UserRole.DOCTOR,
            is_active=True,
        )
        db.add(doctor_user)
        await db.flush()

        doc_mobile = Identity(
            id=str(uuid.uuid4()),
            user_id=doctor_user.id,
            identity_type=IdentityType.MOBILE,
            identifier_value="+91 98765 00001",
            verified_at=datetime.now(timezone.utc),
        )
        doc_abha = Identity(
            id=str(uuid.uuid4()),
            user_id=doctor_user.id,
            identity_type=IdentityType.ABHA,
            identifier_value="drsharma@abdm",
            verified_at=datetime.now(timezone.utc),
        )
        doc_profile = DoctorProfile(
            id=str(uuid.uuid4()),
            user_id=doctor_user.id,
            full_name="Dr. Rajesh Sharma",
            specialization="General Medicine & Family Health",
            hospital_clinic="City Health Clinic",
            department="Internal Medicine",
            registration_number="DMC-2012-45890",
            languages_spoken="English, Hindi",
            years_of_experience=14,
            onboarding_completed=True,
        )
        doc_pref = UserPreferences(
            id=str(uuid.uuid4()),
            user_id=doctor_user.id,
            language="en",
            text_size="normal",
            high_contrast=False,
            voice_enabled=False,
        )
        db.add_all([doc_mobile, doc_abha, doc_profile, doc_pref])

    await db.commit()
    return {"status": "success", "message": "Demo data initialized with Ramesh Kumar, Dr. Sharma, and Phase 3 extractions"}


async def reset_demo_database(db: AsyncSession) -> dict:
    """Clear all records including clinical entities, lab results, extractions, and interviews, then re-seed clean demo accounts."""
    await db.execute(delete(UrgentInterviewAlert))
    await db.execute(delete(InterviewAnswer))
    await db.execute(delete(ClinicalInterview))
    await db.execute(delete(ExtractedEntity))
    await db.execute(delete(DocumentExtraction))
    await db.execute(delete(LabResult))
    await db.execute(delete(TimelineEvent))
    await db.execute(delete(MedicalDocument))
    await db.execute(delete(Surgery))
    await db.execute(delete(FamilyHistory))
    await db.execute(delete(Allergy))
    await db.execute(delete(Medication))
    await db.execute(delete(Condition))
    await db.execute(delete(UserPreferences))
    await db.execute(delete(DoctorProfile))
    await db.execute(delete(PatientProfile))
    await db.execute(delete(Identity))
    await db.execute(delete(User))
    await db.commit()

    return await seed_demo_data(db)
