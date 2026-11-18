/**
 * @file Mobile search, horizontal status chips, and collapsible filter sheet for Businesses.
 */

import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import type { BusinessFilterState } from '../../types';

export interface BusinessMobileFiltersProps {
  /** Filter state. */
  filters: BusinessFilterState;
  /** Filter change handler. */
  onChange: (filters: BusinessFilterState) => void;
}

const STATUS_OPTIONS: Array<{ label: string; value: BusinessFilterState['status'] }> = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Suspended', value: 'suspended' },
];

/**
 * @description Mobile-optimized full-width search, horizontal status pills, and collapsible filters drawer.
 * @param {BusinessMobileFiltersProps} props - Component properties.
 * @returns {React.ReactElement} Mobile filters element.
 */
export function BusinessMobileFilters({
  filters,
  onChange,
}: BusinessMobileFiltersProps): React.ReactElement {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <div className="flex flex-col md:hidden gap-2.5">
      <div className="relative w-full">
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

      {/* Horizontally scrollable status chips for mobile touch navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar -mx-1 px-1">
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = filters.status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...filters, status: opt.value })}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#0B5C63] text-white shadow-2xs'
                  : 'bg-[#F6F3EA] text-[#10201F]/70 hover:bg-[#EFEBDB]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setMobileExpanded((prev) => !prev)}
          aria-label="Toggle extra filters"
          className={`shrink-0 ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
            filters.plan !== 'all' || filters.dateRange !== 'all'
              ? 'bg-[#A9501A]/10 text-[#A9501A] border-[#A9501A]/30'
              : 'bg-white text-[#10201F]/70 border-[#D9D3C0]'
          }`}
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>More</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-150 ${
              mobileExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Expanded Drawer/Section for Plan & Date filters */}
      {mobileExpanded && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E0D0] animate-fade-in">
          <div>
            <label className="block text-[11px] font-semibold text-[#10201F]/60 mb-1">
              Plan Tier
            </label>
            <select
              value={filters.plan}
              onChange={(e) =>
                onChange({
                  ...filters,
                  plan: e.target.value as BusinessFilterState['plan'],
                })
              }
              aria-label="Filter by subscription plan mobile"
              className="w-full px-2.5 py-2 bg-[#F6F3EA]/70 border border-[#D9D3C0] rounded-xl text-xs text-[#10201F]"
            >
              <option value="all">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Growth">Growth</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#10201F]/60 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                onChange({
                  ...filters,
                  dateRange: e.target.value as BusinessFilterState['dateRange'],
                })
              }
              aria-label="Filter by registration date range mobile"
              className="w-full px-2.5 py-2 bg-[#F6F3EA]/70 border border-[#D9D3C0] rounded-xl text-xs text-[#10201F]"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
