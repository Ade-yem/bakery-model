/**
 * @file Mobile drawer for filtering subscriptions by status, payment, and plan.
 */

import React from 'react';
import { X } from 'lucide-react';
import type { SubscriptionFilterState } from '../../types';

export interface SubscriptionMobileFiltersProps {
  /** Modal open status. */
  isOpen: boolean;
  /** Modal close callback. */
  onClose: () => void;
  /** Active filter state. */
  filters: SubscriptionFilterState;
  /** Available plan names. */
  planNames: string[];
  /** Filter update callback. */
  onChange: (filters: SubscriptionFilterState) => void;
  /** Reset callback. */
  onReset: () => void;
}

/**
 * @description Mobile filter sheet for subscriptions directory.
 * @param {SubscriptionMobileFiltersProps} props - Component properties.
 * @returns {React.ReactElement | null} Sheet element.
 */
export function SubscriptionMobileFilters({
  isOpen,
  onClose,
  filters,
  planNames,
  onChange,
  onReset,
}: SubscriptionMobileFiltersProps): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#10201F]/50 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-[#D9D3C0] shadow-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#D9D3C0] pb-3">
          <h3 className="text-base font-bold text-[#10201F]">Filter Subscriptions</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1 rounded-md text-[#10201F]/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subscription Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#10201F]/70 uppercase tracking-wider">
            Subscription Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['all', 'active', 'pending', 'expired', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onChange({ ...filters, subscriptionStatus: st })}
                className={`py-2 px-2.5 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                  filters.subscriptionStatus === st
                    ? 'bg-[#0B5C63] text-white border-[#0B5C63]'
                    : 'bg-[#FDFCF7] text-[#10201F] border-[#D9D3C0]'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#10201F]/70 uppercase tracking-wider">
            Payment Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['all', 'paid', 'pending', 'failed', 'refunded'] as const).map((ps) => (
              <button
                key={ps}
                type="button"
                onClick={() => onChange({ ...filters, paymentStatus: ps })}
                className={`py-2 px-2.5 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                  filters.paymentStatus === ps
                    ? 'bg-[#0B5C63] text-white border-[#0B5C63]'
                    : 'bg-[#FDFCF7] text-[#10201F] border-[#D9D3C0]'
                }`}
              >
                {ps === 'all' ? 'All' : ps}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#10201F]/70 uppercase tracking-wider">
            Subscription Plan
          </label>
          <select
            value={filters.plan}
            onChange={(e) => onChange({ ...filters, plan: e.target.value })}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F]"
          >
            <option value="all">All Plans</option>
            {planNames.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#D9D3C0]">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 py-2.5 px-4 text-xs font-bold rounded-lg border border-[#D9D3C0] text-[#10201F]/80 hover:bg-[#F6F3EA]"
          >
            Reset Filters
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 text-xs font-bold rounded-lg bg-[#0B5C63] text-white hover:bg-[#0B5C63]/90 shadow-xs"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
