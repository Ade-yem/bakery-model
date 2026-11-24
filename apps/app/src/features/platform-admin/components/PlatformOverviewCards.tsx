/**
 * @file Platform Overview metric cards presenting primary multi-tenant SaaS KPIs with permission-gated navigation.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  Clock3,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import { hasPlatformPermission } from '../permissions';
import type { PlatformMetric } from '../types';
import type { AuthenticatedActor } from '../../../components/layout/types';

export interface PlatformOverviewCardsProps {
  /** Metric statistics array. */
  metrics: PlatformMetric[];
  /** Current administrator actor holding permissions. */
  actor?: AuthenticatedActor;
}

const METRIC_ICON_MAP: Record<string, React.ReactElement> = {
  Building2: <Building2 className="w-5 h-5 text-verdigris" />,
  CreditCard: <CreditCard className="w-5 h-5 text-copper" />,
  Clock3: <Clock3 className="w-5 h-5 text-verdigris" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5 text-status-balanced" />,
};

/**
 * @description Renders four primary metric cards for SaaS platform overview with permission-aware navigation.
 * @param {PlatformOverviewCardsProps} props - Metric items and active actor.
 * @returns {React.ReactElement} Cards grid component.
 */
export function PlatformOverviewCards({
  metrics,
  actor,
}: PlatformOverviewCardsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const isPermitted =
          metric.requiredPermission && metric.targetPath
            ? hasPlatformPermission(actor, metric.requiredPermission)
            : false;

        const cardContent = (
          <div className="p-5 rounded-2xl bg-white border border-rule shadow-2xs flex flex-col justify-between h-full transition-all duration-200 hover:shadow-xs hover:border-[#C8C2AD] group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-oven-black/70 group-hover:text-oven-black transition-colors">
                {metric.label}
              </span>
              <div className="p-2.5 rounded-xl bg-flour border border-[#E5E0D0] text-verdigris shadow-2xs group-hover:bg-[#EFEBDB] transition-colors">
                {METRIC_ICON_MAP[metric.iconName] || (
                  <Activity className="w-5 h-5 text-verdigris" />
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-extrabold text-oven-black tracking-tight">
                {metric.value}
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                <span
                  className={`font-bold flex items-center px-2 py-0.5 rounded-full ${
                    metric.trend === 'down'
                      ? 'text-[#8A5A00] bg-status-open/10'
                      : metric.trend === 'neutral'
                        ? 'text-oven-black/70 bg-oven-black/5'
                        : 'text-status-balanced bg-status-balanced/10'
                  }`}
                >
                  {metric.trend === 'down' ? (
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  ) : metric.trend === 'up' ? (
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  ) : null}
                  {metric.change}
                </span>
                <span className="text-oven-black/50 font-medium truncate">
                  · {metric.subtext}
                </span>
              </div>
            </div>
          </div>
        );

        if (isPermitted && metric.targetPath) {
          return (
            <Link
              key={metric.id}
              to={metric.targetPath}
              className="block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris rounded-2xl"
              title={`Manage ${metric.label}`}
            >
              {cardContent}
            </Link>
          );
        }

        return <div key={metric.id}>{cardContent}</div>;
      })}
    </div>
  );
}
