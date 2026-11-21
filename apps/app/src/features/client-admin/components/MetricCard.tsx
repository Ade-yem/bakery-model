/**
 * @file KPI metric card adopting the Platform Admin design standards.
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  targetPath?: string;
}

export function MetricCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = 'neutral',
}: MetricCardProps): React.ReactElement {
  return (
    <div className="p-5 rounded-2xl bg-white border border-rule shadow-2xs flex flex-col justify-between h-full transition-all duration-200 hover:shadow-xs hover:border-[#C8C2AD] group font-sans">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-oven-black/70 group-hover:text-oven-black transition-colors">
          {label}
        </span>
        <div className="p-2.5 rounded-xl bg-flour border border-[#E5E0D0] text-verdigris shadow-2xs group-hover:bg-[#EFEBDB] transition-colors">
          {icon || <Activity className="w-5 h-5 text-verdigris" />}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-oven-black">
          {value}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                trendDirection === 'up'
                  ? 'bg-emerald-50 text-emerald-800'
                  : trendDirection === 'down'
                  ? 'bg-rose-50 text-rose-800'
                  : 'bg-ledger text-oven-black/70'
              }`}
            >
              {trendDirection === 'up' && <ArrowUpRight className="w-3 h-3" />}
              {trendDirection === 'down' && <ArrowDownRight className="w-3 h-3" />}
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-oven-black/60 truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
