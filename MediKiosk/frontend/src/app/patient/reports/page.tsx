'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import { MedicalDocument } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AudioHelper } from '@/components/common/AudioHelper';
import {
  FileText,
  Camera,
  Upload,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Building2,
  User,
  X,
  Eye,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function PatientReportsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Flow State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState<'SELECT_INPUT' | 'QUALITY_CHECK' | 'METADATA_AND_SUBMIT'>('SELECT_INPUT');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [qualityAdvisory, setQualityAdvisory] = useState<string | null>(null);

  const [form, setForm] = useState({
    document_type: 'prescription',
    document_date: new Date().toISOString().split('T')[0],
    hospital_name: '',
    doctor_name: '',
    patient_notes: '',
  });

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.listDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setQualityAdvisory(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewUrl(result);

        // Pre-check image resolution
        const img = new Image();
        img.onload = () => {
          if (img.width < 500 || img.height < 500) {
            setQualityAdvisory('Photo resolution is somewhat low. Make sure text is readable.');
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
      setUploadStep('QUALITY_CHECK');
    } else {
      setPreviewUrl(null);
      setUploadStep('METADATA_AND_SUBMIT');
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFilePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setQualityAdvisory(null);
    setUploadStep('SELECT_INPUT');
    setShowUploadModal(false);
    setForm({
      document_type: 'prescription',
      document_date: new Date().toISOString().split('T')[0],
      hospital_name: '',
      doctor_name: '',
      patient_notes: '',
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', form.document_type);
      if (form.document_date) formData.append('document_date', form.document_date);
      if (form.hospital_name) formData.append('hospital_name', form.hospital_name);
      if (form.doctor_name) formData.append('doctor_name', form.doctor_name);
      if (form.patient_notes) formData.append('patient_notes', form.patient_notes);

      const createdDoc = await api.uploadDocument(formData);

      // Trigger automatic extraction pipeline
      try {
        await api.triggerDocumentProcessing(createdDoc.id);
      } catch (procErr) {
        console.warn('Auto processing trigger:', procErr);
      }

      resetUploadState();
      await loadDocuments();

      // Navigate to review screen
      router.push(`/patient/reports/${createdDoc.id}/review`);
    } catch (err: any) {
      alert(err.message || 'Upload failed. Please check file type and size.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-600" />
            {t.reports.title}
          </h1>
          <p className="text-gray-600 mt-1">{t.reports.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <AudioHelper text="Here you can upload prescriptions, lab reports and hospital summaries. Our scanner will read the medicine names and test results for you to check." />
          <Button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-semibold h-12 px-5"
          >
            <Plus className="w-5 h-5" />
            {t.reports.uploadTitle}
          </Button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraChange}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,image/png,image/jpeg,image/webp,.txt"
        className="hidden"
        onChange={handleFilePickerChange}
      />

      {/* Upload Wizard Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
            <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-emerald-300" />
                <h3 className="font-bold text-lg">{t.reports.uploadTitle}</h3>
              </div>
              <button onClick={resetUploadState} className="p-1 hover:bg-white/20 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* STEP 1: SELECT INPUT SOURCE */}
              {uploadStep === 'SELECT_INPUT' && (
                <div className="space-y-4 py-2">
                  <p className="text-sm text-gray-600 font-medium text-center mb-4">
                    Choose how you would like to add your medical document:
                  </p>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full p-5 border-2 border-emerald-500/40 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl flex items-center gap-4 transition-all text-left group shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900">{t.reports.takePhoto || 'Take Photo with Camera'}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">Capture prescription or report using your device camera</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-5 border-2 border-gray-200 hover:border-teal-500 bg-gray-50/70 hover:bg-teal-50/40 rounded-2xl flex items-center gap-4 transition-all text-left group shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900">{t.reports.uploadFile || 'Upload Photo or PDF'}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">Select PDF, JPG, PNG from your device storage</p>
                    </div>
                  </button>
                </div>
              )}

              {/* STEP 2: QUALITY CHECK ADVISORY */}
              {uploadStep === 'QUALITY_CHECK' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-sm">Check Document Photo Quality</h4>

                  {previewUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-900 max-h-56 flex items-center justify-center">
                      <img src={previewUrl} alt="Preview" className="max-h-56 w-auto object-contain" />
                    </div>
                  )}

                  {qualityAdvisory ? (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{qualityAdvisory}</p>
                        <p className="mt-0.5 text-amber-800">Make sure lighting is bright and steady for best OCR extraction.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Photo looks clear and ready for scanning!</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={() => setUploadStep('SELECT_INPUT')}
                    >
                      <RotateCcw className="w-4 h-4" /> Retake Photo
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => setUploadStep('METADATA_AND_SUBMIT')}
                    >
                      Continue to Details <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: METADATA & SUBMIT */}
              {uploadStep === 'METADATA_AND_SUBMIT' && (
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {t.reports.docTypeLabel}
                    </label>
                    <select
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-medium text-sm text-gray-900"
                      value={form.document_type}
                      onChange={(e) => setForm({ ...form, document_type: e.target.value })}
                    >
                      <option value="prescription">{t.reports.typePrescription}</option>
                      <option value="lab_report">{t.reports.typeLab}</option>
                      <option value="discharge_summary">{t.reports.typeDischarge}</option>
                      <option value="imaging_report">{t.reports.typeImaging}</option>
                      <option value="other">{t.reports.typeOther}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        {t.reports.docDateLabel}
                      </label>
                      <input
                        type="date"
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                        value={form.document_date}
                        onChange={(e) => setForm({ ...form, document_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        {t.reports.hospitalLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={t.reports.hospitalPlaceholder}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                        value={form.hospital_name}
                        onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {t.reports.doctorLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.reports.doctorPlaceholder}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                      value={form.doctor_name}
                      onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {t.reports.notesLabel}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={t.reports.notesPlaceholder}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                      value={form.patient_notes}
                      onChange={(e) => setForm({ ...form, patient_notes: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUploadStep(previewUrl ? 'QUALITY_CHECK' : 'SELECT_INPUT')}
                      disabled={uploading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 shadow-lg"
                      disabled={uploading}
                    >
                      {uploading ? t.reports.uploading : 'Scan & Extract Information'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">Loading reports...</p>
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t.reports.emptyReports}</h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm">{t.reports.emptyReportsPrompt}</p>
          <Button onClick={() => setShowUploadModal(true)} className="bg-emerald-600 text-white">
            <Plus className="w-4 h-4 mr-1.5" />
            {t.reports.uploadTitle}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-5 hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base line-clamp-1">{doc.file_name}</h3>
                    <Badge variant="blue" className="text-[11px] mt-0.5">
                      {doc.document_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <Badge variant={doc.verification_status === 'Patient verified' ? 'green' : 'gray'}>
                  {doc.verification_status}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 my-3">
                {doc.document_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Date: {doc.document_date}</span>
                  </div>
                )}
                {doc.hospital_name && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span>{doc.hospital_name}</span>
                  </div>
                )}
                {doc.doctor_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>{doc.doctor_name}</span>
                  </div>
                )}
              </div>

              {doc.patient_notes && (
                <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg mb-3">
                  "{doc.patient_notes}"
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Link
                  href={`/patient/reports/${doc.id}/review`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.reports.viewReview || 'Review Extracted Info'}
                </Link>

                <Link
                  href={`/patient/reports/${doc.id}`}
                  className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
