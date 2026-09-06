import {
  AuthResponse,
  UserSession,
  PatientProfile,
  DoctorProfile,
  UserPreferences,
  Condition,
  Medication,
  Allergy,
  FamilyHistory,
  Surgery,
  MedicalDocument,
  TimelineEvent,
  HealthSummary,
  HealthRecord,
  DocumentExtraction,
  ProcessingStatus,
  ExtractedEntity,
  LabResult,
  InterviewState,
  ClinicalInterview,
  InterviewAnswer,
} from './types';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1`;
class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('medikiosk_token');
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'Something went wrong. Your information is safe. Please try again.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        if (response.status === 500 || response.statusText?.toLowerCase().includes('internal server error')) {
          errorMessage = 'Unable to reach the MediKiosk service. Please ensure the backend server is running and try again.';
        } else {
          errorMessage = response.statusText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // -----------------------------------------------------------
  // Auth
  // -----------------------------------------------------------
  async requestOtp(identity_type: string, identifier: string) {
    return this.request<{ challenge_id: string; message: string; demo_hint?: string }>('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ identity_type, identifier }),
    });
  }

  async verifyOtp(identity_type: string, identifier: string, otp: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identity_type, identifier, otp }),
    });
  }

  async getMe(): Promise<UserSession> {
    return this.request<UserSession>('/auth/me');
  }

  async setRole(role: 'PATIENT' | 'DOCTOR'): Promise<UserSession> {
    return this.request<UserSession>('/auth/role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('medikiosk_token');
        localStorage.removeItem('medikiosk_user');
      }
    }
  }

  // -----------------------------------------------------------
  // Profile
  // -----------------------------------------------------------
  async getPatientProfile(): Promise<PatientProfile> {
    return this.request<PatientProfile>('/patient/profile');
  }

  async savePatientProfile(data: PatientProfile): Promise<PatientProfile> {
    return this.request<PatientProfile>('/patient/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDoctorProfile(): Promise<DoctorProfile> {
    return this.request<DoctorProfile>('/doctor/profile');
  }

  async saveDoctorProfile(data: DoctorProfile): Promise<DoctorProfile> {
    return this.request<DoctorProfile>('/doctor/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async searchPatient(identifier: string) {
    return this.request<{ found: boolean; patient: any; message: string }>('/doctor/patients/search', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  // -----------------------------------------------------------
  // Phase 2: Health Record & Summary
  // -----------------------------------------------------------
  async getHealthRecord(): Promise<HealthRecord> {
    return this.request<HealthRecord>('/patient/health');
  }

  async getHealthSummary(): Promise<HealthSummary> {
    return this.request<HealthSummary>('/patient/summary');
  }

  // -----------------------------------------------------------
  // Phase 2: Conditions
  // -----------------------------------------------------------
  async listConditions(): Promise<Condition[]> {
    return this.request<Condition[]>('/patient/conditions');
  }

  async createCondition(data: Partial<Condition>): Promise<Condition> {
    return this.request<Condition>('/patient/conditions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCondition(id: string, data: Partial<Condition>): Promise<Condition> {
    return this.request<Condition>(`/patient/conditions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCondition(id: string): Promise<any> {
    return this.request(`/patient/conditions/${id}`, { method: 'DELETE' });
  }

  // -----------------------------------------------------------
  // Phase 2: Medications
  // -----------------------------------------------------------
  async listMedications(): Promise<Medication[]> {
    return this.request<Medication[]>('/patient/medicines');
  }

  async createMedication(data: Partial<Medication>): Promise<Medication> {
    return this.request<Medication>('/patient/medicines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMedication(id: string, data: Partial<Medication>): Promise<Medication> {
    return this.request<Medication>(`/patient/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMedication(id: string): Promise<any> {
    return this.request(`/patient/medicines/${id}`, { method: 'DELETE' });
  }

  // -----------------------------------------------------------
  // Phase 2: Allergies
  // -----------------------------------------------------------
  async listAllergies(): Promise<Allergy[]> {
    return this.request<Allergy[]>('/patient/allergies');
  }

  async createAllergy(data: Partial<Allergy>): Promise<Allergy> {
    return this.request<Allergy>('/patient/allergies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAllergy(id: string, data: Partial<Allergy>): Promise<Allergy> {
    return this.request<Allergy>(`/patient/allergies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAllergy(id: string): Promise<any> {
    return this.request(`/patient/allergies/${id}`, { method: 'DELETE' });
  }

  // -----------------------------------------------------------
  // Phase 2: Family History
  // -----------------------------------------------------------
  async listFamily(): Promise<FamilyHistory[]> {
    return this.request<FamilyHistory[]>('/patient/family');
  }

  async createFamily(data: Partial<FamilyHistory>): Promise<FamilyHistory> {
    return this.request<FamilyHistory>('/patient/family', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFamily(id: string, data: Partial<FamilyHistory>): Promise<FamilyHistory> {
    return this.request<FamilyHistory>(`/patient/family/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFamily(id: string): Promise<any> {
    return this.request(`/patient/family/${id}`, { method: 'DELETE' });
  }

  // -----------------------------------------------------------
  // Phase 2: Surgeries
  // -----------------------------------------------------------
  async listSurgeries(): Promise<Surgery[]> {
    return this.request<Surgery[]>('/patient/surgeries');
  }

  async createSurgery(data: Partial<Surgery>): Promise<Surgery> {
    return this.request<Surgery>('/patient/surgeries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSurgery(id: string, data: Partial<Surgery>): Promise<Surgery> {
    return this.request<Surgery>(`/patient/surgeries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSurgery(id: string): Promise<any> {
    return this.request(`/patient/surgeries/${id}`, { method: 'DELETE' });
  }

  // -----------------------------------------------------------
  // Phase 2: Medical Documents
  // -----------------------------------------------------------
  async listDocuments(): Promise<MedicalDocument[]> {
    return this.request<MedicalDocument[]>('/patient/documents');
  }

  async getDocument(id: string): Promise<MedicalDocument> {
    return this.request<MedicalDocument>(`/patient/documents/${id}`);
  }

  async uploadDocument(formData: FormData): Promise<MedicalDocument> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/patient/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async updateDocument(id: string, data: Partial<MedicalDocument>): Promise<MedicalDocument> {
    return this.request<MedicalDocument>(`/patient/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id: string): Promise<any> {
    return this.request(`/patient/documents/${id}`, { method: 'DELETE' });
  }

  // -----------------------------------------------------------
  // Phase 2: Timeline
  // -----------------------------------------------------------
  async getTimeline(filter?: string): Promise<TimelineEvent[]> {
    const q = filter && filter !== 'ALL' ? `?filter=${encodeURIComponent(filter)}` : '';
    return this.request<TimelineEvent[]>(`/patient/timeline${q}`);
  }

  // -----------------------------------------------------------
  // Phase 3: Document Intelligence & Structured Extraction
  // -----------------------------------------------------------
  async triggerDocumentProcessing(documentId: string): Promise<ProcessingStatus> {
    return this.request<ProcessingStatus>(`/patient/documents/${documentId}/process`, {
      method: 'POST',
    });
  }

  async getDocumentProcessingStatus(documentId: string): Promise<ProcessingStatus> {
    return this.request<ProcessingStatus>(`/patient/documents/${documentId}/processing-status`);
  }

  async getDocumentExtraction(documentId: string): Promise<DocumentExtraction> {
    return this.request<DocumentExtraction>(`/patient/documents/${documentId}/extraction`);
  }

  async updateExtractedEntity(
    documentId: string,
    entityId: string,
    entityValue: Record<string, any>
  ): Promise<ExtractedEntity> {
    return this.request<ExtractedEntity>(`/patient/documents/${documentId}/extraction/${entityId}`, {
      method: 'PUT',
      body: JSON.stringify({ entity_value: entityValue }),
    });
  }

  async verifyDocumentExtraction(
    documentId: string,
    entityIds?: string[],
    duplicateResolution: string = 'ADD_NEW'
  ): Promise<{ status: string; confirmed_count: number; message: string }> {
    return this.request<{ status: string; confirmed_count: number; message: string }>(
      `/patient/documents/${documentId}/verify`,
      {
        method: 'POST',
        body: JSON.stringify({
          entity_ids: entityIds,
          duplicate_resolution: duplicateResolution,
        }),
      }
    );
  }

  async rejectExtractedEntity(documentId: string, entityId: string): Promise<ExtractedEntity> {
    return this.request<ExtractedEntity>(`/patient/documents/${documentId}/reject/${entityId}`, {
      method: 'POST',
    });
  }

  async getLabResults(): Promise<LabResult[]> {
    return this.request<LabResult[]>('/patient/lab-results');
  }

  // -----------------------------------------------------------
  // Phase 4: Adaptive AI Health Interview
  // -----------------------------------------------------------
  async startOrResumeInterview(branch?: string): Promise<InterviewState> {
    return this.request<InterviewState>('/patient/interviews', {
      method: 'POST',
      body: JSON.stringify({ branch }),
    });
  }

  async listInterviews(): Promise<ClinicalInterview[]> {
    return this.request<ClinicalInterview[]>('/patient/interviews');
  }

  async getInterviewState(interviewId: string): Promise<InterviewState> {
    return this.request<InterviewState>(`/patient/interviews/${interviewId}`);
  }

  async submitInterviewAnswer(
    interviewId: string,
    data: {
      question_id: string;
      question_text: string;
      answer_text: string;
      answer_type?: string;
      source?: string;
    }
  ): Promise<InterviewState> {
    return this.request<InterviewState>(`/patient/interviews/${interviewId}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        answer_type: 'CHOICE',
        source: 'TOUCH',
        ...data,
      }),
    });
  }

  async editInterviewAnswer(
    interviewId: string,
    answerId: string,
    answerText: string
  ): Promise<any> {
    return this.request(`/patient/interviews/${interviewId}/answers/${answerId}`, {
      method: 'PUT',
      body: JSON.stringify({ answer_text: answerText }),
    });
  }

  async confirmInterview(
    interviewId: string,
    saveToRecord: boolean = true
  ): Promise<{ status: string; message: string; interview_id: string }> {
    return this.request<{ status: string; message: string; interview_id: string }>(
      `/patient/interviews/${interviewId}/confirm`,
      {
        method: 'POST',
        body: JSON.stringify({ save_to_health_record: saveToRecord }),
      }
    );
  }

  async abandonInterview(interviewId: string): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(
      `/patient/interviews/${interviewId}/abandon`,
      { method: 'POST' }
    );
  }

  // -----------------------------------------------------------
  // Preferences & Dev
  // -----------------------------------------------------------
  async getPreferences(): Promise<UserPreferences> {
    return this.request<UserPreferences>('/preferences');
  }

  async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.request<UserPreferences>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async resetDemo() {
    return this.request<{ status: string; message: string }>('/dev/reset-demo', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
