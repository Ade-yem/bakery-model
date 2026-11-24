/**
 * @file Mobile responsive slide-over drawer for filtering subscription plans.
 */

import React from 'react';
import { X } from 'lucide-react';
import type { PlanFilterState } from '../../types';

export interface PlanMobileFiltersProps {
  /** Visibility state of mobile filter drawer. */
  isOpen: boolean;
  /** Callback fired to close filter drawer. */
  onClose: () => void;
  /** Current filter parameter state. */
  filters: PlanFilterState;
  /** Callback to update filter values. */
  onChange: (filters: PlanFilterState) => void;
  /** Reset all filters. */
  onReset: () => void;
}

/**
 * @description Drawer sheet providing mobile touch-friendly plan filtering controls.
 * @param {PlanMobileFiltersProps} props - Component props.
 * @returns {React.ReactElement | null} Drawer element or null if closed.
 */
export function PlanMobileFilters({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
}: PlanMobileFiltersProps): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#10201F]/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-[#D9D3C0] shadow-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#D9D3C0] pb-3">
          <h3 className="text-base font-bold text-[#10201F]">Filter Plans</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1 rounded-md text-[#10201F]/60 hover:text-[#10201F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#10201F]/70 uppercase tracking-wider">
            Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['all', 'active', 'archived'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onChange({ ...filters, status: st })}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                  filters.status === st
                    ? 'bg-[#0B5C63] text-white border-[#0B5C63]'
                    : 'bg-[#FDFCF7] text-[#10201F] border-[#D9D3C0]'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Billing Period Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#10201F]/70 uppercase tracking-wider">
            Billing Period
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['all', 'monthly', 'quarterly', 'annual'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => onChange({ ...filters, billingPeriod: period })}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                  filters.billingPeriod === period
                    ? 'bg-[#0B5C63] text-white border-[#0B5C63]'
                    : 'bg-[#FDFCF7] text-[#10201F] border-[#D9D3C0]'
                }`}
              >
                {period === 'all' ? 'All Periods' : period}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
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
