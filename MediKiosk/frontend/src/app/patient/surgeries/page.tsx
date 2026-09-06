'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import { Surgery } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VoiceButton } from '@/components/ui/VoiceButton';
import { AudioHelper } from '@/components/common/AudioHelper';
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowLeft,
  Calendar,
  Building2,
  User,
} from 'lucide-react';

export default function PatientSurgeriesPage() {
  const { t } = useTranslation();
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Surgery | null>(null);
  const [form, setForm] = useState({
    procedure_name: '',
    surgery_date: '',
    hospital: '',
    doctor: '',
    reason: '',
    notes: '',
  });

  const loadSurgeries = async () => {
    try {
      setLoading(true);
      const data = await api.listSurgeries();
      setSurgeries(data);
    } catch (err) {
      console.error('Failed to load surgeries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurgeries();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      procedure_name: '',
      surgery_date: '',
      hospital: '',
      doctor: '',
      reason: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: Surgery) => {
    setEditingItem(item);
    setForm({
      procedure_name: item.procedure_name,
      surgery_date: item.surgery_date || '',
      hospital: item.hospital || '',
      doctor: item.doctor || '',
      reason: item.reason || '',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateSurgery(editingItem.id, form);
      } else {
        await api.createSurgery(form);
      }
      setShowModal(false);
      await loadSurgeries();
    } catch (err) {
      console.error('Save surgery error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this surgery record?')) {
      try {
        await api.deleteSurgery(id);
        await loadSurgeries();
      } catch (err) {
        console.error('Delete surgery error:', err);
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
              {t.surgeries.title}
            </h1>
            <AudioHelper text={`${t.surgeries.title}. ${t.surgeries.subtitle}`} />
          </div>
          <p className="text-base text-slate-600">
            {t.surgeries.subtitle}
          </p>
        </div>

        <Button size="lg" onClick={handleOpenAdd} leftIcon={<Plus className="w-5 h-5" />}>
          {t.surgeries.addTitle}
        </Button>
      </div>

      {loading && surgeries.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-medium">{t.common.loading}</div>
      ) : surgeries.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-2 border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
            <Scissors className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{t.health.emptySurgeries}</h2>
          <p className="text-slate-600 max-w-md mx-auto">{t.health.emptySurgeriesPrompt}</p>
          <Button size="xl" onClick={handleOpenAdd} leftIcon={<Plus className="w-5 h-5" />}>
            {t.surgeries.addTitle}
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {surgeries.map((surg) => (
            <Card
              key={surg.id}
              className="p-6 border border-slate-200 hover:border-emerald-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {surg.procedure_name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    {surg.surgery_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{surg.surgery_date}</strong>
                      </span>
                    )}
                    {surg.hospital && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{surg.hospital}</span>
                      </span>
                    )}
                    {surg.doctor && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{surg.doctor}</span>
                      </span>
                    )}
                  </div>

                  {surg.reason && (
                    <p className="text-xs text-slate-700">
                      <strong>Reason: </strong>{surg.reason}
                    </p>
                  )}

                  {surg.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {surg.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEdit(surg)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    title={t.common.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(surg.id)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Surgery Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">
                {editingItem ? t.surgeries.editTitle : t.surgeries.addTitle}
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
                    {t.surgeries.nameLabel} *
                  </label>
                  <VoiceButton
                    onTranscript={(txt) => setForm({ ...form, procedure_name: txt })}
                  />
                </div>
                <input
                  required
                  placeholder={t.surgeries.namePlaceholder}
                  value={form.procedure_name}
                  onChange={(e) => setForm({ ...form, procedure_name: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {t.surgeries.dateLabel}
                  </label>
                  <input
                    placeholder={t.surgeries.datePlaceholder}
                    value={form.surgery_date}
                    onChange={(e) => setForm({ ...form, surgery_date: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {t.surgeries.hospitalLabel}
                  </label>
                  <input
                    placeholder={t.surgeries.hospitalPlaceholder}
                    value={form.hospital}
                    onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {t.surgeries.doctorLabel}
                  </label>
                  <input
                    placeholder={t.surgeries.doctorPlaceholder}
                    value={form.doctor}
                    onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {t.surgeries.reasonLabel}
                  </label>
                  <input
                    placeholder={t.surgeries.reasonPlaceholder}
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.surgeries.notesLabel}
                </label>
                <textarea
                  rows={2}
                  placeholder={t.surgeries.notesPlaceholder}
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
