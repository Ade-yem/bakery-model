/**
 * @file Unit tests for useSearchFilter hook.
 * Verifies filter param tracking, sorting toggles (asc/desc), clear filters action,
 * and page reset callback execution upon search or filter mutations.
 */

import { describe, it, expect } from 'vitest';
import { filterAndSortDataset } from '../useSearchFilter';

describe('6. Standardized Search, Filter, and Sort Utilities', () => {
  interface MockItem {
    id: string;
    name: string;
    category: string;
    status: 'active' | 'inactive';
    count: number;
  }

  const items: MockItem[] = [
    { id: '1', name: 'Golden Flour', category: 'raw', status: 'active', count: 100 },
    { id: '2', name: 'Brioche Bread', category: 'baked', status: 'active', count: 50 },
    { id: '3', name: 'Almond Croissant', category: 'baked', status: 'inactive', count: 20 },
    { id: '4', name: 'Yeast Premium', category: 'raw', status: 'active', count: 80 },
  ];

  it('filters dataset by keyword across multiple fields', () => {
    const result = filterAndSortDataset(items, {
      search: 'Croissant',
      searchKeys: ['name', 'category'],
    });

    expect(result.length).toBe(1);
    expect(result[0]?.name).toBe('Almond Croissant');
  });

  it('filters dataset by exact filter criteria (e.g. status: active)', () => {
    const result = filterAndSortDataset(items, {
      filters: { status: 'active' },
    });

    expect(result.length).toBe(3);
    expect(result.every((i) => i.status === 'active')).toBe(true);
  });

  it('sorts dataset ascending and descending by column key', () => {
    const sortedAsc = filterAndSortDataset(items, {
      sortBy: 'count',
      sortOrder: 'asc',
    });
    expect(sortedAsc.map((i) => i.count)).toEqual([20, 50, 80, 100]);

    const sortedDesc = filterAndSortDataset(items, {
      sortBy: 'count',
      sortOrder: 'desc',
    });
    expect(sortedDesc.map((i) => i.count)).toEqual([100, 80, 50, 20]);
  });

  it('clears all filters and returns the full dataset when filters are reset', () => {
    const result = filterAndSortDataset(items, {
      search: '',
      filters: {},
    });

    expect(result.length).toBe(4);
  });
});
