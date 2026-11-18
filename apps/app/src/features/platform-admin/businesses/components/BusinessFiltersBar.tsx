/**
 * @file Search and multi-criteria filtering toolbar for Business Management.
 */

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { BusinessMobileFilters } from './BusinessMobileFilters';
import type { BusinessFilterState } from '../../types';

export interface BusinessFiltersBarProps {
  /** Current filter state values. */
  filters: BusinessFilterState;
  /** Callback fired when any filter value changes. */
  onChange: (filters: BusinessFilterState) => void;
  /** Callback to reset all filters to default state. */
  onClear: () => void;
  /** Total matching results count. */
  totalResults: number;
}

/**
 * @description Toolbar providing search by name/email/ID, status filter, plan filter, and registration date range.
 * @param {BusinessFiltersBarProps} props - Component properties.
 * @returns {React.ReactElement} Filtering toolbar element.
 * @example
 * ```tsx
 * <BusinessFiltersBar filters={filters} onChange={setFilters} onClear={handleClear} totalResults={12} />
 * ```
 */
export function BusinessFiltersBar({
  filters,
  onChange,
  onClear,
  totalResults,
}: BusinessFiltersBarProps): React.ReactElement {
  const isFiltered =
    Boolean(filters.search) ||
    filters.status !== 'all' ||
    filters.plan !== 'all' ||
    filters.dateRange !== 'all';

  return (
    <div className="bg-white border border-[#D9D3C0] rounded-2xl p-3 sm:p-4 shadow-xs space-y-3 font-sans">
      {/* Mobile Top Controls */}
      <BusinessMobileFilters filters={filters} onChange={onChange} />

      {/* Desktop Toolbar Grid (Hidden on Mobile) */}
      <div className="hidden md:grid md:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="relative md:col-span-5">
          <Search className="w-4 h-4 text-[#10201F]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by name, email, or ID..."
            aria-label="Search businesses"
            className="w-full pl-10 pr-4 py-2.5 bg-[#F6F3EA]/50 border border-[#D9D3C0] rounded-xl text-sm text-[#10201F] placeholder:text-[#10201F]/50 focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-2">
          <select
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as BusinessFilterState['status'],
              })
            }
            aria-label="Filter by account status"
            className="w-full px-3 py-2.5 bg-[#F6F3EA]/50 border border-[#D9D3C0] rounded-xl text-sm text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:border-transparent transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Plan Filter */}
        <div className="md:col-span-2">
          <select
            value={filters.plan}
            onChange={(e) =>
              onChange({
                ...filters,
                plan: e.target.value as BusinessFilterState['plan'],
              })
            }
            aria-label="Filter by subscription plan"
            className="w-full px-3 py-2.5 bg-[#F6F3EA]/50 border border-[#D9D3C0] rounded-xl text-sm text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:border-transparent transition-all"
          >
            <option value="all">All Plans</option>
            <option value="Starter">Starter</option>
            <option value="Growth">Growth</option>
            <option value="Business">Business</option>
          </select>
        </div>

        {/* Registration Date Filter */}
        <div className="md:col-span-2">
          <select
            value={filters.dateRange}
            onChange={(e) =>
              onChange({
                ...filters,
                dateRange: e.target.value as BusinessFilterState['dateRange'],
              })
            }
            aria-label="Filter by registration date range"
            className="w-full px-3 py-2.5 bg-[#F6F3EA]/50 border border-[#D9D3C0] rounded-xl text-sm text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:border-transparent transition-all"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Clear Filters Action */}
        <div className="md:col-span-1 flex justify-end">
          <button
            type="button"
            onClick={onClear}
            disabled={!isFiltered}
            aria-label="Clear Filters"
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors w-full justify-center ${
              isFiltered
                ? 'text-[#A9501A] bg-[#A9501A]/10 hover:bg-[#A9501A]/20 cursor-pointer'
                : 'text-[#10201F]/40 bg-[#F6F3EA] cursor-not-allowed opacity-60'
            }`}
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Clear Filters</span>
            <span className="xl:hidden">Clear</span>
          </button>
        </div>
      </div>

      {/* Results Counter Summary & Mobile Clear Action */}
      <div className="flex items-center justify-between text-xs text-[#10201F]/60 pt-1 border-t border-[#D9D3C0]/40">
        <span>Showing {totalResults} matching business{totalResults === 1 ? '' : 'es'}</span>
        <button
          type="button"
          onClick={onClear}
          disabled={!isFiltered}
          className={`text-xs font-semibold transition-colors ${
            isFiltered
              ? 'text-[#A9501A] hover:underline cursor-pointer'
              : 'text-[#10201F]/30 cursor-not-allowed'
          }`}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
