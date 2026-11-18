/**
 * @file Filter toolbar for searching and categorizing platform audit log records.
 */

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { AuditFilterState } from '../../types';

export interface AuditFiltersBarProps {
  /** Active filter state. */
  filters: AuditFilterState;
  /** Unique module names. */
  modules: string[];
  /** Callback fired whenever any filter changes. */
  onChange: (filters: AuditFilterState) => void;
  /** Mobile filter drawer trigger. */
  onOpenMobileFilters?: () => void;
}

/**
 * @description Search and multi-criteria filters bar for the Platform Audit and Activity view.
 * @param {AuditFiltersBarProps} props - Component properties.
 * @returns {React.ReactElement} Filters toolbar element.
 */
export function AuditFiltersBar({
  filters,
  modules,
  onChange,
  onOpenMobileFilters,
}: AuditFiltersBarProps): React.ReactElement {
  const isFiltered =
    filters.search.trim().length > 0 ||
    filters.module !== 'all' ||
    filters.actionType !== 'all' ||
    filters.status !== 'all' ||
    filters.dateRange !== 'all';

  const handleClear = () => {
    onChange({
      search: '',
      module: 'all',
      actionType: 'all',
      administrator: 'all',
      dateRange: 'all',
      status: 'all',
    });
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-[#D9D3C0] bg-white shadow-xs font-sans">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10201F]/40" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by administrator, description, or activity ID..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] placeholder:text-[#10201F]/40 focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        />
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Module Filter */}
        <select
          value={filters.module}
          onChange={(e) => onChange({ ...filters, module: e.target.value })}
          aria-label="Filter by module"
          className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        >
          <option value="all">All Modules</option>
          {modules.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Action Type Filter */}
        <select
          value={filters.actionType}
          onChange={(e) => onChange({ ...filters, actionType: e.target.value })}
          aria-label="Filter by action"
          className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        >
          <option value="all">All Actions</option>
          <option value="business_activated">Business Activated</option>
          <option value="business_suspended">Business Suspended</option>
          <option value="plan_created">Plan Created</option>
          <option value="plan_updated">Plan Updated</option>
          <option value="plan_archived">Plan Archived</option>
          <option value="subscription_extended">Subscription Extended</option>
          <option value="subscription_cancelled">Subscription Cancelled</option>
          <option value="subscription_plan_changed">Subscription Plan Changed</option>
          <option value="settings_updated">Settings Updated</option>
          <option value="client_admin_status_changed">Client Admin Changed</option>
          <option value="security_event">Security Event</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value as AuditFilterState['status'],
            })
          }
          aria-label="Filter by status"
          className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        >
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="failure">Failure</option>
        </select>

        {/* Clear Filters Button */}
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

      {/* Mobile Trigger */}
      <div className="flex lg:hidden items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F]"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#0B5C63]" />
          <span>Filters</span>
          {isFiltered && <span className="w-2 h-2 rounded-full bg-[#0B5C63]" />}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={!isFiltered}
          className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#D9D3C0] text-[#10201F]/70 disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
