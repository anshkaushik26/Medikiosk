'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AudioHelper } from '@/components/common/AudioHelper';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  audioText?: string;
  action?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backHref,
  backLabel = 'Back',
  audioText,
  action,
  breadcrumbs,
  className = '',
}) => {
  const speechContent = audioText || (subtitle ? `${title}. ${subtitle}` : title);

  return (
    <div className={`space-y-3 pb-2 ${className}`}>
      {/* Breadcrumbs or Back Link */}
      {(backHref || (breadcrumbs && breadcrumbs.length > 0)) && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 font-medium text-teal-700 hover:text-teal-900 transition-colors py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backLabel}</span>
            </Link>
          )}

          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-300">/</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-slate-900 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-800">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <AudioHelper text={speechContent} />
          </div>
          {subtitle && (
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className="flex-shrink-0 flex items-center gap-3">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
