/**
 * @file Filter toolbar for Client Admin Accounts directory.
 */

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { ClientAdminMobileFilters } from './ClientAdminMobileFilters';
import type { ClientAdminFilterState } from '../../types';

export interface ClientAdminFiltersBarProps {
  /** Current filter values. */
  filters: ClientAdminFilterState;
  /** Callback on filter state change. */
  onChange: (filters: ClientAdminFilterState) => void;
  /** Callback to clear filters. */
  onClear: () => void;
  /** Available linked businesses for the dropdown. */
  businesses: { id: string; name: string }[];
  /** Total matching results. */
  totalResults: number;
}

/**
 * @description Toolbar providing search by admin name/email, linked business selection, and account status filter.
 * @param {ClientAdminFiltersBarProps} props - Component properties.
 * @returns {React.ReactElement} Filtering toolbar.
 * @example
 * ```tsx
 * <ClientAdminFiltersBar filters={filters} onChange={setFilters} onClear={handleClear} businesses={bizList} totalResults={8} />
 * ```
 */
export function ClientAdminFiltersBar({
  filters,
  onChange,
  onClear,
  businesses,
  totalResults,
}: ClientAdminFiltersBarProps): React.ReactElement {
  const isFiltered =
    Boolean(filters.search) ||
    filters.businessId !== 'all' ||
    filters.status !== 'all';

  return (
    <div className="bg-white border border-[#D9D3C0] rounded-2xl p-3 sm:p-4 shadow-xs space-y-3 font-sans">
      {/* Mobile Controls */}
      <ClientAdminMobileFilters
        filters={filters}
        onChange={onChange}
        businesses={businesses}
      />

      {/* Desktop Toolbar Grid (Hidden on Mobile) */}
      <div className="hidden md:grid md:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="relative md:col-span-5">
          <Search className="w-4 h-4 text-[#10201F]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by administrator name or email..."
            aria-label="Search client administrators"
            className="w-full pl-10 pr-4 py-2.5 bg-[#F6F3EA]/50 border border-[#D9D3C0] rounded-xl text-sm text-[#10201F] placeholder:text-[#10201F]/50 focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:border-transparent transition-all"
          />
        </div>

        {/* Linked Business Filter */}
        <div className="md:col-span-3">
          <select
            value={filters.businessId}
            onChange={(e) => onChange({ ...filters, businessId: e.target.value })}
            aria-label="Filter by linked business"
            className="w-full px-3 py-2.5 bg-[#F6F3EA]/50 border border-[#D9D3C0] rounded-xl text-sm text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:border-transparent transition-all"
          >
            <option value="all">All Businesses</option>
            {businesses.map((biz) => (
              <option key={biz.id} value={biz.id}>
                {biz.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account Status Filter */}
        <div className="md:col-span-3">
          <select
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as ClientAdminFilterState['status'],
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

        {/* Clear Action */}
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

      {/* Summary Counter & Mobile Clear Action */}
      <div className="flex items-center justify-between text-xs text-[#10201F]/60 pt-1 border-t border-[#D9D3C0]/40">
        <span>Showing {totalResults} administrator account{totalResults === 1 ? '' : 's'}</span>
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
