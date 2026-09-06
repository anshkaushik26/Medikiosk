'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../lib/i18n-context';
import { useAuth } from '../../../lib/auth-context';
import { Card } from '../../../components/ui/Card';
import { AudioHelper } from '../../../components/common/AudioHelper';
import { User, Stethoscope, ArrowRight, Check } from 'lucide-react';

export default function RoleSelectionPage() {
  const { t } = useTranslation();
  const { selectRole } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<'PATIENT' | 'DOCTOR' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (role: 'PATIENT' | 'DOCTOR') => {
    setSelected(role);
    setIsLoading(true);
    try {
      await selectRole(role);
      if (role === 'PATIENT') {
        router.push('/onboarding/patient');
      } else {
        router.push('/onboarding/doctor');
      }
    } catch (err) {
      console.error('Failed to set role:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn">
      <div className="w-full max-w-3xl mx-auto text-center space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {t.role.title}
            </h1>
            <AudioHelper text={`${t.role.title}. ${t.role.subtitle}`} />
          </div>
          <p className="text-lg text-slate-600">
            {t.role.subtitle}
          </p>
        </div>

        {/* Two Big Visually Distinct Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          {/* Patient Choice */}
          <Card
            hoverable
            onClick={() => handleRoleSelect('PATIENT')}
            className={`p-8 border-2 transition-all relative ${
              selected === 'PATIENT'
                ? 'border-teal-600 bg-teal-50/50 ring-4 ring-teal-100'
                : 'border-slate-200 hover:border-teal-400'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-6">
              <User className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {t.role.patientTitle}
            </h2>
            <p className="text-base text-slate-600 mt-2 leading-relaxed">
              {t.role.patientDesc}
            </p>
            <div className="mt-6 flex items-center text-teal-700 font-bold gap-2 text-base">
              <span>{t.common.continue}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Card>

          {/* Doctor Choice */}
          <Card
            hoverable
            onClick={() => handleRoleSelect('DOCTOR')}
            className={`p-8 border-2 transition-all relative ${
              selected === 'DOCTOR'
                ? 'border-teal-600 bg-teal-50/50 ring-4 ring-teal-100'
                : 'border-slate-200 hover:border-teal-400'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-6">
              <Stethoscope className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {t.role.doctorTitle}
            </h2>
            <p className="text-base text-slate-600 mt-2 leading-relaxed">
              {t.role.doctorDesc}
            </p>
            <div className="mt-6 flex items-center text-teal-700 font-bold gap-2 text-base">
              <span>{t.common.continue}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {isLoading && (
          <p className="text-sm font-semibold text-teal-800 animate-pulse">
            Setting up your experience...
          </p>
        )}
      </div>
    </div>
  );
}
