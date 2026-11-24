/**
 * @file Summary KPI overview cards for the Platform Admin Audit and Activity log.
 */

import React from 'react';
import { ShieldCheck, Calendar, ShieldAlert, Activity } from 'lucide-react';
import type { PlatformAuditRecord } from '../../types';

export interface AuditOverviewCardsProps {
  /** Full list of audit logs to compute KPIs from. */
  records: PlatformAuditRecord[];
  /** Optional reference date for today's count (YYYY-MM-DD). */
  referenceDate?: string;
}

/**
 * @description Summary metric cards for Total Activities, Today's Activities, Administrative Actions, and Security Events.
 * @param {AuditOverviewCardsProps} props - Component properties.
 * @returns {React.ReactElement} Overview cards grid element.
 */
export function AuditOverviewCards({
  records,
  referenceDate = '2026-02-18',
}: AuditOverviewCardsProps): React.ReactElement {
  const total = records.length;

  const todayCount = records.filter(
    (r) => r.timestamp.slice(0, 10) === referenceDate
  ).length;

  const adminActionsCount = records.filter(
    (r) => r.module !== 'Security / Auth'
  ).length;

  const securityEventsCount = records.filter(
    (r) => r.module === 'Security / Auth' || r.actionType === 'security_event'
  ).length;

  const cards = [
    {
      id: 'total',
      label: 'Total Activities',
      value: total,
      subtext: 'Immutable platform events',
      icon: Activity,
      color: 'text-[#0B5C63]',
      bg: 'bg-[#0B5C63]/10',
    },
    {
      id: 'today',
      label: "Today's Activities",
      value: todayCount,
      subtext: 'Recorded today',
      icon: Calendar,
      color: 'text-[#2C571D]',
      bg: 'bg-[#2C571D]/10',
    },
    {
      id: 'admin',
      label: 'Administrative Actions',
      value: adminActionsCount,
      subtext: 'Manual changes by super admins',
      icon: ShieldCheck,
      color: 'text-[#A9501A]',
      bg: 'bg-[#A9501A]/10',
    },
    {
      id: 'security',
      label: 'Security Events',
      value: securityEventsCount,
      subtext: 'Auth challenges & anomalies',
      icon: ShieldAlert,
      color: 'text-[#C53030]',
      bg: 'bg-[#C53030]/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 font-sans">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="p-4 rounded-xl border border-[#D9D3C0] bg-white shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#10201F]/70 line-clamp-1">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-extrabold text-[#10201F] tracking-tight">
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
