/**
 * @file Standardized Pagination component for Platform Admin and Client Admin.
 * Displays page range summary, page size selector (10, 15, 20, 50),
 * numbered navigation with truncation ellipsis, and Previous/Next buttons.
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calculatePaginationRange } from '../../hooks/usePagination';

export interface PaginationProps {
  /** 1-based active page index. */
  currentPage: number;
  /** Active records count per page. */
  pageSize: number;
  /** Total matching records count. */
  totalRecords: number;
  /** Total calculated pages count. */
  totalPages: number;
  /** Callback invoked when the user selects a different page. */
  onPageChange: (page: number) => void;
  /** Optional callback invoked when the user changes records per page. */
  onPageSizeChange?: (pageSize: number) => void;
  /** Configurable page size options. Defaults to [10, 15, 20, 50]. */
  pageSizeOptions?: number[];
  /** Optional additional CSS classes. */
  className?: string;
}

/**
 * @description Standardized, responsive pagination bar matching Cadence design tokens.
 * @param {PaginationProps} props - Component properties.
 * @returns {React.ReactElement} Pagination control bar.
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={page}
 *   pageSize={pageSize}
 *   totalRecords={total}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  pageSize,
  totalRecords,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 20, 50],
  className = '',
}: PaginationProps): React.ReactElement {
  // Compute start and end record indices for display
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages || totalPages === 0;

  const pageNumbers = calculatePaginationRange(currentPage, totalPages);

  return (
    <div
      aria-label="Pagination Navigation"
      className={`bg-white border border-[#D9D3C0] rounded-2xl p-3 sm:p-4 shadow-xs font-sans flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-[#10201F] ${className}`}
    >
      {/* Left: Record Range Summary */}
      <div className="flex items-center gap-3">
        <span className="text-[#10201F]/70">
          {totalRecords === 0 ? (
            <span>0 records</span>
          ) : (
            <span>
              Showing <strong className="font-bold text-[#10201F]">{startRecord}–{endRecord}</strong> of{' '}
              <strong className="font-bold text-[#10201F]">{totalRecords}</strong> records
            </span>
          )}
        </span>

        {/* Page size dropdown */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-[#D9D3C0]">
            <label htmlFor="pagination-page-size" className="sr-only">
              Select records per page
            </label>
            <select
              id="pagination-page-size"
              aria-label="Select records per page"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2.5 py-1 bg-[#F6F3EA]/70 border border-[#D9D3C0] rounded-lg text-xs font-bold text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page navigation controls */}
      <nav aria-label="Page navigation" className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Previous page"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#D9D3C0] text-[#10201F] hover:bg-[#F6F3EA] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors flex items-center gap-1 font-semibold text-xs"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Numbered Page Buttons with Ellipses */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  aria-hidden="true"
                  className="px-2 py-1 text-xs text-[#10201F]/50 select-none"
                >
                  …
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={isActive ? 'page' : undefined}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-[#0B5C63] text-white shadow-2xs'
                    : 'text-[#10201F] hover:bg-[#F6F3EA] border border-transparent hover:border-[#D9D3C0]'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Next page"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#D9D3C0] text-[#10201F] hover:bg-[#F6F3EA] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors flex items-center gap-1 font-semibold text-xs"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
