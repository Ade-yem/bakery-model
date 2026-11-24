/**
 * @file Summary metric KPI cards for Platform Admin Subscription Plans module.
 */

import React from 'react';
import { Layers, CheckCircle2, Archive } from 'lucide-react';
import type { PlatformSubscriptionPlan } from '../../types';

export interface PlansOverviewCardsProps {
  /** Full list of subscription plans to compute KPIs from. */
  plans: PlatformSubscriptionPlan[];
}

/**
 * @description Renders summary KPI cards for total plans, active plans, and archived plans.
 * @param {PlansOverviewCardsProps} props - Plans list.
 * @returns {React.ReactElement} Overview cards grid.
 */
export function PlansOverviewCards({ plans }: PlansOverviewCardsProps): React.ReactElement {
  const totalCount = plans.length;
  const activeCount = plans.filter((p) => p.status === 'active').length;
  const archivedCount = plans.filter((p) => p.status === 'archived').length;

  const cards = [
    {
      id: 'total',
      label: 'Total Plans',
      value: totalCount,
      subtext: 'Configured billing tiers',
      icon: Layers,
      color: 'text-[#0B5C63]',
      bg: 'bg-[#0B5C63]/10',
    },
    {
      id: 'active',
      label: 'Active Plans',
      value: activeCount,
      subtext: 'Available for client signup',
      icon: CheckCircle2,
      color: 'text-[#2C571D]',
      bg: 'bg-[#2C571D]/10',
    },
    {
      id: 'archived',
      label: 'Archived Plans',
      value: archivedCount,
      subtext: 'Legacy plans preserved',
      icon: Archive,
      color: 'text-[#A9501A]',
      bg: 'bg-[#A9501A]/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="p-4 sm:p-5 rounded-xl border border-[#D9D3C0] bg-white shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#10201F]/70">{card.label}</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#10201F] mt-1 tracking-tight">
                {card.value}
              </h3>
              <p className="text-xs text-[#10201F]/60 mt-0.5">{card.subtext}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.bg} ${card.color} shrink-0`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
