/**
 * @file Quick action shortcut panel with permission-aware link visibility.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Layers,
  CreditCard,
  History,
  Zap,
} from 'lucide-react';
import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '../permissions';
import type { AuthenticatedActor } from '../../../components/layout/types';

export interface AdminQuickActionsProps {
  /** Active administrator actor holding resolved permissions. */
  actor?: AuthenticatedActor;
}

interface QuickActionConfig {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: React.ReactElement;
  requiredPermission: string;
}

const QUICK_ACTIONS: readonly QuickActionConfig[] = [
  {
    id: 'businesses',
    label: 'View Businesses',
    description: 'Inspect registered commercial bakery accounts',
    path: '/admin/businesses',
    icon: <Building2 className="w-4 h-4 text-verdigris" />,
    requiredPermission: PLATFORM_PERMISSIONS.BUSINESSES_VIEW,
  },
  {
    id: 'plans',
    label: 'Manage Subscription Plans',
    description: 'Configure pricing, limits, and product feature tiers',
    path: '/admin/plans',
    icon: <Layers className="w-4 h-4 text-copper" />,
    requiredPermission: PLATFORM_PERMISSIONS.PLANS_MANAGE,
  },
  {
    id: 'subscriptions',
    label: 'View Subscriptions',
    description: 'Monitor renewals, payment settlements, and upgrades',
    path: '/admin/subscriptions',
    icon: <CreditCard className="w-4 h-4 text-status-balanced" />,
    requiredPermission: PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW,
  },
  {
    id: 'audit',
    label: 'Review Platform Activity',
    description: 'Inspect administrative audit trails and system mutations',
    path: '/admin/audit',
    icon: <History className="w-4 h-4 text-verdigris" />,
    requiredPermission: PLATFORM_PERMISSIONS.AUDIT_VIEW,
  },
] as const;

/**
 * @description Quick operational shortcuts for Platform Administrators dynamically filtered by actor permissions.
 * @param {AdminQuickActionsProps} props - Current actor.
 * @returns {React.ReactElement} Action grid.
 */
export function AdminQuickActions({ actor }: AdminQuickActionsProps): React.ReactElement | null {
  const visibleActions = QUICK_ACTIONS.filter((action) =>
    hasPlatformPermission(actor, action.requiredPermission)
  );

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-rule shadow-2xs">
      <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5E0D0]">
        <div className="p-2 rounded-xl bg-verdigris/10 text-verdigris border border-verdigris/20">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-oven-black">Quick Actions</h2>
          <p className="text-xs text-oven-black/60">
            Frequently performed administrative workflows
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        {visibleActions.map((action) => (
          <Link
            key={action.id}
            to={action.path}
            className="p-4 rounded-xl bg-flour border border-rule hover:border-[#C8C2AD] hover:bg-[#EFEBDB] transition-all duration-200 group flex flex-col justify-between cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-white border border-rule shadow-2xs group-hover:scale-105 transition-transform">
                {action.icon}
              </div>
            </div>

            <div className="mt-3">
              <span className="font-bold text-sm text-oven-black group-hover:text-verdigris transition-colors block">
                {action.label}
              </span>
              <span className="text-xs text-oven-black/60 mt-0.5 line-clamp-2 leading-relaxed">
                {action.description}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
