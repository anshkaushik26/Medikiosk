'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../lib/i18n-context';
import { useAuth } from '../../../lib/auth-context';
import { saveDraft, loadDraft, clearDraft } from '../../../lib/draft-storage';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { AudioHelper } from '../../../components/common/AudioHelper';
import { Stethoscope, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface DoctorFormData {
  fullName: string;
  specialization: string;
  regNumber: string;
  hospital: string;
  department: string;
  languages: string;
  yearsExperience: number;
}

const defaultDoctorData: DoctorFormData = {
  fullName: 'Dr. Rajesh Sharma',
  specialization: 'General Medicine & Family Health',
  regNumber: 'DMC-2012-45890',
  hospital: 'City Health Clinic',
  department: 'Internal Medicine',
  languages: 'English, Hindi',
  yearsExperience: 14,
};

export default function DoctorOnboardingPage() {
  const { t } = useTranslation();
  const { updateDoctorProfile } = useAuth();
  const router = useRouter();

  // Draft persistence across browser refresh
  const [formData, setFormData] = useState<DoctorFormData>(() =>
    loadDraft('doctor_onboarding', defaultDoctorData)
  );
  const [step, setStep] = useState<number>(() =>
    loadDraft('doctor_step', 1)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    saveDraft('doctor_onboarding', formData);
  }, [formData]);

  useEffect(() => {
    saveDraft('doctor_step', step);
  }, [step]);

  const updateField = (field: keyof DoctorFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await updateDoctorProfile({
        full_name: formData.fullName,
        specialization: formData.specialization,
        registration_number: formData.regNumber,
        hospital_clinic: formData.hospital,
        department: formData.department,
        languages_spoken: formData.languages,
        years_of_experience: Number(formData.yearsExperience) || 0,
        onboarding_completed: true,
      });
      clearDraft('doctor_onboarding');
      clearDraft('doctor_step');
      router.push('/doctor/dashboard');
    } catch (err) {
      console.error('Doctor profile save error:', err);
      router.push('/doctor/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="p-6 sm:p-10 shadow-lg space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 mx-auto flex items-center justify-center">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {t.doctorOnboarding.title}
              </h1>
              <AudioHelper text={`${t.doctorOnboarding.title}. Step ${step} of 4.`} />
            </div>
            <p className="text-base text-slate-600">
              {t.doctorOnboarding.subtitle}
            </p>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400">
            <span className={step >= 1 ? 'text-teal-700 font-extrabold' : ''}>1. Personal</span>
            <span className={step >= 2 ? 'text-teal-700 font-extrabold' : ''}>2. Credentials</span>
            <span className={step >= 3 ? 'text-teal-700 font-extrabold' : ''}>3. Workplace</span>
            <span className={step >= 4 ? 'text-teal-700 font-extrabold' : ''}>4. Practice</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-800">
                {t.doctorOnboarding.step1Title}
              </h2>
              <Input
                label={t.doctorOnboarding.fullName}
                placeholder={t.doctorOnboarding.fullNamePlaceholder}
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                required
              />
              <Button
                size="xl"
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full mt-4"
              >
                {t.common.continue}
              </Button>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-800">
                {t.doctorOnboarding.step2Title}
              </h2>
              <Input
                label={t.doctorOnboarding.specialization}
                placeholder={t.doctorOnboarding.specializationPlaceholder}
                value={formData.specialization}
                onChange={(e) => updateField('specialization', e.target.value)}
                required
              />
              <Input
                label={t.doctorOnboarding.regNumber}
                placeholder={t.doctorOnboarding.regPlaceholder}
                value={formData.regNumber}
                onChange={(e) => updateField('regNumber', e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="lg" onClick={() => setStep(1)} className="w-1/3">
                  {t.common.back}
                </Button>
                <Button size="xl" onClick={() => setStep(3)} className="w-2/3">
                  {t.common.continue}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Workplace */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-800">
                {t.doctorOnboarding.step3Title}
              </h2>
              <Input
                label={t.doctorOnboarding.hospital}
                placeholder={t.doctorOnboarding.hospitalPlaceholder}
                value={formData.hospital}
                onChange={(e) => updateField('hospital', e.target.value)}
              />
              <Input
                label={t.doctorOnboarding.department}
                placeholder={t.doctorOnboarding.departmentPlaceholder}
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="lg" onClick={() => setStep(2)} className="w-1/3">
                  {t.common.back}
                </Button>
                <Button size="xl" onClick={() => setStep(4)} className="w-2/3">
                  {t.common.continue}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Practice & Finish */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-800">
                {t.doctorOnboarding.step4Title}
              </h2>
              <Input
                label={t.doctorOnboarding.languages}
                placeholder={t.doctorOnboarding.languagesPlaceholder}
                value={formData.languages}
                onChange={(e) => updateField('languages', e.target.value)}
              />
              <Input
                label={t.doctorOnboarding.yearsExp}
                type="number"
                value={formData.yearsExperience}
                onChange={(e) => updateField('yearsExperience', e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="lg" onClick={() => setStep(3)} className="w-1/3">
                  {t.common.back}
                </Button>
                <Button
                  size="xl"
                  onClick={handleFinish}
                  isLoading={isSubmitting}
                  className="w-2/3"
                >
                  {t.doctorOnboarding.finishToDashboard}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
