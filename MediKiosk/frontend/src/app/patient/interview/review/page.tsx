'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import { InterviewState, ClinicalInterview } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle2,
  Edit2,
  Check,
  X,
  FileText,
  HeartPulse,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function InterviewReviewPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadInterview();
  }, []);

  const loadInterview = async () => {
    try {
      setLoading(true);
      const state = await api.startOrResumeInterview();
      setInterviewState(state);
    } catch (err) {
      console.error('Failed to load interview for review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (answerId: string) => {
    if (!interviewState || !editText.trim()) return;
    try {
      setSavingEdit(true);
      await api.editInterviewAnswer(interviewState.interview_id, answerId, editText.trim());
      setEditingAnswerId(null);
      setEditText('');
      await loadInterview();
    } catch (err: any) {
      alert(err.message || 'Failed to update answer');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmInterview = async () => {
    if (!interviewState) return;
    try {
      setConfirming(true);
      await api.confirmInterview(interviewState.interview_id, true);
      // Navigate to patient health page with confirmation
      router.push('/patient/health');
    } catch (err: any) {
      alert(err.message || 'Failed to confirm interview.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-600 font-medium">Preparing your clinical review...</p>
      </div>
    );
  }

  const summary = interviewState?.summary;
  const hpiItems: any[] = summary?.history_of_present_illness || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fadeIn pb-24">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t.interview?.reviewTitle || "Here's what we understood"}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
          {t.interview?.reviewSubtitle ||
            'Please check this information before saving. Nothing becomes confirmed until you confirm.'}
        </p>
      </div>

      {/* Structured Clinical Review Card */}
      <Card className="p-6 sm:p-8 border-2 border-teal-200 space-y-6 shadow-md">
        {/* Section 1: Why you came today */}
        <div className="border-b border-slate-200 pb-5">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            {t.interview?.whyYouCame || 'WHY YOU CAME TODAY'}
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-rose-600" />
            {summary?.chief_complaint || interviewState?.chief_complaint || 'Health Concern'}
          </h2>
        </div>

        {/* Section 2: What you told us */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            {t.interview?.whatYouToldUs || 'WHAT YOU TOLD US'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hpiItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {item.field}
                  </span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Existing health context banner */}
        {summary?.existing_conditions && summary.existing_conditions.length > 0 && (
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 flex-shrink-0" />
            <span>
              Connected with your confirmed health profile: {summary.existing_conditions.join(', ')}
            </span>
          </div>
        )}
      </Card>

      {/* Confirmation & Sticky Action Footer */}
      <div className="space-y-3">
        <Button
          onClick={handleConfirmInterview}
          disabled={confirming}
          className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-teal-600/30 flex items-center justify-center gap-2"
        >
          <Check className="w-6 h-6" />
          {confirming ? 'Saving information...' : t.interview?.btnConfirm || 'Yes, save my information'}
        </Button>

        <Link href="/patient/interview" className="block text-center">
          <button className="py-2.5 px-4 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            {t.interview?.btnGoBackEdit || 'Go back and edit'}
          </button>
        </Link>
      </div>
    </div>
  );
}
