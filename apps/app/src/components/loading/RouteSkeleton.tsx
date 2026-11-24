/**
 * @file Top-level route loading skeleton components with dashboard, management, detail, and general variants.
 */

import React from 'react';

export type RouteSkeletonVariant = 'dashboard' | 'management' | 'detail' | 'general';

export interface RouteSkeletonProps {
  /** Skeleton layout pattern suited for the target view. Defaults to 'general'. */
  variant?: RouteSkeletonVariant;
  /** Optional custom class name applied to container. */
  className?: string;
}

/**
 * @description Accessible loading skeleton placeholders displayed during lazy route loading and route transitions.
 * @param {RouteSkeletonProps} props - Component properties.
 * @returns {React.ReactElement} Route loading skeleton element.
 * @example
 * ```tsx
 * <RouteSkeleton variant="dashboard" />
 * ```
 */
export function RouteSkeleton({
  variant = 'general',
  className = '',
}: RouteSkeletonProps): React.ReactElement {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading page content"
      data-skeleton-variant={variant}
      className={`w-full p-4 sm:p-6 lg:p-8 font-sans space-y-6 ${className}`}
    >
      <span className="sr-only">Loading page content...</span>

      {/* Render variant specific skeleton structure */}
      {variant === 'dashboard' && <DashboardSkeleton />}
      {variant === 'management' && <ManagementSkeleton />}
      {variant === 'detail' && <DetailSkeleton />}
      {variant === 'general' && <GeneralSkeleton />}
    </div>
  );
}

/**
 * @description Skeleton layout for dashboard screens (KPI stat cards, chart box, and table).
 */
function DashboardSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6 animate-pulse motion-reduce:animate-none">
      {/* Page Title & Subtitle skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 sm:w-64 bg-[#EFEBDB] rounded-lg" />
        <div className="h-4 w-72 sm:w-96 bg-[#EFEBDB]/70 rounded-md" />
      </div>

      {/* 4 Stats KPI Cards Grid */}
      <div
        data-testid="skeleton-kpi-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 bg-white rounded-2xl border border-[#D9D3C0] space-y-3 shadow-2xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-[#EFEBDB] rounded" />
              <div className="w-8 h-8 rounded-xl bg-[#EFEBDB]/80" />
            </div>
            <div className="h-8 w-32 bg-[#EFEBDB] rounded-lg" />
            <div className="h-3 w-20 bg-[#EFEBDB]/60 rounded" />
          </div>
        ))}
      </div>

      {/* Primary Analytics Chart Card */}
      <div
        data-testid="skeleton-chart"
        className="p-6 bg-white rounded-2xl border border-[#D9D3C0] space-y-4 shadow-2xs"
      >
        <div className="flex justify-between items-center">
          <div className="h-5 w-40 bg-[#EFEBDB] rounded" />
          <div className="h-8 w-28 bg-[#EFEBDB]/70 rounded-full" />
        </div>
        <div className="h-56 sm:h-64 w-full bg-[#EFEBDB]/40 rounded-xl border border-dashed border-[#D9D3C0]" />
      </div>

      {/* Recent Activity / Table Card */}
      <div
        data-testid="skeleton-table"
        className="p-6 bg-white rounded-2xl border border-[#D9D3C0] space-y-4 shadow-2xs"
      >
        <div className="h-5 w-48 bg-[#EFEBDB] rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="h-10 w-full bg-[#EFEBDB]/50 rounded-lg flex items-center px-4 gap-4">
              <div className="h-4 w-1/4 bg-[#EFEBDB] rounded" />
              <div className="h-4 w-1/4 bg-[#EFEBDB] rounded" />
              <div className="h-4 w-1/4 bg-[#EFEBDB] rounded" />
              <div className="h-4 w-1/4 bg-[#EFEBDB] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * @description Skeleton layout for management lists and directory pages (filter bar and table).
 */
function ManagementSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6 animate-pulse motion-reduce:animate-none">
      {/* Header with action button placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-[#EFEBDB] rounded-lg" />
          <div className="h-4 w-72 bg-[#EFEBDB]/70 rounded-md" />
        </div>
        <div className="h-10 w-36 bg-[#EFEBDB] rounded-full self-start sm:self-auto" />
      </div>

      {/* Filter and Search Bar */}
      <div
        data-testid="skeleton-filter-bar"
        className="p-4 bg-white rounded-2xl border border-[#D9D3C0] flex flex-col sm:flex-row gap-3 shadow-2xs"
      >
        <div className="h-10 flex-1 bg-[#EFEBDB]/60 rounded-xl" />
        <div className="h-10 w-32 bg-[#EFEBDB]/60 rounded-xl" />
        <div className="h-10 w-28 bg-[#EFEBDB]/60 rounded-xl" />
      </div>

      {/* Data Table */}
      <div
        data-testid="skeleton-table"
        className="p-6 bg-white rounded-2xl border border-[#D9D3C0] space-y-3 shadow-2xs"
      >
        <div className="h-10 w-full bg-[#EFEBDB]/70 rounded-lg" />
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="h-12 w-full bg-[#EFEBDB]/40 rounded-lg flex items-center px-4 gap-4">
            <div className="w-8 h-8 rounded-full bg-[#EFEBDB]" />
            <div className="h-4 flex-1 bg-[#EFEBDB] rounded" />
            <div className="h-4 w-28 bg-[#EFEBDB] rounded" />
            <div className="h-6 w-20 bg-[#EFEBDB] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * @description Skeleton layout for detail pages with multi-column information panels.
 */
function DetailSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6 animate-pulse motion-reduce:animate-none">
      {/* Header with back button breadcrumb */}
      <div className="space-y-2">
        <div className="h-4 w-32 bg-[#EFEBDB]/80 rounded" />
        <div className="h-8 w-64 bg-[#EFEBDB] rounded-lg" />
      </div>

      {/* Two Column Panels */}
      <div
        data-testid="skeleton-info-panels"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main information card */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-[#D9D3C0] space-y-5 shadow-2xs">
          <div className="h-5 w-40 bg-[#EFEBDB] rounded" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-[#EFEBDB]/60 rounded" />
            <div className="h-4 w-5/6 bg-[#EFEBDB]/60 rounded" />
            <div className="h-4 w-4/6 bg-[#EFEBDB]/60 rounded" />
          </div>
          <div
            data-testid="skeleton-content-section"
            className="pt-4 border-t border-[#D9D3C0]/60 space-y-3"
          >
            <div className="h-4 w-32 bg-[#EFEBDB] rounded" />
            <div className="h-28 w-full bg-[#EFEBDB]/30 rounded-xl" />
          </div>
        </div>

        {/* Sidebar metadata panel */}
        <div className="p-6 bg-white rounded-2xl border border-[#D9D3C0] space-y-4 shadow-2xs h-fit">
          <div className="h-5 w-32 bg-[#EFEBDB] rounded" />
          <div className="space-y-3">
            <div className="h-8 w-full bg-[#EFEBDB]/50 rounded-lg" />
            <div className="h-8 w-full bg-[#EFEBDB]/50 rounded-lg" />
            <div className="h-8 w-full bg-[#EFEBDB]/50 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @description Default general page skeleton with header and content placeholders.
 */
function GeneralSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6 animate-pulse motion-reduce:animate-none">
      {/* Header */}
      <div data-testid="skeleton-general-header" className="space-y-2">
        <div className="h-8 w-56 bg-[#EFEBDB] rounded-lg" />
        <div className="h-4 w-80 bg-[#EFEBDB]/70 rounded-md" />
      </div>

      {/* Content box */}
      <div
        data-testid="skeleton-general-body"
        className="p-8 bg-white rounded-2xl border border-[#D9D3C0] space-y-4 shadow-2xs"
      >
        <div className="h-5 w-44 bg-[#EFEBDB] rounded" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-[#EFEBDB]/60 rounded" />
          <div className="h-4 w-11/12 bg-[#EFEBDB]/60 rounded" />
          <div className="h-4 w-4/5 bg-[#EFEBDB]/60 rounded" />
        </div>
        <div className="h-40 w-full bg-[#EFEBDB]/30 rounded-xl" />
      </div>
    </div>
  );
}
