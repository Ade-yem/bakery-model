/**
 * @file Mobile responsive stacked card representation of a single subscription plan.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit2, Archive, CheckCircle2, Users } from 'lucide-react';
import type { PlatformSubscriptionPlan } from '../../types';

export interface PlanMobileCardProps {
  /** Plan entity. */
  plan: PlatformSubscriptionPlan;
  /** Whether actor has manage permissions. */
  canManage: boolean;
  /** Action handler to prompt archive / activate modal. */
  onToggleStatus: (plan: PlatformSubscriptionPlan) => void;
}

/**
 * @description Stacked mobile card presenting plan details, price, modules, and administrative actions.
 * @param {PlanMobileCardProps} props - Component properties.
 * @returns {React.ReactElement} Mobile plan card element.
 */
export function PlanMobileCard({
  plan,
  canManage,
  onToggleStatus,
}: PlanMobileCardProps): React.ReactElement {
  const isArchived = plan.status === 'archived';

  return (
    <div className="plan-mobile-card p-4 rounded-xl border border-[#D9D3C0] bg-white shadow-xs space-y-3">
      {/* Header: Name and Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-base font-bold text-[#10201F]">{plan.name}</h4>
          <p className="text-xs text-[#10201F]/70 line-clamp-2 mt-0.5">
            {plan.description}
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
            isArchived
              ? 'bg-[#A9501A]/10 text-[#A9501A] border border-[#A9501A]/20'
              : 'bg-[#2C571D]/10 text-[#2C571D] border border-[#2C571D]/20'
          }`}
        >
          {plan.status}
        </span>
      </div>

      {/* Pricing & Subscribers */}
      <div className="flex items-center justify-between text-xs py-2 border-y border-[#D9D3C0]/60 bg-[#FDFCF7] -mx-4 px-4">
        <div>
          <span className="text-sm font-extrabold text-[#10201F]">
            ₦{plan.price.toLocaleString()}
          </span>
          <span className="text-[#10201F]/60 ml-1 capitalize">/ {plan.billingPeriod}</span>
        </div>
        <div className="flex items-center gap-1 text-[#10201F]/70">
          <Users className="w-3.5 h-3.5 text-[#0B5C63]" />
          <span>{plan.subscribersCount} subscribers</span>
        </div>
      </div>

      {/* Modules & Limits chips */}
      <div className="space-y-1.5 text-xs">
        <div>
          <span className="text-[#10201F]/60 font-medium">Modules: </span>
          <span className="text-[#10201F] font-semibold">
            {plan.includedModules.join(', ')}
          </span>
        </div>
        <div>
          <span className="text-[#10201F]/60 font-medium">Staff Limits: </span>
          <span className="text-[#10201F] font-semibold">
            {plan.usageLimits.staffAccounts === 'unlimited'
              ? 'Unlimited'
              : `${plan.usageLimits.staffAccounts} accounts`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#D9D3C0]">
        <Link
          to={`/admin/plans/${plan.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#D9D3C0] text-xs font-semibold text-[#10201F] hover:bg-[#F6F3EA]"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </Link>

        {canManage && (
          <>
            <Link
              to={`/admin/plans/${plan.id}/edit`}
              className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#D9D3C0] text-xs font-semibold text-[#0B5C63] hover:bg-[#0B5C63]/10"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>

            <button
              type="button"
              onClick={() => onToggleStatus(plan)}
              className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold ${
                isArchived
                  ? 'text-[#2C571D] hover:bg-[#2C571D]/10 border border-[#2C571D]/30'
                  : 'text-[#A9501A] hover:bg-[#A9501A]/10 border border-[#A9501A]/30'
              }`}
            >
              {isArchived ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Activate</span>
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
