'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { HealthSummary, TimelineEvent } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AudioHelper } from '@/components/common/AudioHelper';
import {
  Mic,
  FileText,
  Pill,
  HeartPulse,
  AlertCircle,
  PhoneCall,
  ChevronRight,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export default function PatientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [recentEvents, setRecentEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const patientName = user?.patient_profile?.full_name || 'Ramesh Kumar';
  const bloodGroup = user?.patient_profile?.blood_group || 'B+';
  const emergencyPhone = user?.patient_profile?.emergency_contact || '+91 98765 43211';

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [sum, timeline] = await Promise.all([
          api.getHealthSummary(),
          api.getTimeline(),
        ]);
        setSummary(sum);
        setRecentEvents(timeline.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard clinical summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const completeness = summary?.completeness_percent || 70;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn pb-24 md:pb-12">
      {/* 1. TOP HEADER: Personal Health Home */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              {greeting}
            </span>
            <AudioHelper text={`${greeting}, ${patientName}. Here's your health at a glance.`} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {patientName}
          </h1>
          <p className="text-sm text-slate-600">
            Here's your health at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800 border border-slate-200">
            Blood: <span className="font-bold text-teal-800">{bloodGroup}</span>
          </div>
          <div className="px-3.5 py-1.5 bg-teal-50 rounded-lg text-xs font-semibold text-teal-800 border border-teal-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>ABHA Verified</span>
          </div>
        </div>
      </div>

      {/* 2. PROFILE COMPLETION BAR */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Your health profile is {completeness}% complete.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Conditions: <span className="font-semibold text-slate-900">{summary?.conditions_count || 2}</span> · 
              Medicines: <span className="font-semibold text-slate-900">{summary?.medications_count || 3}</span> · 
              Allergies: <span className="font-semibold text-slate-900">{summary?.allergies_count || 2}</span> · 
              Reports: <span className="font-semibold text-slate-900">{summary?.reports_count || 3}</span>
            </p>
          </div>

          <Link href="/patient/health">
            <Button size="md" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue setup
            </Button>
          </Link>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* 3. PRIMARY FEATURE: TALK TO MEDIKIOSK */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600 text-teal-200 text-xs font-semibold">
            <Mic className="w-3.5 h-3.5 text-teal-300" />
            <span>Voice, Touch or Type</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Talk to MediKiosk
          </h2>
          <p className="text-sm sm:text-base text-teal-100 leading-relaxed">
            Tell us how you're feeling today. MediKiosk guides you through simple questions and organizes your symptoms for your doctor.
          </p>
        </div>

        <Link href="/patient/interview" className="flex-shrink-0 w-full sm:w-auto">
          <button
            type="button"
            className="w-full sm:w-auto bg-white text-slate-950 hover:bg-teal-50 font-extrabold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-md flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] border border-slate-200"
          >
            <span className="text-slate-950 font-black tracking-tight">Start talking</span>
            <ArrowRight className="w-5 h-5 text-teal-700" />
          </button>
        </Link>
      </div>

      {/* 4. FOUR CORE SERVICES (2x2 Grid) */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Core Health Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: My Health */}
          <Link href="/patient/health" className="block group">
            <Card hoverable className="p-6 h-full flex flex-col justify-between border border-slate-200 group-hover:border-teal-400">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                    Overview
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  My Health
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your conditions, allergies, surgical history, family health, and Ayurvedic profile in one place.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center text-teal-700 text-sm font-semibold gap-1.5">
                <span>View health records</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* Card 2: My Reports */}
          <Link href="/patient/reports" className="block group">
            <Card hoverable className="p-6 h-full flex flex-col justify-between border border-slate-200 group-hover:border-teal-400">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md">
                    {summary?.reports_count || 3} Files
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  My Reports
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Store and organize doctor prescriptions, lab test reports, and hospital discharge summaries.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center text-sky-700 text-sm font-semibold gap-1.5">
                <span>Browse & upload reports</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* Card 3: My Medicines */}
          <Link href="/patient/medicines" className="block group">
            <Card hoverable className="p-6 h-full flex flex-col justify-between border border-slate-200 group-hover:border-teal-400">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Pill className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
                    {summary?.current_medications_count || 3} Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  My Medicines
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Keep track of your active daily prescriptions, dosages, timing, and purposes.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center text-amber-700 text-sm font-semibold gap-1.5">
                <span>View medication list</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* Card 4: My Timeline */}
          <Link href="/patient/timeline" className="block group">
            <Card hoverable className="p-6 h-full flex flex-col justify-between border border-slate-200 group-hover:border-teal-400">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md">
                    History
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  My Timeline
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A chronological view of your tests, health interviews, doctor visits, and prescription updates.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center text-indigo-700 text-sm font-semibold gap-1.5">
                <span>Explore timeline</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Recent Activity
          </h2>
          <Link href="/patient/timeline" className="text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1">
            <span>View all timeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <Card className="p-6 text-center text-slate-500 text-sm">
            No recent activity recorded yet.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentEvents.map((evt) => (
              <div key={evt.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{evt.title}</h4>
                    <span className="text-[11px] text-slate-400 shrink-0">{evt.event_date}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. NEED URGENT HELP / EMERGENCY ASSISTANCE */}
      <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-base font-bold text-rose-950">Need urgent medical help?</h4>
            <p className="text-xs sm:text-sm text-rose-800">
              For sudden chest pain, breathing difficulty, or severe injuries, call emergency services immediately.
            </p>
            <p className="text-xs font-semibold text-rose-900 pt-1">
              Emergency Contact: <span className="font-mono">{emergencyPhone}</span>
            </p>
          </div>
        </div>

        <a href="tel:112" className="flex-shrink-0 w-full sm:w-auto">
          <Button size="md" variant="danger" className="w-full sm:w-auto whitespace-nowrap">
            Call Emergency (112)
          </Button>
        </a>
      </div>
    </div>
  );
}
