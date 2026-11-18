/**
 * @file Confirmation modal for archiving or activating a Cadence platform subscription plan.
 */

import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import type { PlatformSubscriptionPlan } from '../../types';

export interface PlanStatusModalProps {
  /** Target plan entity, or null if modal is closed. */
  plan: PlatformSubscriptionPlan | null;
  /** Callback fired to close modal without changes. */
  onClose: () => void;
  /** Callback fired with confirmed plan and desired next status. */
  onConfirm: (plan: PlatformSubscriptionPlan, nextStatus: 'active' | 'archived') => void;
}

/**
 * @description Confirmation modal protecting against accidental plan activation or archiving.
 * @param {PlanStatusModalProps} props - Component properties.
 * @returns {React.ReactElement | null} Modal element or null when closed.
 */
export function PlanStatusModal({
  plan,
  onClose,
  onConfirm,
}: PlanStatusModalProps): React.ReactElement | null {
  if (!plan) return null;

  const isArchiving = plan.status === 'active';
  const nextStatus = isArchiving ? 'archived' : 'active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10201F]/50 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#D9D3C0] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div
            className={`p-3 rounded-xl ${
              isArchiving ? 'bg-[#A9501A]/10 text-[#A9501A]' : 'bg-[#2C571D]/10 text-[#2C571D]'
            }`}
          >
            {isArchiving ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-md text-[#10201F]/50 hover:text-[#10201F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#10201F]">
            {isArchiving ? 'Archive Subscription Plan?' : 'Activate Subscription Plan?'}
          </h3>
          <p className="text-sm text-[#10201F]/70 mt-1">
            {isArchiving
              ? `Archiving "${plan.name}" prevents new client businesses from selecting it. Existing subscribers retain their terms.`
              : `Activating "${plan.name}" makes it immediately visible and selectable for client business subscriptions.`}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F6F3EA] border border-[#D9D3C0] text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-[#10201F]/60">Plan Name:</span>
            <span className="font-bold text-[#10201F]">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#10201F]/60">Price / Cycle:</span>
            <span className="font-bold text-[#10201F]">
              ₦{plan.price.toLocaleString()} / {plan.billingPeriod}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#10201F]/60">Current Subscribers:</span>
            <span className="font-bold text-[#10201F]">{plan.subscribersCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-[#D9D3C0] text-sm font-semibold text-[#10201F]/80 hover:bg-[#F6F3EA] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(plan, nextStatus)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold text-white shadow-xs transition-colors ${
              isArchiving
                ? 'bg-[#A9501A] hover:bg-[#A9501A]/90'
                : 'bg-[#2C571D] hover:bg-[#2C571D]/90'
            }`}
          >
            {isArchiving ? 'Archive Plan' : 'Activate Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}
