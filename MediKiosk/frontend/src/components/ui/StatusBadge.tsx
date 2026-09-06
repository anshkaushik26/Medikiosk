'use client';

import React from 'react';
import { CheckCircle2, FileText, UserCheck, Stethoscope, AlertTriangle, Clock } from 'lucide-react';

export type StatusBadgeType =
  | 'PATIENT_REPORTED'
  | 'DOCUMENT_EXTRACTED'
  | 'PATIENT_VERIFIED'
  | 'DOCTOR_VERIFIED'
  | 'NEEDS_REVIEW'
  | 'URGENT'
  | 'ACTIVE'
  | 'RESOLVED';

interface StatusBadgeProps {
  status: StatusBadgeType | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
}) => {
  const norm = status.toUpperCase().replace(/\s+/g, '_');

  const configs: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; defaultLabel: string }> = {
    PATIENT_REPORTED: {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      icon: <Clock className="w-3.5 h-3.5 text-sky-600" />,
      defaultLabel: 'Patient reported',
    },
    DOCUMENT_EXTRACTED: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      icon: <FileText className="w-3.5 h-3.5 text-indigo-600" />,
      defaultLabel: 'Document extracted',
    },
    PATIENT_VERIFIED: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      defaultLabel: 'Patient verified',
    },
    DOCTOR_VERIFIED: {
      bg: 'bg-teal-50',
      text: 'text-teal-900',
      border: 'border-teal-300',
      icon: <Stethoscope className="w-3.5 h-3.5 text-teal-700" />,
      defaultLabel: 'Doctor verified',
    },
    NEEDS_REVIEW: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
      defaultLabel: 'Needs review',
    },
    URGENT: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
      defaultLabel: 'Urgent attention',
    },
    ACTIVE: {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />,
      defaultLabel: 'Active',
    },
    RESOLVED: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />,
      defaultLabel: 'Resolved',
    },
  };

  const current = configs[norm] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: null,
    defaultLabel: label || status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {current.icon}
      <span>{label || current.defaultLabel}</span>
    </span>
  );
};
