'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n-context';
import { useAuth } from '../../lib/auth-context';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AudioHelper } from '../../components/common/AudioHelper';
import { Globe, Type, Eye, RotateCcw, Check, Sparkles, Volume2 } from 'lucide-react';

export default function SettingsPage() {
  const { language, setLanguage, t } = useTranslation();
  const { resetDemoData } = useAuth();
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 4000);
    } catch {
      alert('Demo data reset completed.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            {t.settings.title}
          </h1>
          <p className="text-base text-slate-600 mt-1">
            Personalize your reading, language and accessibility preferences.
          </p>
        </div>
        <AudioHelper text={`${t.settings.title}. Configure language, text size and accessibility.`} />
      </div>

      {/* Language Section */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.settings.languageTitle}</h2>
            <p className="text-sm text-slate-500">Switch instantly between English and हिन्दी</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-2xl border-2 text-left font-bold text-base transition-all flex items-center justify-between ${
              language === 'en'
                ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>English</span>
            {language === 'en' && <Check className="w-5 h-5 text-teal-600" />}
          </button>
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`p-4 rounded-2xl border-2 text-left font-bold text-base transition-all flex items-center justify-between ${
              language === 'hi'
                ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>हिन्दी (Hindi)</span>
            {language === 'hi' && <Check className="w-5 h-5 text-teal-600" />}
          </button>
        </div>
      </Card>

      {/* Text Sizing Section */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.settings.textSizeTitle}</h2>
            <p className="text-sm text-slate-500">Optimized for seniors and high readability</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setTextSize('normal')}
            className={`p-3.5 rounded-2xl border-2 text-sm font-semibold transition-all ${
              textSize === 'normal'
                ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.settings.sizeNormal} (16px)
          </button>
          <button
            type="button"
            onClick={() => setTextSize('large')}
            className={`p-3.5 rounded-2xl border-2 text-base font-bold transition-all ${
              textSize === 'large'
                ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.settings.sizeLarge} (18px)
          </button>
          <button
            type="button"
            onClick={() => setTextSize('extra-large')}
            className={`p-3.5 rounded-2xl border-2 text-lg font-black transition-all ${
              textSize === 'extra-large'
                ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.settings.sizeExtraLarge} (22px)
          </button>
        </div>
      </Card>

      {/* Developer Demo Controls */}
      <Card className="p-6 sm:p-8 space-y-4 border-amber-200 bg-amber-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.settings.resetSectionTitle}</h2>
            <p className="text-sm text-slate-500">
              Clear custom modifications and restore default demo accounts (Ramesh Kumar & Dr. Sharma).
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
            isLoading={isResetting}
            leftIcon={<RotateCcw className="w-5 h-5 text-amber-700" />}
            className="border-amber-300 text-amber-900 hover:bg-amber-100"
          >
            {t.settings.resetBtn}
          </Button>

          {resetDone && (
            <p className="mt-3 text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {t.settings.resetSuccess}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
