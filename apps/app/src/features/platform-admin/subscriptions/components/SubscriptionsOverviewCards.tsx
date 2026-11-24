/**
 * @file Summary KPI overview cards for the Platform Admin Subscriptions module.
 */

import React from 'react';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import type { PlatformSubscription } from '../../types';

export interface SubscriptionsOverviewCardsProps {
  /** Full collection of platform subscriptions. */
  subscriptions: PlatformSubscription[];
}

/**
 * @description Renders summary cards for Total, Active, Pending, Expired, and Cancelled subscriptions.
 * @param {SubscriptionsOverviewCardsProps} props - Subscriptions dataset.
 * @returns {React.ReactElement} KPI cards grid.
 */
export function SubscriptionsOverviewCards({
  subscriptions,
}: SubscriptionsOverviewCardsProps): React.ReactElement {
  const total = subscriptions.length;
  const active = subscriptions.filter((s) => s.status === 'active').length;
  const pending = subscriptions.filter((s) => s.status === 'pending').length;
  const expired = subscriptions.filter((s) => s.status === 'expired').length;
  const cancelled = subscriptions.filter((s) => s.status === 'cancelled').length;

  const cards = [
    {
      id: 'total',
      label: 'Total Subscriptions',
      value: total,
      subtext: 'Client business accounts',
      icon: CreditCard,
      color: 'text-[#0B5C63]',
      bg: 'bg-[#0B5C63]/10',
    },
    {
      id: 'active',
      label: 'Active Subscriptions',
      value: active,
      subtext: 'Operational accounts',
      icon: CheckCircle2,
      color: 'text-[#2C571D]',
      bg: 'bg-[#2C571D]/10',
    },
    {
      id: 'pending',
      label: 'Pending Subscriptions',
      value: pending,
      subtext: 'Awaiting settlement',
      icon: Clock,
      color: 'text-[#D9822B]',
      bg: 'bg-[#D9822B]/10',
    },
    {
      id: 'expired',
      label: 'Expired Subscriptions',
      value: expired,
      subtext: 'Renewal overdue',
      icon: AlertTriangle,
      color: 'text-[#A9501A]',
      bg: 'bg-[#A9501A]/10',
    },
    {
      id: 'cancelled',
      label: 'Cancelled Subscriptions',
      value: cancelled,
      subtext: 'Deactivated accounts',
      icon: XCircle,
      color: 'text-[#10201F]/60',
      bg: 'bg-[#10201F]/5',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-sans">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="p-3.5 sm:p-4 rounded-xl border border-[#D9D3C0] bg-white shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#10201F]/70 line-clamp-1">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#10201F] tracking-tight">
                {card.value}
              </h3>
              <p className="text-[11px] text-[#10201F]/50 mt-0.5 line-clamp-1">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
