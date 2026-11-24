/**
 * @file Reusable server-side pagination hook and utility models for Cadence.
 * Provides array slicing helpers, boundary clamping, and page range calculators.
 */

import { useState, useCallback, useMemo } from 'react';

export interface PaginatedResult<T> {
  /** Array of items on the current page. */
  data: T[];
  /** 1-based active page index. */
  currentPage: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Total count of items matching the query across all pages. */
  totalRecords: number;
  /** Computed total number of pages. */
  totalPages: number;
}

export interface UsePaginationOptions {
  /** Initial 1-based page number. Defaults to 1. */
  initialPage?: number;
  /** Initial records per page. Defaults to 10. */
  initialPageSize?: number;
  /** Total number of records available. Defaults to 0. */
  totalRecords?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  setPage: (page: number) => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetPage: () => void;
  nextPage: () => void;
  prevPage: () => void;
  canNextPage: boolean;
  canPrevPage: boolean;
}

/**
 * @description Slices a dataset in-memory mimicking backend server-side pagination contracts.
 * @template T
 * @param {T[]} items - Complete dataset before pagination.
 * @param {number} page - Requested 1-based page index.
 * @param {number} pageSize - Number of records per page.
 * @returns {PaginatedResult<T>} Standardized paginated structure.
 * @example
 * ```ts
 * const result = paginateArray(staffList, page, pageSize);
 * ```
 */
export function paginateArray<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const safePageSize = Math.max(1, pageSize);
  const totalRecords = items.length;

  if (totalRecords === 0) {
    return {
      data: [],
      currentPage: 1,
      pageSize: safePageSize,
      totalRecords: 0,
      totalPages: 0,
    };
  }

  const totalPages = Math.ceil(totalRecords / safePageSize);
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (clampedPage - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, totalRecords);

  return {
    data: items.slice(startIndex, endIndex),
    currentPage: clampedPage,
    pageSize: safePageSize,
    totalRecords,
    totalPages,
  };
}

/**
 * @description Computes visible page numbers and ellipsis indicators for pagination UI controls.
 * @param {number} currentPage - Active 1-based page number.
 * @param {number} totalPages - Total available pages.
 * @returns {(number | '...')[]} Sequence of page numbers and ellipsis tokens.
 */
export function calculatePaginationRange(
  currentPage: number,
  totalPages: number
): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Near the start
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages];
  }

  // Near the end
  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // In the middle
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

/**
 * @description Manages pagination state with boundary clamping and reset capabilities.
 * @param {UsePaginationOptions} options - Initial settings.
 * @returns {UsePaginationReturn} State and controller methods.
 */
export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalRecords = 0,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);

  const totalPages = useMemo(() => {
    return totalRecords > 0 ? Math.ceil(totalRecords / pageSize) : 0;
  }, [totalRecords, pageSize]);

  const setPage = useCallback(
    (page: number) => {
      const maxPage = Math.max(1, totalPages);
      setCurrentPage(Math.min(Math.max(1, page), maxPage));
    },
    [totalPages]
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, Math.max(1, totalPages)));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalRecords,
    setPage,
    goToPage: setPage,
    setPageSize,
    resetPage,
    nextPage,
    prevPage,
    canNextPage: currentPage < totalPages,
    canPrevPage: currentPage > 1,
  };
}
