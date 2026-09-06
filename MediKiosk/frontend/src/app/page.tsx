'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../lib/i18n-context';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AudioHelper } from '../components/common/AudioHelper';
import {
  HeartPulse,
  Mic,
  FileText,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Sparkles,
  UserCheck,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const [step, setStep] = useState<1 | 2>(1);
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  const dashboardLink =
    user?.role === 'PATIENT'
      ? '/patient/dashboard'
      : user?.role === 'DOCTOR'
      ? '/doctor/dashboard'
      : null;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center animate-fadeIn">
      {/* Subtle Step Indicator */}
      <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wider uppercase">
        <span className="px-2.5 py-1 rounded bg-teal-100 text-teal-900">
          {step === 1 ? 'Step 01' : 'Step 02'}
        </span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-600">
          {step === 1 ? '01 — Welcome' : '02 — How it helps'}
        </span>
      </div>

      {step === 1 ? (
        /* ============================================================
           STEP 1: BALANCED TWO-COLUMN LANDING EXPERIENCE
           ============================================================ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs sm:text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Digital Healthcare for India</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                  {t.welcome.title}
                </h1>
                <AudioHelper text={`${t.welcome.title}. ${t.welcome.subtitle}. ${t.welcome.description}`} />
              </div>
              <p className="text-lg sm:text-xl font-medium text-teal-800 leading-relaxed">
                {t.welcome.subtitle}
              </p>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                {t.welcome.description}
              </p>
            </div>

            {/* If user is already logged in */}
            {dashboardLink && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl max-w-md">
                <p className="text-sm font-medium text-teal-900 mb-2">
                  You are signed in as {user?.role === 'PATIENT' ? 'Patient' : 'Doctor'}.
                </p>
                <Button
                  size="md"
                  onClick={() => router.push(dashboardLink)}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {/* Primary & Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-xl flex-wrap items-center">
              <Button
                size="lg"
                onClick={() => router.push('/auth?mode=signup')}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto px-8 bg-teal-600 hover:bg-teal-700 font-bold"
              >
                Sign Up & Health Interview
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/auth?mode=signin')}
                className="w-full sm:w-auto font-semibold"
              >
                {t.welcome.alreadyHaveAccount}
              </Button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 underline underline-offset-4 py-2"
              >
                How it works (3 steps) →
              </button>
            </div>

            {/* Trust & Accessibility Points */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-700 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="font-medium">Simple to use</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="font-medium">English + हिन्दी</span>
              </div>
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="font-medium">Built for everyone</span>
              </div>
            </div>
          </div>

          {/* Right Column: Tasteful Healthcare UI Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-100/90 to-white border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">MediKiosk Preview</span>
                    <span className="text-xs text-slate-500">Patient Health Organizer</span>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Active
                </span>
              </div>

              {/* Mini Feature Card 1: Voice Consultation Prep */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-slate-900 block truncate">Talk to MediKiosk</span>
                  <span className="text-[11px] text-slate-500 block">Voice, touch, or type intake</span>
                </div>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  Voice Ready
                </span>
              </div>

              {/* Mini Feature Card 2: Document Vault */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-slate-900 block truncate">Document Vault</span>
                  <span className="text-[11px] text-slate-500 block">Prescriptions, labs & reports</span>
                </div>
                <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  Verified
                </span>
              </div>

              {/* Mini Feature Card 3: Doctor Preparation */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-slate-900 block truncate">Doctor-Ready Timeline</span>
                  <span className="text-[11px] text-slate-500 block">Organized summary for consultation</span>
                </div>
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  360° View
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================
           STEP 2: 3-BENEFIT PROGRESSION (HOW MEDIKIOSK HELPS)
           3 horizontally arranged cards on desktop, stacked on mobile
           ============================================================ */
        <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto w-full">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {t.benefits.title}
              </h2>
              <AudioHelper
                text={`${t.benefits.title}. 1. ${t.benefits.benefit1_title}. ${t.benefits.benefit1_desc}. 2. ${t.benefits.benefit2_title}. ${t.benefits.benefit2_desc}. 3. ${t.benefits.benefit3_title}. ${t.benefits.benefit3_desc}`}
              />
            </div>
            <p className="text-sm sm:text-base text-slate-600">
              {t.benefits.subtitle}
            </p>
          </div>

          {/* 3 Horizontal Benefit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Benefit 01 */}
            <Card className="p-6 space-y-4 hover:border-teal-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-teal-800 bg-teal-50 px-2.5 py-1 rounded">
                  01
                </span>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {t.benefits.benefit1_title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.benefits.benefit1_desc}
                </p>
              </div>
            </Card>

            {/* Benefit 02 */}
            <Card className="p-6 space-y-4 hover:border-teal-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-teal-800 bg-teal-50 px-2.5 py-1 rounded">
                  02
                </span>
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {t.benefits.benefit2_title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.benefits.benefit2_desc}
                </p>
              </div>
            </Card>

            {/* Benefit 03 */}
            <Card className="p-6 space-y-4 hover:border-teal-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-teal-800 bg-teal-50 px-2.5 py-1 rounded">
                  03
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {t.benefits.benefit3_title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.benefits.benefit3_desc}
                </p>
              </div>
            </Card>
          </div>

          {/* Progression Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-8"
            >
              {t.common.back}
            </Button>
            <Button
              size="lg"
              onClick={() => router.push('/auth')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto px-8"
            >
              {t.common.continue}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
