'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import { MedicalDocument } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VoiceButton } from '@/components/ui/VoiceButton';
import { AudioHelper } from '@/components/common/AudioHelper';
import {
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building2,
  User,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

export default function DocumentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const docId = params.id as string;

  const [doc, setDoc] = useState<MedicalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    document_type: '',
    document_date: '',
    hospital_name: '',
    doctor_name: '',
    patient_notes: '',
  });

  const loadDocument = async () => {
    try {
      setLoading(true);
      const data = await api.getDocument(docId);
      setDoc(data);
      setEditForm({
        document_type: data.document_type,
        document_date: data.document_date || '',
        hospital_name: data.hospital_name || '',
        doctor_name: data.doctor_name || '',
        patient_notes: data.patient_notes || '',
      });
    } catch (err) {
      console.error('Failed to load document:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (docId) {
      loadDocument();
    }
  }, [docId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateDocument(docId, editForm);
      setDoc(updated);
      setShowEditModal(false);
    } catch (err) {
      console.error('Update document error:', err);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await api.deleteDocument(docId);
        router.push('/patient/reports');
      } catch (err) {
        console.error('Delete document error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
        <p className="text-xl font-bold text-slate-800">Document not found</p>
        <Link href="/patient/reports">
          <Button variant="outline">Back to Reports</Button>
        </Link>
      </div>
    );
  }

  const isImage = doc.mime_type.startsWith('image/');
  const isDoctorVerified = doc.verification_status.toLowerCase().includes('doctor');
  const fileUrl = doc.file_url || `/api/v1/patient/documents/file/${doc.storage_key}`;

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6 animate-fadeIn pb-24 md:pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/patient/reports"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title={t.common.back}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 line-clamp-1">
              {doc.file_name}
            </h1>
            <p className="text-xs text-slate-500">
              Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}
            leftIcon={<Edit2 className="w-4 h-4" />}
          >
            {t.common.edit}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            leftIcon={<Trash2 className="w-4 h-4 text-rose-600" />}
            className="hover:border-rose-300 hover:bg-rose-50"
          >
            {t.common.delete}
          </Button>
        </div>
      </div>

      {/* Split Viewer: LEFT/TOP = Original document, RIGHT/BELOW = Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Original Document */}
        <Card className="lg:col-span-7 p-4 sm:p-6 border-2 border-slate-200 bg-slate-900/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              {t.reports.viewOriginal}
            </span>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
            >
              <span>Open in new tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-inner min-h-[400px] flex items-center justify-center">
            {isImage ? (
              <img
                src={fileUrl}
                alt={doc.file_name}
                className="w-full h-auto max-h-[650px] object-contain"
              />
            ) : (
              <iframe
                src={fileUrl}
                title={doc.file_name}
                className="w-full h-[650px] border-none"
              />
            )}
          </div>

          <div className="flex justify-end">
            <a href={fileUrl} download={doc.file_name}>
              <Button size="md" variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                {t.reports.download}
              </Button>
            </a>
          </div>
        </Card>

        {/* Right Column: Metadata & Details */}
        <Card className="lg:col-span-5 p-6 sm:p-8 border-2 border-slate-200 space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <Badge variant={isDoctorVerified ? 'teal' : 'gray'}>
                {isDoctorVerified ? (
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>{t.reports.statusDoctorVerified}</span>
                  </span>
                ) : (
                  t.reports.statusPatientAdded
                )}
              </Badge>
              <span className="text-xs font-semibold text-slate-400">
                {((doc.file_size || 0) / 1024).toFixed(1)} KB
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">{doc.file_name}</h2>
            <span className="text-sm font-bold text-teal-800 uppercase tracking-wide block">
              Type: {doc.document_type.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t.reports.docDateLabel}
              </label>
              <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{doc.document_date || 'Not recorded'}</span>
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t.reports.hospitalLabel}
              </label>
              <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{doc.hospital_name || 'Not recorded'}</span>
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t.reports.doctorLabel}
              </label>
              <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>{doc.doctor_name || 'Not recorded'}</span>
              </p>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t.reports.notesLabel}
              </label>
              {doc.patient_notes ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 leading-relaxed italic">
                  "{doc.patient_notes}"
                </div>
              ) : (
                <p className="text-xs text-slate-400">No notes added by patient.</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <Button
              size="lg"
              onClick={() => setShowEditModal(true)}
              className="w-full"
            >
              Edit Document Details
            </Button>
          </div>
        </Card>
      </div>

      {/* Edit Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">
                Edit Document Information
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.reports.docTypeLabel}
                </label>
                <select
                  value={editForm.document_type}
                  onChange={(e) => setEditForm({ ...editForm, document_type: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="prescription">{t.reports.typePrescription}</option>
                  <option value="lab_report">{t.reports.typeLab}</option>
                  <option value="discharge_summary">{t.reports.typeDischarge}</option>
                  <option value="imaging">{t.reports.typeImaging}</option>
                  <option value="medical_certificate">{t.reports.typeCertificate}</option>
                  <option value="other">{t.reports.typeOther}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.reports.docDateLabel}
                </label>
                <input
                  type="date"
                  value={editForm.document_date}
                  onChange={(e) => setEditForm({ ...editForm, document_date: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {t.reports.hospitalLabel}
                  </label>
                  <input
                    value={editForm.hospital_name}
                    onChange={(e) => setEditForm({ ...editForm, hospital_name: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {t.reports.doctorLabel}
                  </label>
                  <input
                    value={editForm.doctor_name}
                    onChange={(e) => setEditForm({ ...editForm, doctor_name: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    {t.reports.notesLabel}
                  </label>
                  <VoiceButton
                    onTranscript={(txt) => setEditForm({ ...editForm, patient_notes: txt })}
                  />
                </div>
                <textarea
                  rows={3}
                  value={editForm.patient_notes}
                  onChange={(e) => setEditForm({ ...editForm, patient_notes: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowEditModal(false)}
                  className="w-1/3"
                >
                  {t.common.cancel}
                </Button>
                <Button type="submit" size="md" className="w-2/3">
                  {t.common.save}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
