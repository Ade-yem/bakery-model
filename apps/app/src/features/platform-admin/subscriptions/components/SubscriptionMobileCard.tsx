/**
 * @file Mobile responsive card representation of a single client business subscription.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, RefreshCw, CalendarPlus } from 'lucide-react';
import type { PlatformSubscription } from '../../types';

export interface SubscriptionMobileCardProps {
  /** Subscription entity. */
  subscription: PlatformSubscription;
  /** Whether the actor possesses manage/cancel/extend permissions. */
  canManage: boolean;
  canExtend: boolean;
  /** Action callbacks. */
  onChangePlan?: (sub: PlatformSubscription) => void;
  onExtend?: (sub: PlatformSubscription) => void;
}

/**
 * @description Stacked card view for subscription records on mobile viewports.
 * @param {SubscriptionMobileCardProps} props - Component properties.
 * @returns {React.ReactElement} Mobile subscription card element.
 */
export function SubscriptionMobileCard({
  subscription,
  canManage,
  canExtend,
  onChangePlan,
  onExtend,
}: SubscriptionMobileCardProps): React.ReactElement {
  const getSubStatusBadge = (status: PlatformSubscription['status']) => {
    switch (status) {
      case 'active':
        return 'bg-[#2C571D]/10 text-[#2C571D] border-[#2C571D]/20';
      case 'pending':
        return 'bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/20';
      case 'expired':
        return 'bg-[#A9501A]/10 text-[#A9501A] border-[#A9501A]/20';
      case 'cancelled':
      default:
        return 'bg-[#10201F]/10 text-[#10201F]/70 border-[#10201F]/20';
    }
  };

  const getPayStatusBadge = (status: PlatformSubscription['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-[#2C571D]/10 text-[#2C571D] border-[#2C571D]/20';
      case 'pending':
        return 'bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/20';
      case 'failed':
        return 'bg-[#A9501A]/10 text-[#A9501A] border-[#A9501A]/20';
      case 'refunded':
      default:
        return 'bg-[#0B5C63]/10 text-[#0B5C63] border-[#0B5C63]/20';
    }
  };

  return (
    <div className="subscription-mobile-card p-4 rounded-xl border border-[#D9D3C0] bg-white shadow-xs space-y-3 font-sans">
      {/* Header: Business & Sub ID */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-base font-bold text-[#10201F]">
            {subscription.businessName}
          </h4>
          <p className="text-xs font-mono text-[#0B5C63] mt-0.5">{subscription.id}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${getSubStatusBadge(
              subscription.status
            )}`}
          >
            {subscription.status}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPayStatusBadge(
              subscription.paymentStatus
            )}`}
          >
            {subscription.paymentStatus}
          </span>
        </div>
      </div>

      {/* Plan & Pricing */}
      <div className="flex items-center justify-between text-xs py-2 border-y border-[#D9D3C0]/60 bg-[#FDFCF7] -mx-4 px-4">
        <div>
          <span className="font-bold text-[#10201F]">{subscription.planName}</span>
          <span className="text-[#10201F]/60 ml-1 capitalize">
            ({subscription.billingPeriod})
          </span>
        </div>
        <div className="font-extrabold text-[#10201F]">
          ₦{subscription.price.toLocaleString()}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 text-xs text-[#10201F]/80">
        <div>
          <span className="text-[#10201F]/50 block text-[11px]">Start Date:</span>
          <span className="font-semibold">
            {new Date(subscription.startDate).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="text-[#10201F]/50 block text-[11px]">Expiry Date:</span>
          <span className="font-semibold">
            {new Date(subscription.expiryDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#D9D3C0]">
        <Link
          to={`/admin/subscriptions/${subscription.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#D9D3C0] text-xs font-semibold text-[#10201F] hover:bg-[#F6F3EA]"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </Link>

        {canManage && (
          <button
            type="button"
            onClick={() => onChangePlan?.(subscription)}
            aria-label="Change subscription plan"
            className="sub-action-change-plan inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#D9D3C0] text-xs font-semibold text-[#0B5C63] hover:bg-[#0B5C63]/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Plan</span>
          </button>
        )}

        {canExtend && (
          <button
            type="button"
            onClick={() => onExtend?.(subscription)}
            aria-label="Extend subscription period"
            className="sub-action-extend inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#D9D3C0] text-xs font-semibold text-[#2C571D] hover:bg-[#2C571D]/10"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Extend</span>
          </button>
        )}
      </div>
    </div>
  );
}
