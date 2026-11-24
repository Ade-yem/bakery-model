/**
 * @file Modal dialog for confirming business account status changes (Activate / Suspend).
 */

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import type { PlatformBusiness } from '../../types';

export interface BusinessStatusModalProps {
  /** Target business account to modify. */
  business: PlatformBusiness | null;
  /** Requested target status. */
  targetStatus: 'active' | 'suspended' | null;
  /** Whether modal is currently open. */
  isOpen: boolean;
  /** Dismiss callback. */
  onClose: () => void;
  /** Confirm status change callback. */
  onConfirm: (businessId: string, newStatus: 'active' | 'suspended', reason: string) => void;
}

/**
 * @description Confirmation modal for activating or suspending a tenant business account.
 * @param {BusinessStatusModalProps} props - Modal properties.
 * @returns {React.ReactElement | null} Modal element or null when closed.
 * @example
 * ```tsx
 * <BusinessStatusModal isOpen={isOpen} business={selected} targetStatus="suspended" onClose={close} onConfirm={handleConfirm} />
 * ```
 */
export function BusinessStatusModal({
  business,
  targetStatus,
  isOpen,
  onClose,
  onConfirm,
}: BusinessStatusModalProps): React.ReactElement | null {
  const [reason, setReason] = useState('');

  if (!isOpen || !business || !targetStatus) {
    return null;
  }

  const isSuspending = targetStatus === 'suspended';

  const handleConfirm = () => {
    onConfirm(business.id, targetStatus, reason);
    setReason('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10201F]/60 backdrop-blur-xs font-sans animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#D9D3C0] shadow-xl p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isSuspending ? 'bg-[#8C1D18]/10 text-[#8C1D18]' : 'bg-[#2C571D]/10 text-[#2C571D]'
              }`}
            >
              {isSuspending ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 id="status-modal-title" className="text-lg font-bold text-[#10201F]">
                {isSuspending ? 'Suspend Business Account' : 'Activate Business Account'}
              </h3>
              <p className="text-xs text-[#10201F]/60 mt-0.5">
                {business.name} ({business.id})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-[#10201F]/50 hover:text-[#10201F] hover:bg-[#F6F3EA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning / Explanation Notice */}
        <div
          className={`p-3.5 rounded-xl text-xs leading-relaxed ${
            isSuspending
              ? 'bg-[#8C1D18]/10 text-[#8C1D18] border border-[#8C1D18]/20'
              : 'bg-[#2C571D]/10 text-[#2C571D] border border-[#2C571D]/20'
          }`}
        >
          {isSuspending ? (
            <p>
              Suspending this business will immediately revoke login access for all primary administrators
              and staff. Recorded offline mutations will pause sync until reactivation.
            </p>
          ) : (
            <p>
              Activating this business will restore tenant login capabilities and resume synchronization
              gateways for all registered retail and bakery branches.
            </p>
          )}
        </div>

        {/* Optional Reason / Note Input */}
        <div>
          <label htmlFor="status-reason" className="block text-xs font-semibold text-[#10201F] mb-1.5">
            Administrative Reason or Audit Note
          </label>
          <textarea
            id="status-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isSuspending
                ? 'e.g. Non-payment of subscription dues / KYC verification follow-up'
                : 'e.g. Identity and enterprise registration documents verified'
            }
            className="w-full p-3 bg-[#F6F3EA]/50 border border-[#D9D3C0] rounded-xl text-xs text-[#10201F] placeholder:text-[#10201F]/50 focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:border-transparent transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#D9D3C0] text-xs font-semibold text-[#10201F] hover:bg-[#F6F3EA] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer ${
              isSuspending
                ? 'bg-[#8C1D18] hover:bg-[#8C1D18]/90'
                : 'bg-[#2C571D] hover:bg-[#2C571D]/90'
            }`}
          >
            {isSuspending ? 'Confirm Suspension' : 'Confirm Activation'}
          </button>
        </div>
      </div>
    </div>
  );
}
