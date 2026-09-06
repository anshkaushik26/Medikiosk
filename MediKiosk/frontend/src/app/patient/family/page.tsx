'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import { FamilyHistory } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VoiceButton } from '@/components/ui/VoiceButton';
import { AudioHelper } from '@/components/common/AudioHelper';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowLeft,
} from 'lucide-react';

export default function PatientFamilyPage() {
  const { t } = useTranslation();
  const [family, setFamily] = useState<FamilyHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FamilyHistory | null>(null);
  const [form, setForm] = useState({
    relation: 'Mother',
    condition: '',
    age_at_diagnosis: '',
    status: '',
    notes: '',
  });

  const loadFamily = async () => {
    try {
      setLoading(true);
      const data = await api.listFamily();
      setFamily(data);
    } catch (err) {
      console.error('Failed to load family history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamily();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      relation: 'Mother',
      condition: '',
      age_at_diagnosis: '',
      status: 'Living',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: FamilyHistory) => {
    setEditingItem(item);
    setForm({
      relation: item.relation,
      condition: item.condition,
      age_at_diagnosis: item.age_at_diagnosis || '',
      status: item.status || '',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateFamily(editingItem.id, form);
      } else {
        await api.createFamily(form);
      }
      setShowModal(false);
      await loadFamily();
    } catch (err) {
      console.error('Save family error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this family history record?')) {
      try {
        await api.deleteFamily(id);
        await loadFamily();
      } catch (err) {
        console.error('Delete family error:', err);
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
              {t.family.title}
            </h1>
            <AudioHelper text={`${t.family.title}. ${t.family.subtitle}`} />
          </div>
          <p className="text-base text-slate-600">
            {t.family.subtitle}
          </p>
        </div>

        <Button size="lg" onClick={handleOpenAdd} leftIcon={<Plus className="w-5 h-5" />}>
          {t.family.addTitle}
        </Button>
      </div>

      {loading && family.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-medium">{t.common.loading}</div>
      ) : family.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-2 border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-800 mx-auto flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{t.health.emptyFamily}</h2>
          <p className="text-slate-600 max-w-md mx-auto">{t.health.emptyFamilyPrompt}</p>
          <Button size="xl" onClick={handleOpenAdd} leftIcon={<Plus className="w-5 h-5" />}>
            {t.family.addTitle}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {family.map((item) => (
            <Card
              key={item.id}
              className="p-6 border border-slate-200 hover:border-purple-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-base">
                    {item.relation.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{item.relation}</h3>
                    <p className="text-sm font-semibold text-purple-900">{item.condition}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    title={t.common.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {(item.age_at_diagnosis || item.status) && (
                <div className="text-xs text-slate-500 flex items-center gap-3 pt-1">
                  {item.age_at_diagnosis && (
                    <span>Diagnosed: <strong className="text-slate-700">{item.age_at_diagnosis}</strong></span>
                  )}
                  {item.status && (
                    <span>Status: <strong className="text-slate-700">{item.status}</strong></span>
                  )}
                </div>
              )}

              {item.notes && (
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {item.notes}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Family Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">
                {editingItem ? t.family.editTitle : t.family.addTitle}
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
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.family.relationLabel} *
                </label>
                <select
                  value={form.relation}
                  onChange={(e) => setForm({ ...form, relation: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="Father">{t.family.relationFather}</option>
                  <option value="Mother">{t.family.relationMother}</option>
                  <option value="Brother">{t.family.relationBrother}</option>
                  <option value="Sister">{t.family.relationSister}</option>
                  <option value="Grandparent">{t.family.relationGrandparent}</option>
                  <option value="Child">{t.family.relationChild}</option>
                  <option value="Other">{t.family.relationOther}</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    {t.family.conditionLabel} *
                  </label>
                  <VoiceButton
                    onTranscript={(txt) => setForm({ ...form, condition: txt })}
                  />
                </div>
                <input
                  required
                  placeholder={t.family.conditionPlaceholder}
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {t.family.ageLabel}
                  </label>
                  <input
                    placeholder={t.family.agePlaceholder}
                    value={form.age_at_diagnosis}
                    onChange={(e) => setForm({ ...form, age_at_diagnosis: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    {t.family.statusLabel}
                  </label>
                  <input
                    placeholder="e.g. Living or Deceased"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 text-base text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {t.family.notesLabel}
                </label>
                <textarea
                  rows={2}
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
