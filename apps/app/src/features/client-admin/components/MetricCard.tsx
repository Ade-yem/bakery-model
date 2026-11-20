/**
 * @file Reusable KPI metric card with icon, amount, and context subtitle.
 */

import React from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'warning' | 'success';
}

export function MetricCard({
  label,
  value,
  subtitle,
  icon,
  variant = 'default',
}: MetricCardProps): React.ReactElement {
  const iconBg = {
    default: 'bg-[#0B5C63]/10 text-[#0B5C63]',
    accent: 'bg-[#A9501A]/10 text-[#A9501A]',
    warning: 'bg-amber-500/10 text-amber-700',
    success: 'bg-emerald-600/10 text-emerald-700',
  }[variant];

  return (
    <div className="bg-white rounded-2xl border border-[#D9D3C0] p-4 sm:p-5 shadow-2xs flex flex-col justify-between transition-all duration-150 hover:border-[#0B5C63]/40 font-sans">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#10201F]/60">
          {label}
        </span>
        {icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-xl sm:text-2xl font-black text-[#10201F] tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-2xs text-[#10201F]/60 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
