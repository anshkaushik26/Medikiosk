'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import { ClinicalInterview } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Mic,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  FileText,
} from 'lucide-react';

export default function PatientInterviewsHistoryPage() {
  const { t } = useTranslation();
  const [interviews, setInterviews] = useState<ClinicalInterview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const data = await api.listInterviews();
      setInterviews(data);
    } catch (err) {
      console.error('Failed to load interview history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Mic className="w-8 h-8 text-teal-600" />
            {t.interview?.historyTitle || 'Health Interviews'}
          </h1>
          <p className="text-slate-600 mt-1 text-sm">
            {t.interview?.historySubtitle ||
              'Review your clinical conversations and structured health summaries.'}
          </p>
        </div>

        <Link href="/patient/interview">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 px-5">
            <Plus className="w-5 h-5 mr-1.5" />
            {t.interview?.btnStart || 'New Interview'}
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading interview history...</p>
        </div>
      ) : interviews.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
            <Mic className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No health interviews recorded yet</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Start a guided conversation to explain your symptoms before seeing a doctor.
          </p>
          <Link href="/patient/interview">
            <Button className="bg-teal-600 text-white font-bold">
              {t.interview?.btnStart || 'Start Interview'}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <Card key={item.id} className="p-6 border border-slate-200 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {item.chief_complaint || 'Health Conversation'}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    item.status === 'CONFIRMED'
                      ? 'green'
                      : item.status === 'URGENT'
                      ? 'rose'
                      : 'blue'
                  }
                >
                  {item.status}
                </Badge>
              </div>

              {item.summary?.history_of_present_illness && (
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  {item.summary.history_of_present_illness.slice(0, 3).map((h: any, idx: number) => (
                    <div key={idx} className="flex gap-2">
                      <span className="font-bold text-slate-700">{h.field}:</span>
                      <span>{h.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
