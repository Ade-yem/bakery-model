/**
 * @file Recent platform administrative activity feed showing events, responsible actors, and timestamps.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Building2,
  CreditCard,
  Layers,
  Settings,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '../permissions';
import { MOCK_PLATFORM_ACTIVITIES } from '../mock-data';
import type { PlatformActivityItem } from '../types';
import type { AuthenticatedActor } from '../../../components/layout/types';

export interface RecentActivityFeedProps {
  /** Activity event items. */
  activities?: PlatformActivityItem[];
  /** Active administrator actor. */
  actor?: AuthenticatedActor;
}

const EVENT_ICON_MAP: Record<string, React.ReactElement> = {
  business_registered: <Building2 className="w-4 h-4 text-verdigris" />,
  subscription_activated: <CreditCard className="w-4 h-4 text-status-balanced" />,
  subscription_expired: <CreditCard className="w-4 h-4 text-status-open" />,
  plan_modified: <Layers className="w-4 h-4 text-copper" />,
  account_suspended: <ShieldAlert className="w-4 h-4 text-status-unbalanced" />,
  settings_updated: <Settings className="w-4 h-4 text-verdigris" />,
};

/**
 * @description Feed displaying critical system mutations, plan updates, tenant lifecycles, and actor audit logs.
 * @param {RecentActivityFeedProps} props - Activity records and actor.
 * @returns {React.ReactElement} Feed component.
 */
export function RecentActivityFeed({
  activities = MOCK_PLATFORM_ACTIVITIES,
  actor,
}: RecentActivityFeedProps): React.ReactElement {
  const canViewAudit = hasPlatformPermission(actor, PLATFORM_PERMISSIONS.AUDIT_VIEW);

  return (
    <div className="rounded-2xl bg-white border border-rule shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D0]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-verdigris/10 text-verdigris border border-verdigris/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-oven-black">Recent Platform Activity</h2>
              <p className="text-xs text-oven-black/60">
                Audit stream of administrative actions
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-status-balanced bg-status-balanced/10 px-2 py-0.5 rounded-full">
            Live Stream
          </span>
        </div>

        {/* Activity Stream */}
        <div className="mt-4 space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="flex gap-3 text-xs">
              <div className="mt-0.5 w-8 h-8 rounded-xl bg-flour border border-rule flex items-center justify-center shrink-0 shadow-2xs">
                {EVENT_ICON_MAP[act.type] || <Activity className="w-4 h-4 text-verdigris" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-oven-black truncate">
                    {act.title}
                  </p>
                  <span className="text-[11px] text-oven-black/40 font-medium shrink-0">
                    {act.timestamp}
                  </span>
                </div>

                <p className="text-oven-black/75 text-xs mt-0.5 leading-relaxed">
                  {act.description}
                </p>

                <div className="mt-1 flex items-center gap-2 text-[11px] text-oven-black/50 font-medium">
                  {act.actorName && (
                    <span>By <strong className="text-oven-black/70">{act.actorName}</strong></span>
                  )}
                  {act.relatedEntity && (
                    <>
                      <span>·</span>
                      <code className="font-mono bg-flour px-1.5 py-0.2 rounded border border-rule/60 text-[10px]">
                        {act.relatedEntity}
                      </code>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {canViewAudit && (
        <div className="mt-6 pt-4 border-t border-[#E5E0D0]">
          <Link
            to="/admin/audit"
            className="w-full py-2.5 px-4 rounded-xl border border-rule bg-flour hover:bg-ledger text-oven-black text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Review Full Platform Audit Log</span>
            <ArrowRight className="w-4 h-4 text-verdigris" />
          </Link>
        </div>
      )}
    </div>
  );
}
