'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../lib/i18n-context';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { AudioHelper } from '../../components/common/AudioHelper';
import {
  Smartphone,
  CreditCard,
  Shield,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  User,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

type TabType = 'MOBILE' | 'ABHA' | 'AADHAAR';

export default function AuthPage() {
  const { t } = useTranslation();
  const { loginWithOtp } = useAuth();
  const router = useRouter();

  const [authMode, setAuthMode] = useState<'SIGNIN' | 'SIGNUP'>('SIGNIN');
  const [activeTab, setActiveTab] = useState<TabType>('MOBILE');
  const [identifier, setIdentifier] = useState<string>('+91 98765 43210');
  const [otp, setOtp] = useState<string>('');
  const [step, setStep] = useState<'IDENTIFIER' | 'OTP'>('IDENTIFIER');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [otpSentMessage, setOtpSentMessage] = useState<string>('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'signup') {
        setAuthMode('SIGNUP');
      }
    }
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setErrorMessage('');
    if (tab === 'MOBILE') setIdentifier('+91 98765 43210');
    if (tab === 'ABHA') setIdentifier('91-1234-5678-9012');
    if (tab === 'AADHAAR') setIdentifier('1234 5678 9012');
  };

  const handleQuickPatient = () => {
    setActiveTab('MOBILE');
    setIdentifier('+91 98765 43210');
    setOtp('123456');
    setErrorMessage('');
  };

  const handleQuickDoctor = () => {
    setActiveTab('MOBILE');
    setIdentifier('+91 98765 00001');
    setOtp('123456');
    setErrorMessage('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your identifier.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.requestOtp(activeTab, identifier);
      setOtpSentMessage(res.message);
      setStep('OTP');
      setOtp('123456');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await loginWithOtp(activeTab, identifier, otp);
      if (!user.role) {
        router.push('/onboarding/role');
      } else if (user.role === 'PATIENT') {
        if (authMode === 'SIGNUP' || !user.patient_profile?.onboarding_completed) {
          router.push('/onboarding/patient?signup=true');
        } else {
          router.push('/patient/dashboard');
        }
      } else if (user.role === 'DOCTOR') {
        if (!user.doctor_profile?.onboarding_completed) {
          router.push('/onboarding/doctor');
        } else {
          router.push('/doctor/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Security & Trust Pillars */}
        <div className="lg:col-span-5 space-y-6 lg:pt-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">
              Secure Sign In
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              {t.auth.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.auth.subtitle}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-900 block">Encrypted & Private</span>
                <span className="text-xs text-slate-600 block leading-relaxed">
                  Your identity and medical data are never shared without explicit consent.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-900 block">Simple OTP Sign In</span>
                <span className="text-xs text-slate-600 block leading-relaxed">
                  No complex passwords to remember. One-time passcode sent directly to your phone.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-900 block">ABHA & National IDs</span>
                <span className="text-xs text-slate-600 block leading-relaxed">
                  Easily link your Ayushman Bharat Health Account or Aadhaar.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Focused Auth Form */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 space-y-6">
            {/* Top Mode Switch: Sign In vs Sign Up */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('SIGNIN')}
                className={`py-2.5 rounded-lg transition-all text-center ${
                  authMode === 'SIGNIN'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In (Existing User)
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('SIGNUP')}
                className={`py-2.5 rounded-lg transition-all text-center ${
                  authMode === 'SIGNUP'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                New Patient Sign Up
              </button>
            </div>

            {step === 'IDENTIFIER' ? (
              /* Step 1: Identifier Selection */
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {authMode === 'SIGNUP' ? 'New Patient Registration' : t.auth.title}
                    </h2>
                    <AudioHelper
                      text={
                        authMode === 'SIGNUP'
                          ? 'New Patient Registration. Enter your mobile number or ABHA ID to verify and begin your guided health interview.'
                          : `${t.auth.title}. ${t.auth.subtitle}`
                      }
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {authMode === 'SIGNUP'
                      ? 'Verify your mobile or ABHA ID to begin your detailed Health Onboarding Interview.'
                      : t.auth.subtitle}
                  </p>
                </div>

                {/* Segmented Tab Controls */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleTabChange('MOBILE')}
                    className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'MOBILE'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{t.auth.tabMobile}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('ABHA')}
                    className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'ABHA'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{t.auth.tabAbha}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('AADHAAR')}
                    className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'AADHAAR'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>{t.auth.tabAadhaar}</span>
                  </button>
                </div>

                {/* Form Input */}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      {activeTab === 'MOBILE'
                        ? t.auth.labelMobile
                        : activeTab === 'ABHA'
                        ? t.auth.labelAbha
                        : t.auth.labelAadhaar}
                    </label>
                    <Input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        activeTab === 'MOBILE'
                          ? t.auth.placeholderMobile
                          : activeTab === 'ABHA'
                          ? t.auth.placeholderAbha
                          : t.auth.placeholderAadhaar
                      }
                      helperText={
                        activeTab === 'MOBILE'
                          ? 'We will send a 6-digit OTP to this mobile number'
                          : activeTab === 'ABHA'
                          ? 'Enter 14-digit ABHA number or address'
                          : 'Enter your 12-digit Aadhaar number'
                      }
                      className="text-base sm:text-lg"
                      required
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full"
                  >
                    {authMode === 'SIGNUP' ? 'Verify & Start Health Interview' : t.auth.sendOtp}
                  </Button>
                </form>

                {/* DEMO MODE: Polished, intentional credentials selector */}
                <div className="pt-5 border-t border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      Demo Mode
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      One-click test accounts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleQuickPatient}
                      className="text-left p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/60 hover:border-teal-300 transition-all text-teal-900 group"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-700" />
                        <span className="font-bold text-xs">Use Demo Patient</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800 block mt-1">
                        Ramesh Kumar
                      </span>
                      <span className="text-[11px] text-teal-700 block">
                        +91 98765 43210
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickDoctor}
                      className="text-left p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/60 hover:border-sky-300 transition-all text-sky-900 group"
                    >
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-sky-700" />
                        <span className="font-bold text-xs">Use Demo Doctor</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800 block mt-1">
                        Dr. Rajesh Sharma
                      </span>
                      <span className="text-[11px] text-sky-700 block">
                        +91 98765 00001
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Step 2: OTP Verification */
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setStep('IDENTIFIER')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change phone number</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {t.auth.enterOtpTitle}
                    </h2>
                    <AudioHelper text={`${t.auth.enterOtpTitle}. ${t.auth.enterOtpSubtitle}`} />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {t.auth.enterOtpSubtitle} <span className="font-semibold text-slate-800">{identifier}</span>
                  </p>
                </div>

                {otpSentMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>{otpSentMessage}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      6-Digit Verification Code
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      helperText="For demo, enter 123456"
                      className="text-2xl tracking-widest text-center font-mono font-bold"
                      autoFocus
                      required
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setStep('IDENTIFIER')}
                      className="w-full sm:w-1/3"
                    >
                      {t.common.back}
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      isLoading={isLoading}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="w-full sm:w-2/3"
                    >
                      {t.auth.verifyAndContinue}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
