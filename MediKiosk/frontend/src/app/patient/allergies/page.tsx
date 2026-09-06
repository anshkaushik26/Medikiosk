'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import { Allergy } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VoiceButton } from '@/components/ui/VoiceButton';
import { AudioHelper } from '@/components/common/AudioHelper';
import {
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';

export default function PatientAllergiesPage() {
  const { t } = useTranslation();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingAlg, setEditingAlg] = useState<Allergy | null>(null);
  const [form, setForm] = useState({
    allergen: '',
    reaction: '',
    severity: 'Moderate',
    notes: '',
  });

  const loadAllergies = async () => {
    try {
      setLoading(true);
      const data = await api.listAllergies();
      setAllergies(data);
    } catch (err) {
      console.error('Failed to load allergies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllergies();
  }, []);

  const handleOpenAdd = () => {
    setEditingAlg(null);
    setForm({
      allergen: '',
      reaction: '',
      severity: 'Moderate',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (a: Allergy) => {
    setEditingAlg(a);
    setForm({
      allergen: a.allergen,
      reaction: a.reaction || '',
      severity: a.severity,
      notes: a.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAlg) {
        await api.updateAllergy(editingAlg.id, form);
      } else {
        await api.createAllergy(form);
      }
      setShowModal(false);
      await loadAllergies();
    } catch (err) {
      console.error('Save allergy error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this allergy?')) {
      try {
        await api.deleteAllergy(id);
        await loadAllergies();
      } catch (err) {
        console.error('Delete allergy error:', err);
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
              {t.allergies.title}
            </h1>
            <AudioHelper text={`${t.allergies.title}. ${t.allergies.subtitle}`} />
          </div>
          <p className="text-base text-slate-600">
            {t.allergies.subtitle}
          </p>
        </div>

        <Button size="lg" onClick={handleOpenAdd} leftIcon={<Plus className="w-5 h-5" />}>
          {t.allergies.addTitle}
        </Button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong>Doctor Alert System:</strong> The allergies you record here will be highlighted prominently to visiting doctors before prescriptions are issued to prevent adverse drug reactions.
        </p>
      </div>

      {loading && allergies.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-medium">{t.common.loading}</div>
      ) : allergies.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-2 border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-800 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{t.health.emptyAllergies}</h2>
          <p className="text-slate-600 max-w-md mx-auto">{t.health.emptyAllergiesPrompt}</p>
          <Button size="xl" onClick={handleOpenAdd} leftIcon={<Plus className="w-5 h-5" />}>
            {t.allergies.addTitle}
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {allergies.map((alg) => {
            const isSevere = alg.severity.toLowerCase() === 'severe';

            return (
              <Card
                key={alg.id}
                className={`p-6 border-2 transition-all ${
                  isSevere
                    ? 'border-rose-300 bg-gradient-to-r from-rose-50/80 to-white shadow-md'
                    : 'border-amber-200 bg-gradient-to-r from-amber-50/50 to-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSevere ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">
                        {alg.allergen}
                      </h3>
                      <Badge variant={isSevere ? 'rose' : 'amber'}>
                        {alg.severity} Severity
                      </Badge>
                    </div>

                    {alg.reaction && (
                      <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-sm">
                        <strong className="text-slate-800">Reaction: </strong>
                        <span className="text-slate-700">{alg.reaction}</span>
                      </div>
                    )}

                    {alg.notes && (
                      <p className="text-xs text-slate-500 italic">
                        Notes: {alg.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenEdit(alg)}
                      className="p-2.5 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      title={t.common.edit}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(alg.id)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* Add / Edit Allergy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">
                {editingAlg ? t.allergies.editTitle : t.allergies.addTitle}
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
                    {t.allergies.allergenLabel} *
                  </label>
                  <VoiceButton
                    onTranscript={(txt) => setForm({ ...form, allergen: txt })}
                  />
                </div>
                <input
                  required
                  placeholder={t.allergies.allergenPlaceholder}
                  value={form.allergen}
                  onChange={(e) => setForm({ ...form, allergen: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    {t.allergies.reactionLabel}
                  </label>
                  <VoiceButton
                    onTranscript={(txt) => setForm({ ...form, reaction: txt })}
                  />
                </div>
                <input
                  placeholder={t.allergies.reactionPlaceholder}
                  value={form.reaction}
                  onChange={(e) => setForm({ ...form, reaction: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.allergies.severityLabel}
                </label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="Mild">{t.allergies.severityMild}</option>
                  <option value="Moderate">{t.allergies.severityModerate}</option>
                  <option value="Severe">{t.allergies.severitySevere}</option>
                  <option value="Unknown">{t.allergies.severityUnknown}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.allergies.notesLabel}
                </label>
                <textarea
                  rows={2}
                  placeholder={t.allergies.notesPlaceholder}
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
