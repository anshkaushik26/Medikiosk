'use client';

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className = '',
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm text-teal-700 mx-auto flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>
      {actionLabel && (onAction || actionHref) && (
        <div className="pt-2">
          {actionHref ? (
            <a href={actionHref}>
              <Button size="md" variant="secondary">
                {actionLabel}
              </Button>
            </a>
          ) : (
            <Button size="md" variant="secondary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
