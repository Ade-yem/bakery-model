/**
 * @file Multi-criteria search and filter toolbar for the Subscriptions directory table.
 */

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { SubscriptionFilterState } from '../../types';

export interface SubscriptionsFiltersBarProps {
  /** Active filter state. */
  filters: SubscriptionFilterState;
  /** Available plan names for the plan filter dropdown. */
  planNames: string[];
  /** Callback fired whenever filter changes. */
  onChange: (filters: SubscriptionFilterState) => void;
  /** Callback to open mobile filters sheet. */
  onOpenMobileFilters?: () => void;
}

/**
 * @description Toolbar providing search by business name or subscription ID and multi-criteria filters.
 * @param {SubscriptionsFiltersBarProps} props - Component properties.
 * @returns {React.ReactElement} Filter toolbar element.
 */
export function SubscriptionsFiltersBar({
  filters,
  planNames,
  onChange,
  onOpenMobileFilters,
}: SubscriptionsFiltersBarProps): React.ReactElement {
  const isFiltered =
    filters.search.trim().length > 0 ||
    filters.subscriptionStatus !== 'all' ||
    filters.paymentStatus !== 'all' ||
    filters.plan !== 'all';

  const handleClear = () => {
    onChange({
      search: '',
      subscriptionStatus: 'all',
      paymentStatus: 'all',
      plan: 'all',
      billingPeriod: 'all',
      dateRange: 'all',
    });
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-[#D9D3C0] bg-white shadow-xs font-sans">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10201F]/40" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by business name or subscription ID..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] placeholder:text-[#10201F]/40 focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        />
      </div>

      {/* Desktop Filter Dropdowns */}
      <div className="hidden lg:flex items-center gap-2">
        <select
          value={filters.subscriptionStatus}
          onChange={(e) =>
            onChange({
              ...filters,
              subscriptionStatus: e.target.value as SubscriptionFilterState['subscriptionStatus'],
            })
          }
          aria-label="Filter by subscription status"
          className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        >
          <option value="all">All Subscription Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filters.paymentStatus}
          onChange={(e) =>
            onChange({
              ...filters,
              paymentStatus: e.target.value as SubscriptionFilterState['paymentStatus'],
            })
          }
          aria-label="Filter by payment status"
          className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        >
          <option value="all">All Payment Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          value={filters.plan}
          onChange={(e) => onChange({ ...filters, plan: e.target.value })}
          aria-label="Filter by plan"
          className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        >
          <option value="all">All Plans</option>
          {planNames.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
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

      {/* Mobile Drawer Trigger */}
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
