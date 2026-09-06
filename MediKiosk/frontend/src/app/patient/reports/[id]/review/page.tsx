'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import { MedicalDocument, DocumentExtraction, ExtractedEntity } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AudioHelper } from '@/components/common/AudioHelper';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  ArrowLeft,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function DocumentReviewPage() {
  const params = useParams();
  const docId = params.id as string;
  const router = useRouter();
  const { t } = useTranslation();

  const [document, setDocument] = useState<MedicalDocument | null>(null);
  const [extraction, setExtraction] = useState<DocumentExtraction | null>(null);
  const [entities, setEntities] = useState<ExtractedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [duplicateChoices, setDuplicateChoices] = useState<Record<string, 'ADD_NEW' | 'UPDATE_EXISTING'>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docData, extData] = await Promise.all([
        api.getDocument(docId),
        api.getDocumentExtraction(docId),
      ]);
      setDocument(docData);
      setExtraction(extData);
      setEntities(extData.entities || []);
      if (extData.entities && extData.entities.length > 0) {
        setActiveEntityId(extData.entities[0].id);
      }
    } catch (err) {
      console.error('Failed to load review data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [docId]);

  const activeEntity = entities.find((e) => e.id === activeEntityId);

  const handleStartEdit = (entity: ExtractedEntity) => {
    setEditingEntityId(entity.id);
    setEditForm({ ...entity.entity_value });
  };

  const handleSaveEdit = async (entityId: string) => {
    try {
      const updated = await api.updateExtractedEntity(docId, entityId, editForm);
      setEntities((prev) => prev.map((e) => (e.id === entityId ? updated : e)));
      setEditingEntityId(null);
    } catch (err) {
      console.error('Failed to update entity:', err);
    }
  };

  const handleReject = async (entityId: string) => {
    try {
      const rejected = await api.rejectExtractedEntity(docId, entityId);
      setEntities((prev) => prev.map((e) => (e.id === entityId ? rejected : e)));
    } catch (err) {
      console.error('Failed to reject entity:', err);
    }
  };

  const handleLooksCorrect = (entityId: string) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === entityId ? { ...e, verification_status: 'PATIENT_VERIFIED' } : e))
    );
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      // Select non-rejected entities
      const toConfirm = entities.filter((e) => e.verification_status !== 'REJECTED');
      for (const ent of toConfirm) {
        const dupRes = duplicateChoices[ent.id] || 'ADD_NEW';
        await api.verifyDocumentExtraction(docId, [ent.id], dupRes);
      }
      setSuccessMessage(t.reports.allConfirmed || 'All information saved to your health record!');
      setTimeout(() => {
        router.push('/patient/health');
      }, 1500);
    } catch (err) {
      console.error('Failed to verify entities:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium text-lg">{t.reports.reading || 'Reading document...'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <Link
            href="/patient/reports"
            className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 mb-2 gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Medical Reports
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-600" />
              {t.reports.reviewTitle || 'Review Extracted Information'}
            </h1>
            <Badge variant="blue">{document?.document_type.replace('_', ' ').toUpperCase()}</Badge>
          </div>
          <p className="text-gray-600 text-sm mt-1 max-w-2xl">
            {t.reports.reviewSub ||
              'Our smart scanner read your document. Please verify each item below before it is saved to your permanent health record.'}
          </p>
        </div>

        <AudioHelper
          text="We found medical information in your document. Please check the items on the right. You can edit any mistakes or remove items you do not want to save."
        />
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl flex items-center gap-3 text-emerald-900 font-semibold shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Split Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Original Document Viewer & Bounding Box Source Highlight */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="truncate max-w-[200px]">{document?.file_name}</span>
              </div>
              {document?.file_url && (
                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Full File
                </a>
              )}
            </div>

            {/* Document Interactive Preview Canvas */}
            <div className="relative min-h-[420px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col items-center justify-start p-4">
              {/* OCR Text / Simulated Document Paper */}
              <div className="w-full bg-amber-50/95 text-slate-900 rounded-lg p-5 shadow-inner font-mono text-xs leading-relaxed relative min-h-[380px] select-text">
                <div className="border-b border-gray-300 pb-2 mb-3 text-center">
                  <p className="font-bold text-sm tracking-wide uppercase text-slate-800">
                    {document?.hospital_name || 'Medical Document Record'}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Date: {document?.document_date || 'Unknown Date'} | Patient: Ramesh Kumar
                  </p>
                </div>

                {extraction?.ocr_text ? (
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-normal">
                    {extraction.ocr_text}
                  </pre>
                ) : (
                  <p className="text-slate-500 italic text-center py-10">Document text preview loaded.</p>
                )}

                {/* Visual Bounding Box Glow Highlight for Active Entity */}
                {activeEntity?.bounding_box && (
                  <div
                    className="absolute border-2 border-emerald-500 bg-emerald-400/20 rounded pointer-events-none transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    style={{
                      left: `${Math.max(5, activeEntity.bounding_box.x)}%`,
                      top: `${Math.max(5, activeEntity.bounding_box.y)}%`,
                      width: `${Math.min(90, activeEntity.bounding_box.width)}%`,
                      height: `${Math.min(25, activeEntity.bounding_box.height * 2.5)}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      Highlighted Source
                    </span>
                  </div>
                )}
              </div>

              {/* Source Reference Caption Bar */}
              {activeEntity && (
                <div className="w-full mt-3 p-2.5 bg-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-2 border border-slate-700">
                  <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-400">
                      {t.reports.sourceTrace || 'Original text from document:'}
                    </span>
                    <p className="font-mono text-slate-200 mt-0.5">"{activeEntity.source_text}"</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Extracted Entities Review Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>Items Found in Document ({entities.length})</span>
            </h2>
            <span className="text-xs text-gray-500 font-medium">Click any item to see where it was found</span>
          </div>

          {entities.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No structured items found. You can add them manually from your health record.
            </Card>
          ) : (
            <div className="space-y-4">
              {entities.map((entity) => {
                const isActive = entity.id === activeEntityId;
                const isEditing = entity.id === editingEntityId;
                const val = entity.entity_value || {};
                const isRejected = entity.verification_status === 'REJECTED';
                const isConfirmed = entity.verification_status === 'PATIENT_VERIFIED';

                return (
                  <div
                    key={entity.id}
                    onClick={() => setActiveEntityId(entity.id)}
                    className={`rounded-2xl transition-all duration-200 border-2 cursor-pointer ${
                      isActive
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                        : isRejected
                        ? 'border-gray-200 bg-gray-50 opacity-60'
                        : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="p-4 space-y-3">
                      {/* Entity Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                            {entity.entity_type.replace('_', ' ')}
                          </span>
                          {entity.patient_corrected && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                              Edited by you
                            </span>
                          )}
                          {isConfirmed && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Confirmed
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                              Rejected
                            </span>
                          )}
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!isRejected && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleLooksCorrect(entity.id)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                                  isConfirmed
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                {t.reports.looksCorrect || 'Looks correct'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStartEdit(entity)}
                                className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                {t.reports.edit || 'Edit'}
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleReject(entity.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                            title="Reject item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Entity Content: Edit Form vs View Card */}
                      {isEditing ? (
                        <div
                          className="bg-white p-3 rounded-xl border border-blue-200 space-y-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-xs font-bold text-blue-900 uppercase">Edit Information</p>
                          {entity.entity_type === 'MEDICATION' && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs font-medium text-gray-600">Medicine Name</label>
                                <input
                                  type="text"
                                  className="w-full text-sm p-1.5 border rounded"
                                  value={editForm.medicine_name || ''}
                                  onChange={(e) => setEditForm({ ...editForm, medicine_name: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600">Dose</label>
                                <input
                                  type="text"
                                  className="w-full text-sm p-1.5 border rounded"
                                  value={editForm.dose || ''}
                                  onChange={(e) => setEditForm({ ...editForm, dose: e.target.value })}
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="text-xs font-medium text-gray-600">Instructions / Frequency</label>
                                <input
                                  type="text"
                                  className="w-full text-sm p-1.5 border rounded"
                                  value={editForm.frequency || ''}
                                  onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                                />
                              </div>
                            </div>
                          )}

                          {entity.entity_type === 'LAB_RESULT' && (
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-xs font-medium text-gray-600">Test Name</label>
                                <input
                                  type="text"
                                  className="w-full text-sm p-1.5 border rounded"
                                  value={editForm.test_name || ''}
                                  onChange={(e) => setEditForm({ ...editForm, test_name: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600">Value</label>
                                <input
                                  type="text"
                                  className="w-full text-sm p-1.5 border rounded font-bold"
                                  value={editForm.value || ''}
                                  onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600">Unit</label>
                                <input
                                  type="text"
                                  className="w-full text-sm p-1.5 border rounded"
                                  value={editForm.unit || ''}
                                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button size="sm" variant="outline" onClick={() => setEditingEntityId(null)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => handleSaveEdit(entity.id)}>
                              Save Edits
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Read-only Entity Summary */
                        <div className="space-y-1.5">
                          {/* Medication layout */}
                          {entity.entity_type === 'MEDICATION' && (
                            <div>
                              <p className="text-base font-bold text-gray-900">{val.medicine_name}</p>
                              <p className="text-sm text-gray-700 font-medium">
                                {val.dose} • {val.frequency}
                              </p>
                              {val.instructions && (
                                <p className="text-xs text-gray-500 italic mt-0.5">{val.instructions}</p>
                              )}
                            </div>
                          )}

                          {/* Lab Result layout (Non-alarmist reference range comparison) */}
                          {entity.entity_type === 'LAB_RESULT' && (
                            <div>
                              <div className="flex items-baseline justify-between">
                                <p className="text-base font-bold text-gray-900">{val.test_name}</p>
                                <p className="text-lg font-extrabold text-slate-900">
                                  {val.value} <span className="text-sm font-normal text-gray-600">{val.unit}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                {val.status === 'WITHIN_RANGE' ? (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    {t.reports.withinRange || 'Within standard reference range'}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900">
                                    {t.reports.outsideRange || 'Outside the provided reference range'}
                                  </span>
                                )}
                                {val.reference_range && (
                                  <span className="text-xs text-gray-500">Ref: {val.reference_range}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Condition layout */}
                          {entity.entity_type === 'CONDITION' && (
                            <div>
                              <p className="text-base font-bold text-gray-900">{val.condition_name}</p>
                              <p className="text-xs text-gray-600">Status: {val.status || 'Active'}</p>
                            </div>
                          )}

                          {/* Surgery layout */}
                          {entity.entity_type === 'SURGERY' && (
                            <div>
                              <p className="text-base font-bold text-gray-900">{val.procedure_name}</p>
                            </div>
                          )}

                          {/* Metadata entities */}
                          {['DOCTOR_NAME', 'HOSPITAL_NAME', 'DOCUMENT_DATE'].includes(entity.entity_type) && (
                            <p className="text-sm font-semibold text-gray-800">
                              {val.doctor_name || val.hospital_name || val.date}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Duplicate Detection Alert Banner */}
                      {entity.matched_existing_id && !isRejected && (
                        <div
                          className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>{t.reports.duplicateWarning || 'Already recorded in your file'}</span>
                          </div>
                          <p className="text-amber-800">
                            {t.reports.duplicatePrompt ||
                              'You already have this item. Choose how you would like to proceed:'}
                          </p>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setDuplicateChoices({ ...duplicateChoices, [entity.id]: 'UPDATE_EXISTING' })
                              }
                              className={`px-2 py-1 rounded text-xs font-semibold border ${
                                duplicateChoices[entity.id] === 'UPDATE_EXISTING'
                                  ? 'bg-amber-600 text-white border-amber-700'
                                  : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                              }`}
                            >
                              {t.reports.updateExisting || 'Update existing record'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDuplicateChoices({ ...duplicateChoices, [entity.id]: 'ADD_NEW' })
                              }
                              className={`px-2 py-1 rounded text-xs font-semibold border ${
                                duplicateChoices[entity.id] !== 'UPDATE_EXISTING'
                                  ? 'bg-amber-600 text-white border-amber-700'
                                  : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                              }`}
                            >
                              {t.reports.addNew || 'Keep both as separate entries'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky Bottom Action: Save Confirmed Info */}
          <div className="sticky bottom-4 pt-4 bg-white/90 backdrop-blur-sm border-t border-gray-200">
            <Button
              className="w-full h-14 text-base font-bold shadow-lg flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              onClick={handleSaveAll}
              disabled={saving || entities.filter((e) => e.verification_status !== 'REJECTED').length === 0}
            >
              <CheckCircle2 className="w-5 h-5" />
              {saving
                ? 'Saving to Health Record...'
                : t.reports.saveConfirmed || 'Save Confirmed Info to Health Record'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
