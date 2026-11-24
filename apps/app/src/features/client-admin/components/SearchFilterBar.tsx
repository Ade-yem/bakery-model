/**
 * @file Unified search and filter toolbar adopting Platform Admin styling standards.
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
  searchPlaceholder = 'Search records by keyword, name, or code...',
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
    <div className="bg-white border border-[#D9D3C0] rounded-2xl p-3 sm:p-4 shadow-xs font-sans flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-[#10201F]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search records"
          className="w-full pl-10 pr-4 py-2.5 bg-[#F6F3EA]/50 border border-[#D9D3C0] rounded-xl text-sm text-[#10201F] placeholder:text-[#10201F]/50 focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:border-transparent transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {onStatusFilterChange && (
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            aria-label="Filter by status"
            className="px-3.5 py-2.5 bg-[#F6F3EA]/50 border border-[#D9D3C0] rounded-xl text-sm text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:border-transparent transition-all cursor-pointer font-medium"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {children}
      </div>
    </div>
  );
}
