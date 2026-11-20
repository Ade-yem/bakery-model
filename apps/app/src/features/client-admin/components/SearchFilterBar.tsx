/**
 * @file Unified search and status filter control bar.
 */

import React from 'react';
import { Search } from 'lucide-react';

export interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  statusOptions?: Array<{ label: string; value: string }>;
  children?: React.ReactNode;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  statusFilter,
  onStatusFilterChange,
  statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ],
  children,
}: SearchFilterBarProps): React.ReactElement {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#D9D3C0] shadow-2xs font-sans">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#10201F]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/50 text-xs sm:text-sm text-[#10201F] placeholder-[#10201F]/40 focus:outline-none focus:border-[#0B5C63] focus:bg-white transition-colors"
          />
        </div>

        {onStatusFilterChange && (
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            aria-label="Filter by status"
            className="px-3 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs sm:text-sm text-[#10201F] focus:outline-none focus:border-[#0B5C63] cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}
