'use client';

import React from 'react';
import { useTranslation } from '../../lib/i18n-context';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className={`inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 ${className}`}>
      <div className="pl-2 pr-1 text-slate-500">
        <Globe className="w-4 h-4" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
          language === 'en'
            ? 'bg-white text-teal-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
          language === 'hi'
            ? 'bg-white text-teal-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
};
