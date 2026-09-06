'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../../lib/i18n-context';
import { useAuth } from '../../lib/auth-context';
import { LanguageSwitcher } from './LanguageSwitcher';
import { HeartPulse, Settings, LogOut, User, Stethoscope } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, role, logout } = useAuth();
  const pathname = usePathname();

  // Hide nav controls on full onboarding screen 1 & 2 if preferred
  const isMinimal = pathname === '/' || pathname === '/auth';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/30 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900 block leading-none">
              MEDIKIOSK
            </span>
            <span className="text-xs font-semibold text-teal-700 tracking-wide block mt-1">
              DIGITAL HEALTHCARE
            </span>
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth?mode=signin"
                className="px-3.5 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-teal-800 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth?mode=signup"
                className="px-4 py-2 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                className="p-2.5 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                title={t.common.settings}
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                title={t.common.logout}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.common.logout}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
