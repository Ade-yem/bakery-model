/**
 * @file Mobile search, horizontal status chips, and enterprise selector for Client Admin Accounts.
 */

import React, { useState } from 'react';
import { Search, Building2, ChevronDown } from 'lucide-react';
import type { ClientAdminFilterState } from '../../types';

export interface ClientAdminMobileFiltersProps {
  /** Current filter values. */
  filters: ClientAdminFilterState;
  /** Filter update callback. */
  onChange: (filters: ClientAdminFilterState) => void;
  /** Available businesses. */
  businesses: { id: string; name: string }[];
}

const STATUS_OPTIONS: Array<{ label: string; value: ClientAdminFilterState['status'] }> = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Suspended', value: 'suspended' },
];

/**
 * @description Mobile-optimized full-width search, horizontal status pills, and enterprise selector drawer.
 * @param {ClientAdminMobileFiltersProps} props - Component properties.
 * @returns {React.ReactElement} Mobile filters component.
 */
export function ClientAdminMobileFilters({
  filters,
  onChange,
  businesses,
}: ClientAdminMobileFiltersProps): React.ReactElement {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <div className="flex flex-col md:hidden gap-2.5">
      <div className="relative w-full">
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

      {/* Horizontally scrollable status chips for mobile */}
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
          aria-label="Toggle enterprise filter"
          className={`shrink-0 ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
            filters.businessId !== 'all'
              ? 'bg-[#0B5C63]/10 text-[#0B5C63] border-[#0B5C63]/30'
              : 'bg-white text-[#10201F]/70 border-[#D9D3C0]'
          }`}
        >
          <Building2 className="w-3 h-3" />
          <span>Business</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-150 ${
              mobileExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Linked Business selector */}
      {mobileExpanded && (
        <div className="pt-2 border-t border-[#E5E0D0] animate-fade-in">
          <label className="block text-[11px] font-semibold text-[#10201F]/60 mb-1">
            Filter by Enterprise
          </label>
          <select
            value={filters.businessId}
            onChange={(e) => onChange({ ...filters, businessId: e.target.value })}
            aria-label="Filter by linked business mobile"
            className="w-full px-3 py-2 bg-[#F6F3EA]/70 border border-[#D9D3C0] rounded-xl text-xs text-[#10201F]"
          >
            <option value="all">All Businesses</option>
            {businesses.map((biz) => (
              <option key={biz.id} value={biz.id}>
                {biz.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
