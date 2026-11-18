/**
 * @file Filter and search control bar for the Platform Admin Subscription Plans directory.
 */

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { PlanFilterState } from '../../types';

export interface PlansFiltersBarProps {
  /** Current active filter parameters. */
  filters: PlanFilterState;
  /** Callback fired whenever any filter parameter changes. */
  onChange: (filters: PlanFilterState) => void;
  /** Callback to open mobile filter drawer. */
  onOpenMobileFilters?: () => void;
}

/**
 * @description Toolbar providing search by plan name, status, and billing period filtering.
 * @param {PlansFiltersBarProps} props - Component properties.
 * @returns {React.ReactElement} Filters toolbar element.
 */
export function PlansFiltersBar({
  filters,
  onChange,
  onOpenMobileFilters,
}: PlansFiltersBarProps): React.ReactElement {
  const isFiltered =
    filters.search.trim().length > 0 ||
    filters.status !== 'all' ||
    filters.billingPeriod !== 'all';

  const handleClear = () => {
    onChange({
      search: '',
      status: 'all',
      billingPeriod: 'all',
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-[#D9D3C0] bg-white shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10201F]/40" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search plans by name..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] placeholder:text-[#10201F]/40 focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:border-transparent"
        />
      </div>

      {/* Desktop Filter Selects */}
      <div className="hidden md:flex items-center gap-2.5">
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value as PlanFilterState['status'],
            })
          }
          aria-label="Filter by plan status"
          className="px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={filters.billingPeriod}
          onChange={(e) =>
            onChange({
              ...filters,
              billingPeriod: e.target.value as PlanFilterState['billingPeriod'],
            })
          }
          aria-label="Filter by billing period"
          className="px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        >
          <option value="all">All Billing Periods</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annual">Annual</option>
        </select>

        <button
          type="button"
          onClick={handleClear}
          disabled={!isFiltered}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[#D9D3C0] text-[#10201F]/70 hover:text-[#10201F] hover:bg-[#F6F3EA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>
      </div>

      {/* Mobile Filters Trigger */}
      <div className="flex md:hidden items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] hover:bg-[#F6F3EA]"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#0B5C63]" />
          <span>Filters</span>
          {isFiltered && (
            <span className="w-2 h-2 rounded-full bg-[#0B5C63]" />
          )}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={!isFiltered}
          className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#D9D3C0] text-[#10201F]/70 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
