'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import { TimelineEvent } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AudioHelper } from '@/components/common/AudioHelper';
import {
  Clock,
  HeartPulse,
  Pill,
  AlertTriangle,
  FileText,
  Scissors,
  ArrowUpDown,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

export default function PatientTimelinePage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  const loadTimeline = async (filterVal: string) => {
    try {
      setLoading(true);
      const data = await api.getTimeline(filterVal);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline(activeFilter);
  }, [activeFilter]);

  const handleFilterClick = (filterKey: string) => {
    setActiveFilter(filterKey);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'NEWEST' ? 'OLDEST' : 'NEWEST'));
  };

  // Sort events client-side based on sortOrder
  const sortedEvents = [...events].sort((a, b) => {
    const d1 = a.event_date || a.created_at || '';
    const d2 = b.event_date || b.created_at || '';
    if (sortOrder === 'NEWEST') {
      return d2.localeCompare(d1);
    } else {
      return d1.localeCompare(d2);
    }
  });

  const getEventIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CONDITION':
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'MEDICATION':
        return <Pill className="w-5 h-5 text-amber-600" />;
      case 'ALLERGY':
        return <AlertTriangle className="w-5 h-5 text-rose-700" />;
      case 'REPORT':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'SURGERY':
        return <Scissors className="w-5 h-5 text-emerald-600" />;
      default:
        return <Clock className="w-5 h-5 text-teal-600" />;
    }
  };

  const getEventColorBg = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CONDITION':
        return 'bg-rose-50 border-rose-200';
      case 'MEDICATION':
        return 'bg-amber-50 border-amber-200';
      case 'ALLERGY':
        return 'bg-rose-100/70 border-rose-300';
      case 'REPORT':
        return 'bg-blue-50 border-blue-200';
      case 'SURGERY':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getTargetLink = (evt: TimelineEvent) => {
    switch (evt.source_type?.toUpperCase()) {
      case 'REPORT':
        return evt.source_id ? `/patient/reports/${evt.source_id}` : '/patient/reports';
      case 'MEDICATION':
        return '/patient/medicines';
      case 'CONDITION':
        return '/patient/health';
      case 'ALLERGY':
        return '/patient/allergies';
      case 'SURGERY':
        return '/patient/surgeries';
      default:
        return '/patient/health';
    }
  };

  const filterButtons = [
    { key: 'ALL', label: t.timeline.filterAll },
    { key: 'CONDITION', label: t.timeline.filterConditions },
    { key: 'MEDICATION', label: t.timeline.filterMedicines },
    { key: 'ALLERGY', label: t.timeline.filterAllergies },
    { key: 'REPORT', label: t.timeline.filterReports },
    { key: 'SURGERY', label: t.timeline.filterSurgeries },
  ];

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/patient/health" className="text-teal-700 hover:text-teal-900 p-1 -ml-1">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              {t.timeline.title}
            </h1>
            <AudioHelper text={`${t.timeline.title}. ${t.timeline.subtitle}`} />
          </div>
          <p className="text-base text-slate-600">
            {t.timeline.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleSortOrder}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <ArrowUpDown className="w-4 h-4 text-teal-700" />
          <span>{sortOrder === 'NEWEST' ? t.timeline.sortNewest : t.timeline.sortOldest}</span>
        </button>
      </div>

      {/* Filter Pills (Horizontally scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterButtons.map((btn) => {
          const isActive = activeFilter === btn.key;
          return (
            <button
              key={btn.key}
              type="button"
              onClick={() => handleFilterClick(btn.key)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20 scale-105'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {loading && sortedEvents.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-medium">{t.common.loading}</div>
      ) : sortedEvents.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border-2 border-dashed border-slate-300">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 mx-auto flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">{t.timeline.empty}</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            No medical timeline events found for this filter.
          </p>
        </Card>
      ) : (
        <div className="relative pl-6 sm:pl-10 space-y-6">
          {/* Vertical timeline connector line */}
          <div className="absolute left-[19px] sm:left-[27px] top-4 bottom-4 w-1 bg-slate-200 rounded-full pointer-events-none" />

          {sortedEvents.map((evt) => {
            const icon = getEventIcon(evt.event_type);
            const colorClass = getEventColorBg(evt.event_type);
            const linkHref = getTargetLink(evt);

            return (
              <div key={evt.id} className="relative group">
                {/* Milestone Node on track */}
                <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-white border-2 border-teal-600 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  {icon}
                </div>

                {/* Event Card */}
                <Link href={linkHref} className="block">
                  <Card
                    hoverable
                    className={`p-5 sm:p-6 border-2 transition-all ml-4 sm:ml-4 ${colorClass}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-2.5 mb-2.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="teal">
                          {evt.event_type}
                        </Badge>
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {evt.title}
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{evt.event_date || new Date(evt.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {evt.description || 'No additional details.'}
                      </p>
                      <div className="text-teal-700 shrink-0 group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
