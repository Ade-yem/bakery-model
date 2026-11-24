/**
 * @file Standardized reusable Skeleton loading placeholders matching Cadence design tokens.
 * Provides structural skeletons for cards, tables, lists, forms, profiles, details, and charts.
 * Complies with reduced-motion preferences (motion-reduce:animate-none) and accessibility requirements.
 */

import React from 'react';

export interface BaseSkeletonProps {
  /** Optional custom CSS classes. */
  className?: string;
}

export interface SkeletonCardProps extends BaseSkeletonProps {
  /** Number of cards to render in a responsive grid. Defaults to 1. */
  count?: number;
}

export interface SkeletonTableProps extends BaseSkeletonProps {
  /** Number of body rows to display. Defaults to 5. */
  rows?: number;
  /** Number of table columns. Defaults to 4. */
  columns?: number;
  /** Whether to show a search/filter bar skeleton above the table. Defaults to true. */
  hasToolbar?: boolean;
}

export interface SkeletonListProps extends BaseSkeletonProps {
  /** Number of list items. Defaults to 5. */
  items?: number;
  /** Whether items include an avatar placeholder. Defaults to false. */
  hasAvatar?: boolean;
}

export interface SkeletonFormProps extends BaseSkeletonProps {
  /** Number of form input field rows. Defaults to 4. */
  fields?: number;
  /** Whether to render a submit button placeholder. Defaults to true. */
  hasButton?: boolean;
}

export interface SkeletonChartProps extends BaseSkeletonProps {
  /** Height in pixels of chart canvas placeholder. Defaults to 260. */
  height?: number;
}

/**
 * @description Accessible loading placeholder for KPI stats cards and summary widgets.
 * @param {SkeletonCardProps} props - Configuration.
 * @returns {React.ReactElement} Card skeleton element.
 */
export function SkeletonCard({
  count = 1,
  className = '',
}: SkeletonCardProps): React.ReactElement {
  const cards = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading card content"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      <span className="sr-only">Loading card content...</span>
      {cards.map((idx) => (
        <div
          key={idx}
          data-skeleton="card"
          className="p-5 bg-white rounded-2xl border border-[#D9D3C0] space-y-3.5 shadow-2xs animate-pulse motion-reduce:animate-none font-sans"
        >
          <div className="flex justify-between items-center">
            <div className="h-3.5 w-24 bg-[#EFEBDB] rounded-md" />
            <div className="w-9 h-9 rounded-xl bg-[#EFEBDB]/70" />
          </div>
          <div className="h-8 w-28 bg-[#EFEBDB] rounded-lg" />
          <div className="h-3 w-36 bg-[#EFEBDB]/60 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * @description Loading placeholder for tabular data, matching column and row dimensions.
 * @param {SkeletonTableProps} props - Table configuration.
 * @returns {React.ReactElement} Table skeleton element.
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  hasToolbar = true,
  className = '',
}: SkeletonTableProps): React.ReactElement {
  const rowList = Array.from({ length: rows }, (_, i) => i);
  const colList = Array.from({ length: columns }, (_, i) => i);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading table data"
      data-skeleton="table"
      className={`space-y-4 font-sans animate-pulse motion-reduce:animate-none ${className}`}
    >
      <span className="sr-only">Loading table data...</span>

      {/* Toolbar skeleton */}
      {hasToolbar && (
        <div className="bg-white border border-[#D9D3C0] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="h-10 w-full max-w-sm bg-[#EFEBDB]/60 rounded-xl" />
          <div className="h-10 w-32 bg-[#EFEBDB]/60 rounded-xl shrink-0" />
        </div>
      )}

      {/* Table container */}
      <div className="bg-white border border-[#D9D3C0] rounded-2xl overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="bg-[#EFEBDB]/40 border-b border-[#D9D3C0] px-4 py-3.5 flex items-center gap-4">
          {colList.map((col) => (
            <div
              key={col}
              data-skeleton-col
              className="h-3.5 bg-[#EFEBDB] rounded flex-1"
            />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[#D9D3C0]/40">
          {rowList.map((row) => (
            <div
              key={row}
              data-skeleton-row
              className="px-4 py-3.5 flex items-center gap-4"
            >
              {colList.map((col) => (
                <div
                  key={col}
                  className="h-4 bg-[#EFEBDB]/60 rounded flex-1"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * @description Loading placeholder for vertical activity feeds, lists, or timeline items.
 * @param {SkeletonListProps} props - Configuration.
 * @returns {React.ReactElement} List skeleton element.
 */
export function SkeletonList({
  items = 5,
  hasAvatar = false,
  className = '',
}: SkeletonListProps): React.ReactElement {
  const listItems = Array.from({ length: items }, (_, i) => i);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading list items"
      data-skeleton="list"
      className={`bg-white border border-[#D9D3C0] rounded-2xl p-5 shadow-xs space-y-4 font-sans animate-pulse motion-reduce:animate-none ${className}`}
    >
      <span className="sr-only">Loading list items...</span>
      {listItems.map((idx) => (
        <div
          key={idx}
          data-skeleton-item
          className="flex items-center gap-3.5 pb-3 border-b border-[#D9D3C0]/40 last:border-b-0 last:pb-0"
        >
          {hasAvatar && (
            <div
              data-skeleton-avatar
              className="w-10 h-10 rounded-xl bg-[#EFEBDB] shrink-0"
            />
          )}
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-40 bg-[#EFEBDB] rounded" />
            <div className="h-3 w-56 bg-[#EFEBDB]/60 rounded" />
          </div>
          <div className="h-3.5 w-16 bg-[#EFEBDB]/50 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * @description Loading placeholder for form inputs, textareas, and submission controls.
 * @param {SkeletonFormProps} props - Configuration.
 * @returns {React.ReactElement} Form skeleton element.
 */
export function SkeletonForm({
  fields = 4,
  hasButton = true,
  className = '',
}: SkeletonFormProps): React.ReactElement {
  const fieldList = Array.from({ length: fields }, (_, i) => i);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading form"
      data-skeleton="form"
      className={`space-y-5 font-sans animate-pulse motion-reduce:animate-none ${className}`}
    >
      <span className="sr-only">Loading form fields...</span>
      {fieldList.map((idx) => (
        <div key={idx} data-skeleton-field className="space-y-1.5">
          <div className="h-3.5 w-28 bg-[#EFEBDB] rounded" />
          <div className="h-10 w-full bg-[#EFEBDB]/50 rounded-xl border border-[#D9D3C0]/60" />
        </div>
      ))}

      {hasButton && (
        <div data-skeleton-submit className="pt-2 flex justify-end gap-2.5">
          <div className="h-10 w-24 bg-[#EFEBDB]/60 rounded-full" />
          <div className="h-10 w-32 bg-[#EFEBDB] rounded-full" />
        </div>
      )}
    </div>
  );
}

/**
 * @description Loading placeholder for business and staff user profile screens.
 * @param {BaseSkeletonProps} props - Configuration.
 * @returns {React.ReactElement} Profile skeleton element.
 */
export function SkeletonProfile({ className = '' }: BaseSkeletonProps): React.ReactElement {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading profile"
      data-skeleton="profile"
      className={`space-y-6 font-sans animate-pulse motion-reduce:animate-none ${className}`}
    >
      <span className="sr-only">Loading profile...</span>

      {/* Header & Avatar card */}
      <div className="bg-white border border-[#D9D3C0] rounded-3xl p-6 shadow-xs flex items-center gap-5">
        <div
          data-skeleton-profile-avatar
          className="w-20 h-20 rounded-2xl bg-[#EFEBDB] shrink-0"
        />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-48 bg-[#EFEBDB] rounded-lg" />
          <div className="h-4 w-32 bg-[#EFEBDB]/70 rounded" />
        </div>
      </div>

      {/* Metadata grid */}
      <div
        data-skeleton-profile-fields
        className="bg-white border border-[#D9D3C0] rounded-3xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-20 bg-[#EFEBDB]/70 rounded" />
            <div className="h-5 w-48 bg-[#EFEBDB] rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * @description Loading placeholder for deep entity detail screens with breadcrumbs and tabs.
 * @param {BaseSkeletonProps} props - Configuration.
 * @returns {React.ReactElement} Detail skeleton element.
 */
export function SkeletonDetail({ className = '' }: BaseSkeletonProps): React.ReactElement {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading detail view"
      data-skeleton="detail"
      className={`space-y-6 font-sans animate-pulse motion-reduce:animate-none ${className}`}
    >
      <span className="sr-only">Loading detail content...</span>

      {/* Breadcrumb & Header */}
      <div data-skeleton-detail-header className="space-y-3">
        <div className="h-3.5 w-36 bg-[#EFEBDB] rounded" />
        <div className="flex justify-between items-center">
          <div className="h-7 w-60 bg-[#EFEBDB] rounded-lg" />
          <div className="h-9 w-28 bg-[#EFEBDB] rounded-full" />
        </div>
      </div>

      {/* Detail Content Boxes */}
      <div data-skeleton-detail-content className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#D9D3C0] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="h-5 w-40 bg-[#EFEBDB] rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-[#EFEBDB]/60 rounded" />
            <div className="h-4 w-5/6 bg-[#EFEBDB]/60 rounded" />
          </div>
        </div>
        <div className="bg-white border border-[#D9D3C0] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="h-5 w-28 bg-[#EFEBDB] rounded" />
          <div className="h-10 w-full bg-[#EFEBDB]/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * @description Loading placeholder for operational and analytical charts.
 * @param {SkeletonChartProps} props - Configuration.
 * @returns {React.ReactElement} Chart skeleton element.
 */
export function SkeletonChart({
  height = 260,
  className = '',
}: SkeletonChartProps): React.ReactElement {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading chart"
      data-skeleton="chart"
      className={`bg-white border border-[#D9D3C0] rounded-2xl p-6 shadow-xs space-y-4 font-sans animate-pulse motion-reduce:animate-none ${className}`}
    >
      <span className="sr-only">Loading chart data...</span>
      <div className="flex justify-between items-center">
        <div className="h-5 w-40 bg-[#EFEBDB] rounded" />
        <div className="h-7 w-24 bg-[#EFEBDB]/70 rounded-full" />
      </div>
      <div
        style={{ height: `${height}px` }}
        className="w-full bg-[#EFEBDB]/30 rounded-xl border border-dashed border-[#D9D3C0] flex items-end justify-between p-6 gap-3"
      >
        {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className="w-full bg-[#EFEBDB]/60 rounded-t-md"
          />
        ))}
      </div>
    </div>
  );
}
