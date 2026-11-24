/**
 * @file Overview metric cards for the Businesses Management directory.
 */

import React from 'react';
import { Building2, CheckCircle2, Clock3, AlertOctagon } from 'lucide-react';
import type { PlatformBusiness } from '../../types';

export interface BusinessOverviewCardsProps {
  /** Array of businesses to compute statistics from. */
  businesses: PlatformBusiness[];
}

/**
 * @description Renders summary overview cards showing counts of total, active, pending, and suspended businesses.
 * @param {BusinessOverviewCardsProps} props - Component properties containing businesses.
 * @returns {React.ReactElement} Metric cards grid.
 * @example
 * ```tsx
 * <BusinessOverviewCards businesses={businesses} />
 * ```
 */
export function BusinessOverviewCards({
  businesses,
}: BusinessOverviewCardsProps): React.ReactElement {
  const total = businesses.length;
  const active = businesses.filter((b) => b.accountStatus === 'active').length;
  const pending = businesses.filter((b) => b.accountStatus === 'pending').length;
  const suspended = businesses.filter((b) => b.accountStatus === 'suspended').length;

  const cards = [
    {
      label: 'Total Businesses',
      value: total,
      subtext: 'Registered SaaS tenants',
      icon: Building2,
      accentColor: 'text-[#0B5C63]',
      bgColor: 'bg-[#0B5C63]/10',
    },
    {
      label: 'Active Businesses',
      value: active,
      subtext: 'Operational accounts',
      icon: CheckCircle2,
      accentColor: 'text-[#2C571D]',
      bgColor: 'bg-[#2C571D]/10',
    },
    {
      label: 'Pending Accounts',
      value: pending,
      subtext: 'Awaiting activation',
      icon: Clock3,
      accentColor: 'text-[#A9501A]',
      bgColor: 'bg-[#A9501A]/10',
    },
    {
      label: 'Suspended Accounts',
      value: suspended,
      subtext: 'Restricted access',
      icon: AlertOctagon,
      accentColor: 'text-[#8C1D18]',
      bgColor: 'bg-[#8C1D18]/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 font-sans">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="p-3.5 sm:p-5 bg-white border border-[#D9D3C0] rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 transition-all hover:shadow-sm min-w-0"
          >
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-[#10201F]/70 tracking-wide uppercase truncate">
                {card.label}
              </p>
              <div className="mt-0.5 sm:mt-1 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-[#10201F] font-sans">
                  {card.value}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#10201F]/60 mt-0.5 truncate hidden xs:block sm:block">
                {card.subtext}
              </p>
            </div>
            <div
              className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 self-start sm:self-auto ${card.bgColor} ${card.accentColor}`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
