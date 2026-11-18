/**
 * @file Data table presenting client business subscriptions with alternating row background colors and pagination.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, RefreshCw, CalendarPlus, XCircle } from 'lucide-react';
import type { PlatformSubscription } from '../../types';

export interface SubscriptionsTableProps {
  /** Filtered list of subscriptions. */
  subscriptions: PlatformSubscription[];
  /** Permission flags. */
  canManage: boolean;
  canExtend: boolean;
  canCancel: boolean;
  /** Action handlers. */
  onChangePlan?: (sub: PlatformSubscription) => void;
  onExtend?: (sub: PlatformSubscription) => void;
  onCancelSub?: (sub: PlatformSubscription) => void;
}

function getSubStatusBadge(status: PlatformSubscription['status']) {
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
}

function getPayStatusBadge(status: PlatformSubscription['paymentStatus']) {
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
}

/**
 * @description Subscriptions directory table with alternating row colors and permission-controlled mutations.
 * @param {SubscriptionsTableProps} props - Table properties.
 * @returns {React.ReactElement} Subscriptions table element.
 */
export function SubscriptionsTable({
  subscriptions,
  canManage,
  canExtend,
  canCancel,
  onChangePlan,
  onExtend,
  onCancelSub,
}: SubscriptionsTableProps): React.ReactElement {
  const [visibleCount, setVisibleCount] = useState<number>(10);

  const displayedSubs = subscriptions.slice(0, visibleCount);
  const hasMore = subscriptions.length > visibleCount;

  return (
    <div className="space-y-4 font-sans">
      <div className="overflow-x-auto rounded-xl border border-[#D9D3C0] shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#10201F] text-[#F6F3EA] text-xs font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Business Name</th>
              <th className="py-3.5 px-4">Subscription ID</th>
              <th className="py-3.5 px-4">Plan</th>
              <th className="py-3.5 px-4">Billing Period</th>
              <th className="py-3.5 px-4">Payment Status</th>
              <th className="py-3.5 px-4">Subscription Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C0]/60">
            {displayedSubs.map((sub) => (
              <tr
                key={sub.id}
                className="odd:bg-[#EFEBDB] even:bg-[#F6F3EA] hover:bg-[#FDFCF7] transition-colors"
              >
                {/* Business Name */}
                <td className="py-3.5 px-4 font-bold text-[#10201F]">
                  <Link
                    to={`/admin/subscriptions/${sub.id}`}
                    className="hover:text-[#0B5C63] transition-colors"
                  >
                    {sub.businessName}
                  </Link>
                </td>

                {/* Subscription ID */}
                <td className="py-3.5 px-4 font-mono text-xs text-[#0B5C63] font-semibold">
                  {sub.id}
                </td>

                {/* Plan */}
                <td className="py-3.5 px-4 font-medium text-[#10201F]">
                  {sub.planName}
                </td>

                {/* Billing Period */}
                <td className="py-3.5 px-4 capitalize text-[#10201F]/80">
                  {sub.billingPeriod}
                </td>

                {/* Payment Status (strictly independent) */}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getPayStatusBadge(
                      sub.paymentStatus
                    )}`}
                  >
                    {sub.paymentStatus}
                  </span>
                </td>

                {/* Subscription Status */}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getSubStatusBadge(
                      sub.status
                    )}`}
                  >
                    {sub.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/admin/subscriptions/${sub.id}`}
                      aria-label={`View Details for ${sub.id}`}
                      className="p-1.5 rounded-md text-[#10201F]/70 hover:text-[#0B5C63] hover:bg-white transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="sr-only">View Details</span>
                    </Link>

                    {canManage && (
                      <button
                        type="button"
                        onClick={() => onChangePlan?.(sub)}
                        aria-label="Change Plan"
                        className="sub-action-change-plan p-1.5 rounded-md text-[#0B5C63] hover:bg-[#0B5C63]/10 transition-colors"
                        title="Change Plan"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}

                    {canExtend && (
                      <button
                        type="button"
                        onClick={() => onExtend?.(sub)}
                        aria-label="Extend Subscription"
                        className="sub-action-extend p-1.5 rounded-md text-[#2C571D] hover:bg-[#2C571D]/10 transition-colors"
                        title="Extend Subscription"
                      >
                        <CalendarPlus className="w-4 h-4" />
                      </button>
                    )}

                    {canCancel && sub.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => onCancelSub?.(sub)}
                        aria-label="Cancel Subscription"
                        className="sub-action-cancel p-1.5 rounded-md text-[#A9501A] hover:bg-[#A9501A]/10 transition-colors"
                        title="Cancel Subscription"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination View More */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-5 py-2 text-xs font-bold rounded-lg border border-[#D9D3C0] bg-white text-[#10201F] hover:bg-[#F6F3EA] shadow-xs transition-colors"
          >
            View More ({subscriptions.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
