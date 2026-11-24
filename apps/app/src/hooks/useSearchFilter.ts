/**
 * @file Standardized search, filter, and sorting utilities for Platform Admin and Client Admin.
 * Handles debounced query inputs, multi-field searching, exact criteria filtering,
 * and column sorting (asc/desc) with automatic pagination reset triggers.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';

export interface FilterAndSortOptions<T> {
  /** Keyword search query string. */
  search?: string;
  /** Specific keys to match the search query against. If omitted, searches all string/number fields. */
  searchKeys?: (keyof T)[];
  /** Key-value dictionary of exact-match filters. */
  filters?: Partial<Record<keyof T, unknown>>;
  /** Active column key to sort by. */
  sortBy?: keyof T;
  /** Active sorting direction ('asc' or 'desc'). Defaults to 'asc'. */
  sortOrder?: 'asc' | 'desc';
}

export interface UseSearchFilterOptions<T> {
  initialSearch?: string;
  initialFilters?: Partial<Record<keyof T, unknown>>;
  initialSortBy?: keyof T;
  initialSortOrder?: 'asc' | 'desc';
  searchKeys?: (keyof T)[];
  debounceMs?: number;
  onFilterChange?: () => void;
}

export interface UseSearchFilterReturn<T> {
  search: string;
  debouncedSearch: string;
  setSearch: (value: string) => void;
  filters: Partial<Record<keyof T, unknown>>;
  setFilter: (key: keyof T, value: unknown) => void;
  clearFilters: () => void;
  sortBy: keyof T | undefined;
  sortOrder: 'asc' | 'desc';
  setSort: (key: keyof T) => void;
  isFiltered: boolean;
  filterAndSort: (items: T[]) => T[];
}

/**
 * @description Filters and sorts a typed dataset in-memory with backend-compatible parameters.
 * @template T
 * @param {T[]} items - Input list of records.
 * @param {FilterAndSortOptions<T>} options - Search, filter, and sorting options.
 * @returns {T[]} Filtered and sorted record array.
 * @example
 * ```ts
 * const filteredStaff = filterAndSortDataset(staff, {
 *   search: 'adeleke',
 *   searchKeys: ['name', 'email'],
 *   filters: { status: 'active' },
 *   sortBy: 'name',
 *   sortOrder: 'asc'
 * });
 * ```
 */
export function filterAndSortDataset<T>(
  items: T[],
  options: FilterAndSortOptions<T> = {}
): T[] {
  const { search = '', searchKeys, filters = {}, sortBy, sortOrder = 'asc' } = options;

  let result = [...items];

  // 1. Keyword search across specified or discoverable object fields
  const trimmedSearch = search.trim().toLowerCase();
  if (trimmedSearch) {
    result = result.filter((item) => {
      const keys =
        searchKeys ||
        (Object.keys(item as object) as (keyof T)[]).filter((k) => {
          const val = (item as Record<string, unknown>)[k as string];
          return typeof val === 'string' || typeof val === 'number';
        });

      return keys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(trimmedSearch);
      });
    });
  }

  // 2. Exact match filters
  const activeFilters = Object.entries(filters).filter(
    ([, val]) => val !== undefined && val !== '' && val !== 'all'
  );

  if (activeFilters.length > 0) {
    result = result.filter((item) => {
      return activeFilters.every(([key, filterValue]) => {
        const itemVal = (item as Record<string, unknown>)[key];
        return String(itemVal).toLowerCase() === String(filterValue).toLowerCase();
      });
    });
  }

  // 3. Sorting
  if (sortBy) {
    result.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB));
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  return result;
}

/**
 * @description Hook managing debounced search, multi-field filters, and column sorting.
 * @template T
 * @param {UseSearchFilterOptions<T>} options - Initial configuration.
 * @returns {UseSearchFilterReturn<T>} State, handlers, and processing methods.
 */
export function useSearchFilter<T>({
  initialSearch = '',
  initialFilters = {},
  initialSortBy,
  initialSortOrder = 'asc',
  searchKeys,
  debounceMs = 300,
  onFilterChange,
}: UseSearchFilterOptions<T> = {}): UseSearchFilterReturn<T> {
  const [search, setSearchState] = useState<string>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);
  const [filters, setFilters] = useState<Partial<Record<keyof T, unknown>>>(initialFilters);
  const [sortBy, setSortBy] = useState<keyof T | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (onFilterChange) onFilterChange();
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, debounceMs, onFilterChange]);

  const setSearch = useCallback((val: string) => {
    setSearchState(val);
  }, []);

  const setFilter = useCallback(
    (key: keyof T, value: unknown) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      if (onFilterChange) onFilterChange();
    },
    [onFilterChange]
  );

  const clearFilters = useCallback(() => {
    setSearchState('');
    setDebouncedSearch('');
    setFilters({});
    if (onFilterChange) onFilterChange();
  }, [onFilterChange]);

  const setSort = useCallback((key: keyof T) => {
    setSortBy((prevKey) => {
      if (prevKey === key) {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortOrder('asc');
      return key;
    });
  }, []);

  const isFiltered = useMemo(() => {
    const hasSearch = search.trim().length > 0;
    const hasActiveFilters = Object.values(filters).some(
      (v) => v !== undefined && v !== '' && v !== 'all'
    );
    return hasSearch || hasActiveFilters;
  }, [search, filters]);

  const filterAndSort = useCallback(
    (items: T[]) => {
      return filterAndSortDataset(items, {
        search: debouncedSearch,
        searchKeys,
        filters,
        sortBy,
        sortOrder,
      });
    },
    [debouncedSearch, searchKeys, filters, sortBy, sortOrder]
  );

  return {
    search,
    debouncedSearch,
    setSearch,
    filters,
    setFilter,
    clearFilters,
    sortBy,
    sortOrder,
    setSort,
    isFiltered,
    filterAndSort,
  };
}
