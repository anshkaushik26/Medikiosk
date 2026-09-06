'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import {
  HealthRecord,
  Condition,
  Medication,
  Allergy,
  FamilyHistory,
  Surgery,
  LabResult,
} from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VoiceButton } from '@/components/ui/VoiceButton';
import { AudioHelper } from '@/components/common/AudioHelper';
import {
  HeartPulse,
  Pill,
  AlertTriangle,
  Users,
  Scissors,
  FlaskConical,
  Plus,
  Edit2,
  Trash2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Leaf,
} from 'lucide-react';

export default function PatientHealthPage() {
  const { t } = useTranslation();
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Condition modal state
  const [showCondModal, setShowCondModal] = useState(false);
  const [editingCond, setEditingCond] = useState<Condition | null>(null);
  const [condForm, setCondForm] = useState({
    condition_name: '',
    diagnosis_date: '',
    status: 'Active',
    doctor_hospital: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordData, labsData] = await Promise.all([
        api.getHealthRecord(),
        api.getLabResults(),
      ]);
      setRecord(recordData);
      setLabResults(labsData);
    } catch (err) {
      console.error('Failed to load health record:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Condition handlers
  const handleOpenAddCond = () => {
    setEditingCond(null);
    setCondForm({
      condition_name: '',
      diagnosis_date: '',
      status: 'Active',
      doctor_hospital: '',
      notes: '',
    });
    setShowCondModal(true);
  };

  const handleOpenEditCond = (c: Condition) => {
    setEditingCond(c);
    setCondForm({
      condition_name: c.condition_name,
      diagnosis_date: c.diagnosis_date || '',
      status: c.status,
      doctor_hospital: c.doctor_hospital || '',
      notes: c.notes || '',
    });
    setShowCondModal(true);
  };

  const handleSaveCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCond) {
        await api.updateCondition(editingCond.id, condForm);
      } else {
        await api.createCondition(condForm);
      }
      setShowCondModal(false);
      await loadData();
    } catch (err) {
      console.error('Save condition error:', err);
    }
  };

  const handleDeleteCondition = async (id: string) => {
    if (confirm('Are you sure you want to remove this condition?')) {
      try {
        await api.deleteCondition(id);
        await loadData();
      } catch (err) {
        console.error('Delete condition error:', err);
      }
    }
  };

  if (loading && !record) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  const summary = record?.summary;

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              {t.health.title}
            </h1>
            <AudioHelper text={`${t.health.title}. ${t.health.subtitle}`} />
          </div>
          <p className="text-base text-slate-600 mt-1">
            {t.health.subtitle}
          </p>
        </div>

        <Link href="/patient/timeline">
          <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            {t.health.btnOpenTimeline}
          </Button>
        </Link>
      </div>

      {/* Health at a Glance Card (Section 15) */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-xl">
        <div className="flex items-center justify-between border-b border-teal-700/50 pb-4 mb-6">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-teal-300">
            {t.health.atAGlance}
          </span>
          <span className="text-xs text-teal-200">
            {t.health.lastUpdated}: {summary?.last_updated || 'Today'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur">
            <span className="text-2xl sm:text-3xl font-black text-white block">
              {summary?.active_conditions_count || 0}
            </span>
            <span className="text-xs text-teal-200 font-semibold block mt-1">
              {t.health.conditionsCount} (Active)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur">
            <span className="text-2xl sm:text-3xl font-black text-white block">
              {summary?.current_medications_count || 0}
            </span>
            <span className="text-xs text-teal-200 font-semibold block mt-1">
              {t.health.medicinesCount} (Current)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur">
            <span className="text-2xl sm:text-3xl font-black text-white block">
              {summary?.allergies_count || 0}
            </span>
            <span className="text-xs text-teal-200 font-semibold block mt-1">
              {t.health.allergiesCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur">
            <span className="text-2xl sm:text-3xl font-black text-white block">
              {summary?.reports_count || 0}
            </span>
            <span className="text-xs text-teal-200 font-semibold block mt-1">
              {t.health.reportsCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur col-span-2 sm:col-span-1">
            <span className="text-2xl sm:text-3xl font-black text-white block">
              {summary?.surgeries_count || 0}
            </span>
            <span className="text-xs text-teal-200 font-semibold block mt-1">
              {t.health.surgeriesCount}
            </span>
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="mt-6 pt-6 border-t border-teal-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-teal-200">
          <span>{t.health.completeness}: <strong className="text-white">{summary?.completeness_percent || 65}%</strong></span>
          <span>You can update or add any missing details at your own pace.</span>
        </div>
      </Card>

      {/* 1. Health Conditions Section */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.health.secConditions}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">{t.health.secConditionsDesc}</p>
            </div>
          </div>
          <Button size="md" onClick={handleOpenAddCond} leftIcon={<Plus className="w-4 h-4" />}>
            {t.health.btnAddCondition}
          </Button>
        </div>

        {(!record?.conditions || record.conditions.length === 0) ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <p className="text-base font-bold text-slate-700">{t.health.emptyConditions}</p>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{t.health.emptyConditionsPrompt}</p>
            <Button size="sm" variant="outline" onClick={handleOpenAddCond}>
              {t.health.btnAddCondition}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {record.conditions.map((cond) => (
              <div
                key={cond.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-slate-900">{cond.condition_name}</h3>
                    <Badge variant={cond.status.toLowerCase().includes('active') ? 'rose' : 'teal'}>
                      {cond.status}
                    </Badge>
                  </div>
                  {cond.diagnosis_date && (
                    <p className="text-xs text-slate-500">
                      Diagnosed: <span className="font-semibold text-slate-700">{cond.diagnosis_date}</span>
                    </p>
                  )}
                  {cond.doctor_hospital && (
                    <p className="text-xs text-slate-500">
                      Treating: <span className="font-semibold text-slate-700">{cond.doctor_hospital}</span>
                    </p>
                  )}
                  {cond.notes && (
                    <p className="text-sm text-slate-600 pt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {cond.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEditCond(cond)}
                    className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    title={t.common.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCondition(cond.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 2. Medicines Shortcut / Summary Section */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Pill className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.health.secMedicines}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">{t.health.secMedicinesDesc}</p>
            </div>
          </div>
          <Link href="/patient/medicines">
            <Button size="md" leftIcon={<Plus className="w-4 h-4" />}>
              {t.health.btnAddMedicine}
            </Button>
          </Link>
        </div>

        {(!record?.medications || record.medications.length === 0) ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <p className="text-base font-bold text-slate-700">{t.health.emptyMedicines}</p>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{t.health.emptyMedicinesPrompt}</p>
            <Link href="/patient/medicines">
              <Button size="sm" variant="outline">
                {t.health.btnAddMedicine}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {record.medications.map((med) => (
              <div
                key={med.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{med.medicine_name}</h3>
                  <Badge variant={med.status.toLowerCase().includes('taking') ? 'amber' : 'gray'}>
                    {med.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 font-medium">
                  {med.dose} ? {med.frequency}
                </p>
                {med.purpose && (
                  <p className="text-xs text-slate-500">For: {med.purpose}</p>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="text-right">
          <Link href="/patient/medicines" className="text-sm font-bold text-teal-700 hover:underline">
            Manage all medicines →
          </Link>
        </div>
      </Card>

      {/* 2.5. Lab & Diagnostic Test Results Section (Phase 3) */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <FlaskConical className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.reports.labResultsTitle || 'Lab & Blood Test Results'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {t.reports.labResultsSub || 'Track your lab test values, reference ranges, and source reports.'}
              </p>
            </div>
          </div>
          <Link href="/patient/reports">
            <Button size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Add Report
            </Button>
          </Link>
        </div>

        {labResults.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <p className="text-base font-bold text-slate-700">{t.reports.noLabResults || 'No lab test results recorded yet.'}</p>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Upload a blood test report or lab report to extract and track test values over time.</p>
            <Link href="/patient/reports">
              <Button size="sm" variant="outline">
                Upload Test Report
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {labResults.map((lab) => (
              <div
                key={lab.id}
                className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 flex flex-col justify-between space-y-2 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 line-clamp-1">{lab.test_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lab.status === 'WITHIN_RANGE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {lab.status === 'WITHIN_RANGE' ? 'Within range' : 'Outside range'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {lab.value} <span className="text-xs font-normal text-slate-600">{lab.unit}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-100/80 text-[11px] text-slate-500 flex items-center justify-between">
                  {lab.reference_range && <span>Ref: {lab.reference_range}</span>}
                  {lab.test_date && <span>Date: {lab.test_date}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. Allergies Section */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.health.secAllergies}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">{t.health.secAllergiesDesc}</p>
            </div>
          </div>
          <Link href="/patient/allergies">
            <Button size="md" leftIcon={<Plus className="w-4 h-4" />}>
              {t.health.btnAddAllergy}
            </Button>
          </Link>
        </div>

        {(!record?.allergies || record.allergies.length === 0) ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <p className="text-base font-bold text-slate-700">{t.health.emptyAllergies}</p>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{t.health.emptyAllergiesPrompt}</p>
            <Link href="/patient/allergies">
              <Button size="sm" variant="outline">
                {t.health.btnAddAllergy}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {record.allergies.map((alg) => (
              <div
                key={alg.id}
                className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      {alg.allergen}
                    </span>
                    <Badge variant={alg.severity.toLowerCase() === 'severe' ? 'rose' : 'amber'}>
                      {alg.severity} Severity
                    </Badge>
                  </div>
                  {alg.reaction && (
                    <p className="text-xs text-rose-900">Reaction: {alg.reaction}</p>
                  )}
                  {alg.notes && (
                    <p className="text-xs text-slate-600">{alg.notes}</p>
                  )}
                </div>
                <Link href="/patient/allergies" className="text-xs font-bold text-rose-800 hover:underline">
                  Edit in Allergies
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. Family & Past Surgeries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Family Health */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t.health.secFamily}</h3>
            </div>
            <Link href="/patient/family">
              <Button size="sm" variant="outline">
                {t.health.btnAddFamily}
              </Button>
            </Link>
          </div>
          {(!record?.family_history || record.family_history.length === 0) ? (
            <p className="text-xs text-slate-500 py-4 text-center">{t.health.emptyFamilyPrompt}</p>
          ) : (
            <div className="space-y-2.5">
              {record.family_history.map((fam) => (
                <div key={fam.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                  <div className="font-bold text-slate-900">{fam.relation}</div>
                  <div className="text-xs text-slate-600">{fam.condition} {fam.age_at_diagnosis ? `(${fam.age_at_diagnosis})` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Past Surgeries */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Scissors className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t.health.secSurgeries}</h3>
            </div>
            <Link href="/patient/surgeries">
              <Button size="sm" variant="outline">
                {t.health.btnAddSurgery}
              </Button>
            </Link>
          </div>
          {(!record?.surgeries || record.surgeries.length === 0) ? (
            <p className="text-xs text-slate-500 py-4 text-center">{t.health.emptySurgeriesPrompt}</p>
          ) : (
            <div className="space-y-2.5">
              {record.surgeries.map((surg) => (
                <div key={surg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                  <div className="font-bold text-slate-900">{surg.procedure_name}</div>
                  <div className="text-xs text-slate-600">{surg.hospital || 'Hospital'} {surg.surgery_date ? `· ${surg.surgery_date}` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 5. Ayurveda Profile Placeholder Card (Section 31) */}
      <Card className="p-6 sm:p-8 border border-emerald-200 bg-emerald-50/50">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-emerald-950">
                {t.health.secAyurveda}
              </h3>
              <Badge variant="teal">{t.health.ayurvedaComingSoon}</Badge>
            </div>
            <p className="text-sm text-emerald-900 leading-relaxed max-w-2xl">
              {t.health.ayurvedaPlaceholder}
            </p>
          </div>
        </div>
      </Card>

      {/* Condition Modal */}
      {showCondModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">
                {editingCond ? t.conditions.editTitle : t.conditions.addTitle}
              </h3>
              <button
                onClick={() => setShowCondModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCondition} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    {t.conditions.nameLabel} *
                  </label>
                  <VoiceButton
                    onTranscript={(txt) => setCondForm({ ...condForm, condition_name: txt })}
                  />
                </div>
                <input
                  required
                  placeholder={t.conditions.namePlaceholder}
                  value={condForm.condition_name}
                  onChange={(e) => setCondForm({ ...condForm, condition_name: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.conditions.dateLabel}
                </label>
                <input
                  placeholder="e.g. 2021 or 10 Jun 2021"
                  value={condForm.diagnosis_date}
                  onChange={(e) => setCondForm({ ...condForm, diagnosis_date: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.conditions.statusLabel}
                </label>
                <select
                  value={condForm.status}
                  onChange={(e) => setCondForm({ ...condForm, status: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="Active">{t.conditions.statusActive}</option>
                  <option value="Under treatment">{t.conditions.statusUnderTreatment}</option>
                  <option value="Resolved">{t.conditions.statusResolved}</option>
                  <option value="Unknown">{t.conditions.statusUnknown}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.conditions.doctorLabel}
                </label>
                <input
                  placeholder={t.conditions.doctorPlaceholder}
                  value={condForm.doctor_hospital}
                  onChange={(e) => setCondForm({ ...condForm, doctor_hospital: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    {t.conditions.notesLabel}
                  </label>
                  <VoiceButton
                    onTranscript={(txt) => setCondForm({ ...condForm, notes: txt })}
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder={t.conditions.notesPlaceholder}
                  value={condForm.notes}
                  onChange={(e) => setCondForm({ ...condForm, notes: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="md" onClick={() => setShowCondModal(false)} className="w-1/3">
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
