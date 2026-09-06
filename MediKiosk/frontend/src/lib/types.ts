export type UserRole = 'PENDING' | 'PATIENT' | 'DOCTOR';
export type IdentityType = 'ABHA' | 'AADHAAR' | 'MOBILE';

export interface Identity {
  id: string;
  identity_type: IdentityType;
  identifier_value: string;
  verified_at?: string;
}

export interface PatientProfile {
  id?: string;
  user_id?: string;
  full_name: string;
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
  address?: string;
  blood_group?: string;
  emergency_contact?: string;
  onboarding_completed: boolean;
}

export interface DoctorProfile {
  id?: string;
  user_id?: string;
  full_name: string;
  specialization: string;
  hospital_clinic?: string;
  department?: string;
  registration_number?: string;
  languages_spoken?: string;
  years_of_experience?: number;
  onboarding_completed: boolean;
}

export interface UserPreferences {
  language: 'en' | 'hi';
  text_size: 'normal' | 'large' | 'extra-large';
  high_contrast: boolean;
  voice_enabled: boolean;
}

export interface UserSession {
  id: string;
  role: UserRole;
  is_active: boolean;
  identities: Identity[];
  patient_profile?: PatientProfile;
  doctor_profile?: DoctorProfile;
  preferences?: UserPreferences;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserSession;
}

// -------------------------------------------------------------
// Phase 2 Clinical Types
// -------------------------------------------------------------
export interface Condition {
  id: string;
  patient_id: string;
  condition_name: string;
  diagnosis_date?: string;
  status: string;
  doctor_hospital?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  medicine_name: string;
  dose?: string;
  frequency?: string;
  route?: string;
  start_date?: string;
  end_date?: string;
  prescribed_by?: string;
  purpose?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Allergy {
  id: string;
  patient_id: string;
  allergen: string;
  reaction?: string;
  severity: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyHistory {
  id: string;
  patient_id: string;
  relation: string;
  condition: string;
  age_at_diagnosis?: string;
  status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Surgery {
  id: string;
  patient_id: string;
  procedure_name: string;
  surgery_date?: string;
  hospital?: string;
  doctor?: string;
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalDocument {
  id: string;
  patient_id: string;
  document_type: string;
  file_name: string;
  storage_key: string;
  file_url?: string;
  mime_type: string;
  file_size: number;
  document_date?: string;
  uploaded_at: string;
  hospital_name?: string;
  doctor_name?: string;
  patient_notes?: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  patient_id: string;
  event_type: string;
  event_date?: string;
  title: string;
  description?: string;
  source_type?: string;
  source_id?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthSummary {
  conditions_count: number;
  active_conditions_count: number;
  medications_count: number;
  current_medications_count: number;
  allergies_count: number;
  reports_count: number;
  surgeries_count: number;
  completeness_percent: number;
  last_updated?: string;
}

export interface HealthRecord {
  summary: HealthSummary;
  conditions: Condition[];
  medications: Medication[];
  allergies: Allergy[];
  family_history: FamilyHistory[];
  surgeries: Surgery[];
  recent_documents: MedicalDocument[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedEntity {
  id: string;
  document_extraction_id: string;
  entity_type: string; // MEDICATION, LAB_RESULT, CONDITION, ALLERGY, SURGERY, DOCTOR_NAME, HOSPITAL_NAME, DOCUMENT_DATE
  entity_value: Record<string, any>;
  normalized_value?: string;
  confidence: number;
  page_number: number;
  source_text: string;
  bounding_box?: BoundingBox;
  verification_status: string; // NEEDS_REVIEW, PATIENT_VERIFIED, PATIENT_CORRECTED, REJECTED
  patient_corrected: boolean;
  matched_existing_id?: string;
  target_record_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentExtraction {
  id: string;
  document_id: string;
  patient_id: string;
  extraction_status: string; // QUEUED, PROCESSING, EXTRACTED, NEEDS_REVIEW, PATIENT_VERIFIED, REJECTED, FAILED
  current_step: string;
  ocr_text?: string;
  detected_language: string;
  ocr_confidence: number;
  structured_data?: Record<string, any>;
  processing_provider: string;
  quality_issues?: string;
  processed_at?: string;
  entities: ExtractedEntity[];
}

export interface ProcessingStatus {
  document_id: string;
  extraction_id?: string;
  extraction_status: string;
  current_step: string;
  quality_advisory?: string;
  entities_count: number;
}

export interface LabResult {
  id: string;
  patient_id: string;
  document_id?: string;
  test_name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  status: string; // WITHIN_RANGE, ABOVE_RANGE, BELOW_RANGE, UNKNOWN
  test_date?: string;
  source_page?: number;
  source_text?: string;
  confidence: number;
  verification_status: string;
  created_at: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  label_hi?: string;
  icon?: string;
  description?: string;
}

export interface QuestionDTO {
  id: string;
  branch: string;
  text: string;
  text_hi?: string;
  voice_prompt?: string;
  voice_prompt_hi?: string;
  help_text?: string;
  help_text_hi?: string;
  step_label: string;
  answer_type: string;
  options: QuestionOption[];
  required: boolean;
  allow_voice: boolean;
  allow_text: boolean;
  placeholder?: string;
}

export interface UrgentAlert {
  id: string;
  patient_id: string;
  interview_id: string;
  triggered_rule: string;
  status: string;
  created_at: string;
}

export interface InterviewState {
  interview_id: string;
  status: string;
  safety_status: string;
  branch: string;
  current_question?: QuestionDTO;
  completed_questions_count: number;
  total_estimated_steps: number;
  progress_percentage: number;
  chief_complaint?: string;
  urgent_alert?: UrgentAlert;
  summary?: Record<string, any>;
}

export interface InterviewAnswer {
  id: string;
  interview_id: string;
  question_id: string;
  question_text: string;
  answer_text: string;
  normalized_value?: Record<string, any>;
  answer_type: string;
  source: string;
  created_at: string;
}

export interface ClinicalInterview {
  id: string;
  patient_id: string;
  branch: string;
  current_question_id: string;
  status: string;
  safety_status: string;
  chief_complaint?: string;
  summary?: Record<string, any>;
  started_at: string;
  completed_at?: string;
  created_at: string;
  answers: InterviewAnswer[];
  alerts: UrgentAlert[];
}

