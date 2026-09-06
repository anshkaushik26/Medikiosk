'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import { Medication } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VoiceButton } from '@/components/ui/VoiceButton';
import { AudioHelper } from '@/components/common/AudioHelper';
import {
  Pill,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Clock,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

export default function PatientMedicinesPage() {
  const { t } = useTranslation();
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [form, setForm] = useState({
    medicine_name: '',
    dose: '',
    frequency: '',
    route: '',
    start_date: '',
    end_date: '',
    prescribed_by: '',
    purpose: '',
    status: 'Currently taking',
    notes: '',
  });

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await api.listMedications();
      setMeds(data);
    } catch (err) {
      console.error('Failed to load medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleOpenAdd = () => {
    setEditingMed(null);
    setForm({
      medicine_name: '',
      dose: '',
      frequency: '',
      route: 'Oral tablet',
      start_date: '',
      end_date: '',
      prescribed_by: '',
      purpose: '',
      status: 'Currently taking',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m: Medication) => {
    setEditingMed(m);
    setForm({
      medicine_name: m.medicine_name,
      dose: m.dose || '',
      frequency: m.frequency || '',
      route: m.route || '',
      start_date: m.start_date || '',
      end_date: m.end_date || '',
      prescribed_by: m.prescribed_by || '',
      purpose: m.purpose || '',
      status: m.status,
      notes: m.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMed) {
        await api.updateMedication(editingMed.id, form);
      } else {
        await api.createMedication(form);
      }
      setShowModal(false);
      await loadMedicines();
    } catch (err) {
      console.error('Save medicine error:', err);
    }
  };

  const handleStopMed = async (m: Medication) => {
    const newStatus = m.status === 'Stopped' ? 'Currently taking' : 'Stopped';
    try {
      await api.updateMedication(m.id, { status: newStatus });
      await loadMedicines();
    } catch (err) {
      console.error('Stop medicine error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this medicine?')) {
      try {
        await api.deleteMedication(id);
        await loadMedicines();
      } catch (err) {
        console.error('Delete medicine error:', err);
      }
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/patient/health" className="text-teal-700 hover:text-teal-900 p-1 -ml-1">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              {t.medicines.title}
            </h1>
            <AudioHelper text={`${t.medicines.title}. ${t.medicines.subtitle}`} />
          </div>
          <p className="text-base text-slate-600">
            {t.medicines.subtitle}
          </p>
        </div>

        <Button size="lg" onClick={handleOpenAdd} leftIcon={<Plus className="w-5 h-5" />}>
          {t.medicines.addTitle}
        </Button>
      </div>

      {loading && meds.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-medium">{t.common.loading}</div>
      ) : meds.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-2 border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
            <Pill className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{t.health.emptyMedicines}</h2>
          <p className="text-slate-600 max-w-md mx-auto">{t.health.emptyMedicinesPrompt}</p>
          <Button size="xl" onClick={handleOpenAdd} leftIcon={<Plus className="w-5 h-5" />}>
            {t.medicines.addTitle}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meds.map((med) => {
            const isTaking = med.status.toLowerCase().includes('taking');
            const isStopped = med.status.toLowerCase().includes('stop');

            return (
              <Card
                key={med.id}
                className={`p-6 space-y-4 border-2 transition-all ${
                  isTaking
                    ? 'border-amber-200 bg-white shadow-sm'
                    : isStopped
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900">{med.medicine_name}</h3>
                    <div className="flex items-center gap-2 text-base font-bold text-slate-700">
                      {med.dose && <span>{med.dose}</span>}
                      {med.dose && med.frequency && <span>·</span>}
                      {med.frequency && <span>{med.frequency}</span>}
                    </div>
                  </div>
                  <Badge variant={isTaking ? 'amber' : isStopped ? 'rose' : 'gray'}>
                    {med.status}
                  </Badge>
                </div>

                {med.purpose && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/50 text-sm">
                    <span className="font-bold text-amber-900">For: </span>
                    <span className="text-amber-950">{med.purpose}</span>
                  </div>
                )}

                <div className="space-y-1 text-xs text-slate-500">
                  {med.prescribed_by && (
                    <p>Prescribed by: <strong className="text-slate-700">{med.prescribed_by}</strong></p>
                  )}
                  {med.start_date && (
                    <p>Started: <strong className="text-slate-700">{med.start_date}</strong></p>
                  )}
                  {med.notes && (
                    <p className="text-slate-600 pt-1 italic">"{med.notes}"</p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleStopMed(med)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                      isStopped
                        ? 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                        : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    {isStopped ? 'Resume Taking' : t.medicines.btnStop}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(med)}
                      className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      title={t.common.edit}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title={t.common.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">
                {editingMed ? t.medicines.editTitle : t.medicines.addTitle}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    {t.medicines.nameLabel} *
                  </label>
                  <VoiceButton
                    onTranscript={(txt) => setForm({ ...form, medicine_name: txt })}
                  />
                </div>
                <input
                  required
                  placeholder={t.medicines.namePlaceholder}
                  value={form.medicine_name}
                  onChange={(e) => setForm({ ...form, medicine_name: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {t.medicines.doseLabel}
                  </label>
                  <input
                    placeholder={t.medicines.dosePlaceholder}
                    value={form.dose}
                    onChange={(e) => setForm({ ...form, dose: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {t.medicines.freqLabel}
                  </label>
                  <input
                    placeholder={t.medicines.freqPlaceholder}
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    {t.medicines.purposeLabel}
                  </label>
                  <VoiceButton
                    onTranscript={(txt) => setForm({ ...form, purpose: txt })}
                  />
                </div>
                <input
                  placeholder={t.medicines.purposePlaceholder}
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.medicines.statusLabel}
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="Currently taking">{t.medicines.statusCurrentlyTaking}</option>
                  <option value="Finished">{t.medicines.statusFinished}</option>
                  <option value="Stopped">{t.medicines.statusStopped}</option>
                  <option value="Unknown">{t.medicines.statusUnknown}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.medicines.prescribedByLabel}
                </label>
                <input
                  placeholder={t.medicines.prescribedByPlaceholder}
                  value={form.prescribed_by}
                  onChange={(e) => setForm({ ...form, prescribed_by: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.medicines.notesLabel}
                </label>
                <textarea
                  rows={2}
                  placeholder={t.medicines.notesPlaceholder}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="md" onClick={() => setShowModal(false)} className="w-1/3">
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
