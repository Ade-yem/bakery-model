/**
 * @file Subscription distribution card showing Active, Pending, Expired, and Cancelled breakdowns.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '../permissions';
import { MOCK_SUBSCRIPTION_DISTRIBUTION } from '../mock-data';
import type { SubscriptionDistribution } from '../types';
import type { AuthenticatedActor } from '../../../components/layout/types';

export interface SubscriptionDistributionCardProps {
  /** Distribution counts. */
  distribution?: SubscriptionDistribution;
  /** Active administrator actor. */
  actor?: AuthenticatedActor;
}

/**
 * @description Displays the proportional distribution of tenant subscription statuses with operational color tokens.
 * @param {SubscriptionDistributionCardProps} props - Distribution data and actor.
 * @returns {React.ReactElement} Subscription distribution element.
 */
export function SubscriptionDistributionCard({
  distribution = MOCK_SUBSCRIPTION_DISTRIBUTION,
  actor,
}: SubscriptionDistributionCardProps): React.ReactElement {
  const total =
    distribution.active +
    distribution.pending +
    distribution.expired +
    distribution.cancelled || 1;

  const activePct = Math.round((distribution.active / total) * 100);
  const pendingPct = Math.round((distribution.pending / total) * 100);
  const expiredPct = Math.round((distribution.expired / total) * 100);
  const cancelledPct = 100 - activePct - pendingPct - expiredPct;

  const canViewSubscriptions = hasPlatformPermission(
    actor,
    PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW
  );

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-rule shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D0]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-verdigris/10 text-verdigris border border-verdigris/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-oven-black">
                Subscription Distribution
              </h2>
              <p className="text-xs text-oven-black/60">
                Portfolio distribution across billing statuses
              </p>
            </div>
          </div>

          {canViewSubscriptions && (
            <Link
              to="/admin/subscriptions"
              className="text-xs font-semibold text-verdigris hover:text-verdigris-lift inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Multi-segment Distribution Bar */}
        <div className="my-5">
          <div className="h-4 w-full rounded-full bg-flour overflow-hidden flex shadow-2xs border border-[#E5E0D0]">
            <div
              style={{ width: `${activePct}%` }}
              title={`Active: ${distribution.active} (${activePct}%)`}
              className="bg-[#2C571D] transition-all duration-300"
            />
            <div
              style={{ width: `${pendingPct}%` }}
              title={`Pending: ${distribution.pending} (${pendingPct}%)`}
              className="bg-[#0B5C63] transition-all duration-300"
            />
            <div
              style={{ width: `${expiredPct}%` }}
              title={`Expired: ${distribution.expired} (${expiredPct}%)`}
              className="bg-[#8A5A00] transition-all duration-300"
            />
            <div
              style={{ width: `${cancelledPct}%` }}
              title={`Cancelled: ${distribution.cancelled} (${cancelledPct}%)`}
              className="bg-[#8C1D18] transition-all duration-300"
            />
          </div>
        </div>

        {/* Status Breakdown Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-flour border border-rule flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2C571D]" />
              <span className="text-xs font-semibold text-oven-black/75">Active</span>
            </div>
            <span className="text-sm font-bold text-oven-black">
              {distribution.active} ({activePct}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-flour border border-rule flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B5C63]" />
              <span className="text-xs font-semibold text-oven-black/75">Pending</span>
            </div>
            <span className="text-sm font-bold text-oven-black">
              {distribution.pending} ({pendingPct}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-flour border border-rule flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8A5A00]" />
              <span className="text-xs font-semibold text-oven-black/75">Expired</span>
            </div>
            <span className="text-sm font-bold text-oven-black">
              {distribution.expired} ({expiredPct}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-flour border border-rule flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C1D18]" />
              <span className="text-xs font-semibold text-oven-black/75">Cancelled</span>
            </div>
            <span className="text-sm font-bold text-oven-black">
              {distribution.cancelled} ({cancelledPct}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
