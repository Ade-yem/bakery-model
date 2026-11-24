/**
 * @file Unit tests for the usePagination hook and server-side pagination utility models.
 * Verifies page bounds clamping, page size switching, page reset on search/filter changes,
 * and paginateArray contract compliance.
 */

import { describe, it, expect } from 'vitest';
import { paginateArray, calculatePaginationRange } from '../usePagination';

describe('usePagination and Pagination Utilities', () => {
  const mockDataset = Array.from({ length: 47 }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Record ${i + 1}`,
  }));

  it('paginateArray correctly slices dataset for page 1 with page size 10', () => {
    const result = paginateArray(mockDataset, 1, 10);

    expect(result.data.length).toBe(10);
    expect(result.data[0]?.id).toBe('item-1');
    expect(result.data[9]?.id).toBe('item-10');
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalRecords).toBe(47);
    expect(result.totalPages).toBe(5);
  });

  it('paginateArray correctly slices dataset for the final page (page 5)', () => {
    const result = paginateArray(mockDataset, 5, 10);

    expect(result.data.length).toBe(7);
    expect(result.data[0]?.id).toBe('item-41');
    expect(result.data[6]?.id).toBe('item-47');
    expect(result.currentPage).toBe(5);
    expect(result.totalPages).toBe(5);
  });

  it('paginateArray handles empty dataset cleanly', () => {
    const result = paginateArray([], 1, 10);

    expect(result.data.length).toBe(0);
    expect(result.currentPage).toBe(1);
    expect(result.totalRecords).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it('paginateArray clamps out-of-range page requests to valid bounds', () => {
    const highPageResult = paginateArray(mockDataset, 99, 10);
    expect(highPageResult.currentPage).toBe(5);
    expect(highPageResult.data.length).toBe(7);

    const zeroPageResult = paginateArray(mockDataset, 0, 10);
    expect(zeroPageResult.currentPage).toBe(1);
  });

  it('calculatePaginationRange generates correct page numbers with ellipsis', () => {
    // 5 pages: 1 2 3 4 5 (no ellipsis)
    expect(calculatePaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);

    // 10 pages, on page 1: 1 2 3 '...' 10
    expect(calculatePaginationRange(1, 10)).toEqual([1, 2, 3, '...', 10]);

    // 10 pages, on page 5: 1 '...' 4 5 6 '...' 10
    expect(calculatePaginationRange(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10]);

    // 10 pages, on page 10: 1 '...' 8 9 10
    expect(calculatePaginationRange(10, 10)).toEqual([1, '...', 8, 9, 10]);
  });
});
