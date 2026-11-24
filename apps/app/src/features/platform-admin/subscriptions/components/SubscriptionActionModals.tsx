/**
 * @file Modal dialogs for Subscription operations: Change Plan, Extend, and Cancel.
 */

import React, { useState } from 'react';
import { X, RefreshCw, CalendarPlus, AlertTriangle } from 'lucide-react';
import { MOCK_SUBSCRIPTION_PLANS } from '../../mock-plans';
import type { PlatformSubscription } from '../../types';

export interface SubscriptionActionModalsProps {
  /** Target subscription, or null if modals closed. */
  subscription: PlatformSubscription | null;
  /** Active modal type. */
  modalType: 'change_plan' | 'extend' | 'cancel' | null;
  /** Close callback. */
  onClose: () => void;
  /** Confirmation callbacks. */
  onConfirmChangePlan: (sub: PlatformSubscription, newPlanId: string) => void;
  onConfirmExtend: (sub: PlatformSubscription, days: number) => void;
  onConfirmCancel: (sub: PlatformSubscription, reason: string) => void;
}

/**
 * @description Dialogs handling plan migrations, validity extensions, and cancellations.
 * @param {SubscriptionActionModalsProps} props - Component properties.
 * @returns {React.ReactElement | null} Modal element or null when inactive.
 */
export function SubscriptionActionModals({
  subscription,
  modalType,
  onClose,
  onConfirmChangePlan,
  onConfirmExtend,
  onConfirmCancel,
}: SubscriptionActionModalsProps): React.ReactElement | null {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    subscription?.planId || MOCK_SUBSCRIPTION_PLANS[0].id
  );
  const [extendDays, setExtendDays] = useState<number>(30);
  const [cancelReason, setCancelReason] = useState<string>('Client request');

  if (!subscription || !modalType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10201F]/50 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#D9D3C0] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#D9D3C0] pb-3">
          <div className="flex items-center gap-2">
            {modalType === 'change_plan' && <RefreshCw className="w-5 h-5 text-[#0B5C63]" />}
            {modalType === 'extend' && <CalendarPlus className="w-5 h-5 text-[#2C571D]" />}
            {modalType === 'cancel' && <AlertTriangle className="w-5 h-5 text-[#A9501A]" />}
            <h3 className="text-base font-bold text-[#10201F]">
              {modalType === 'change_plan' && 'Change Subscription Plan'}
              {modalType === 'extend' && 'Extend Subscription Period'}
              {modalType === 'cancel' && 'Cancel Subscription'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-md text-[#10201F]/50 hover:text-[#10201F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#10201F]/70">
          Target Business: <strong className="text-[#10201F]">{subscription.businessName}</strong> ({subscription.id})
        </p>

        {/* Change Plan Form */}
        {modalType === 'change_plan' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#10201F]/80">Select New Plan</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F]"
            >
              {MOCK_SUBSCRIPTION_PLANS.filter((p) => p.status === 'active').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ₦{p.price.toLocaleString()} / {p.billingPeriod}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#10201F]/60">
              New plan terms, included modules, and limits take effect immediately upon confirmation.
            </p>
          </div>
        )}

        {/* Extend Subscription Form */}
        {modalType === 'extend' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#10201F]/80">Extension Duration</label>
            <select
              value={extendDays}
              onChange={(e) => setExtendDays(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F]"
            >
              <option value={14}>14 Days (Grace Period)</option>
              <option value={30}>30 Days (1 Month)</option>
              <option value={60}>60 Days (2 Months)</option>
              <option value={90}>90 Days (Quarterly)</option>
              <option value={365}>365 Days (1 Year)</option>
            </select>
            <p className="text-[11px] text-[#10201F]/60">
              The expiry date will be incremented by {extendDays} days without mutating past records.
            </p>
          </div>
        )}

        {/* Cancel Subscription Form */}
        {modalType === 'cancel' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#10201F]/80">Cancellation Reason</label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Provide reason for cancelling this subscription..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F]"
            />
            <p className="text-[11px] text-[#A9501A]">
              Warning: Cancelling revokes write privileges for the client business upon cycle expiration.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#D9D3C0]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-[#D9D3C0] text-xs font-semibold text-[#10201F]/80 hover:bg-[#F6F3EA]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              if (modalType === 'change_plan') onConfirmChangePlan(subscription, selectedPlanId);
              if (modalType === 'extend') onConfirmExtend(subscription, extendDays);
              if (modalType === 'cancel') onConfirmCancel(subscription, cancelReason);
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold text-white shadow-xs ${
              modalType === 'cancel'
                ? 'bg-[#A9501A] hover:bg-[#A9501A]/90'
                : 'bg-[#0B5C63] hover:bg-[#0B5C63]/90'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
