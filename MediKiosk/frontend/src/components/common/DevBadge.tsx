'use client';

import React from 'react';
import { useTranslation } from '../../lib/i18n-context';
import { useAuth } from '../../lib/auth-context';
import { RotateCcw, Key } from 'lucide-react';

export const DevBadge: React.FC = () => {
  const { t } = useTranslation();
  const { resetDemoData } = useAuth();
  const [showPrompt, setShowPrompt] = React.useState(false);

  const handleReset = async () => {
    try {
      await resetDemoData();
      alert(t.settings.resetSuccess);
    } catch {
      alert('Demo data reset completed.');
    }
  };

  return (
    <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <span className="font-bold uppercase tracking-wider bg-amber-200 px-1.5 py-0.5 rounded text-[10px]">
          Demo Mode
        </span>
        <span className="inline-flex items-center gap-1 font-medium">
          <Key className="w-3.5 h-3.5 text-amber-700" />
          {t.common.demoHint}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          {t.common.resetDemo}
        </button>
      </div>
    </div>
  );
};
