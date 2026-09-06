'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  AlertTriangle,
  PhoneCall,
  UserCheck,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function InterviewUrgentPage() {
  const { t } = useTranslation();
  const [staffNotified, setStaffNotified] = useState(false);

  const handleContactStaff = () => {
    setStaffNotified(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fadeIn">
      {/* Red Flag Alert Hero */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-lg shadow-rose-600/20">
          <AlertTriangle className="w-10 h-10 text-rose-600 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t.interview?.urgentTitle || 'Please get medical help now.'}
        </h1>

        <p className="text-base sm:text-lg text-slate-700 max-w-md mx-auto leading-relaxed">
          {t.interview?.urgentSubtitle ||
            'Some of your answers may indicate symptoms that need urgent medical attention.'}
        </p>

        <p className="text-sm font-semibold text-rose-800 bg-rose-50 border border-rose-200 p-4 rounded-2xl max-w-lg mx-auto">
          {t.interview?.urgentHospitalNotice ||
            'Please contact hospital staff or your local emergency medical service immediately.'}
        </p>
      </div>

      {/* Staff Alert Banner */}
      {staffNotified && (
        <Card className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 animate-fadeIn">
          <UserCheck className="w-6 h-6 text-emerald-700 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Hospital Staff Alerted</h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              {t.interview?.staffNotifiedAlert ||
                'Hospital staff notification simulated. Please seek immediate medical help.'}
            </p>
          </div>
        </Card>
      )}

      {/* Action Buttons (56px touch target) */}
      <div className="space-y-4">
        <Button
          onClick={handleContactStaff}
          className="w-full min-h-[56px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
        >
          <UserCheck className="w-5 h-5" />
          {t.interview?.btnContactStaff || 'Contact Hospital Staff'}
        </Button>

        <a href="tel:112" className="block">
          <Button
            variant="outline"
            className="w-full min-h-[56px] border-2 border-rose-300 hover:bg-rose-50 text-rose-800 font-bold text-base rounded-2xl flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-5 h-5" />
            {t.interview?.btnEmergencyCall || 'Emergency Help (Call 112)'}
          </Button>
        </a>

        <Link href="/patient/dashboard" className="block text-center pt-2">
          <button className="text-sm font-bold text-slate-500 hover:text-slate-800">
            {t.interview?.btnContinueLater || 'Continue Later'}
          </button>
        </Link>
      </div>
    </div>
  );
}
