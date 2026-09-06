'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n-context';
import {
  Home,
  HeartPulse,
  FileText,
  Clock,
  Pill,
  AlertTriangle,
  Users,
  Scissors,
  MoreHorizontal,
  X,
} from 'lucide-react';

export function PatientNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  // Only show patient nav on /patient/* routes
  if (!pathname.startsWith('/patient')) {
    return null;
  }

  const navItems = [
    { href: '/patient/dashboard', label: 'Home', icon: Home },
    { href: '/patient/health', label: 'Health', icon: HeartPulse },
    { href: '/patient/reports', label: 'Reports', icon: FileText },
    { href: '/patient/timeline', label: 'Timeline', icon: Clock },
  ];

  const moreItems = [
    { href: '/patient/medicines', label: t.patientDashboard.actionMedicines, icon: Pill, color: 'text-blue-600 bg-blue-50' },
    { href: '/patient/allergies', label: t.health.secAllergies, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { href: '/patient/family', label: t.health.secFamily, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { href: '/patient/surgeries', label: t.health.secSurgeries, icon: Scissors, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <>
      {/* Desktop sub-navigation banner */}
      <div className="hidden md:block bg-white border-b border-slate-200 shadow-sm sticky top-20 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto py-2.5">
          <Link
            href="/patient/dashboard"
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              pathname === '/patient/dashboard'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/patient/health"
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              pathname === '/patient/health'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>{t.health.title}</span>
          </Link>
          <Link
            href="/patient/medicines"
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              pathname === '/patient/medicines'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>{t.medicines.title}</span>
          </Link>
          <Link
            href="/patient/allergies"
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              pathname === '/patient/allergies'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t.allergies.title}</span>
          </Link>
          <Link
            href="/patient/reports"
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              pathname.startsWith('/patient/reports')
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.reports.title}</span>
          </Link>
          <Link
            href="/patient/timeline"
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              pathname === '/patient/timeline'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.timeline.title}</span>
          </Link>
          <Link
            href="/patient/family"
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              pathname === '/patient/family'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.family.title}</span>
          </Link>
          <Link
            href="/patient/surgeries"
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              pathname === '/patient/surgeries'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>{t.surgeries.title}</span>
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Minimum 56px touch target) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/patient/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[56px] px-2 py-1 rounded-2xl transition-all ${
                isActive
                  ? 'text-teal-700 font-bold bg-teal-50/80 scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] mt-1 leading-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* More Button */}
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[56px] px-2 py-1 rounded-2xl transition-all ${
            showMore
              ? 'text-teal-700 font-bold bg-teal-50/80'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-expanded={showMore}
        >
          <MoreHorizontal className="w-5 h-5 stroke-2" />
          <span className="text-[11px] mt-1 leading-tight">More</span>
        </button>
      </nav>

      {/* "More" Drawer / Modal on Mobile */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end animate-fadeIn">
          <div
            className="bg-white rounded-t-3xl p-6 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">More Health Options</h3>
              <button
                type="button"
                onClick={() => setShowMore(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isSelected = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`p-4 rounded-2xl border flex flex-col items-start gap-2 transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-100'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 leading-snug">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
