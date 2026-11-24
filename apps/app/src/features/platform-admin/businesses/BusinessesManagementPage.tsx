/**
 * @file Businesses Management master page for Cadence Platform Admin.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { AdminPageHeader } from '../AdminPageHeader';
import { BusinessOverviewCards } from './components/BusinessOverviewCards';
import { BusinessFiltersBar } from './components/BusinessFiltersBar';
import { BusinessTable } from './components/BusinessTable';
import { BusinessStatusModal } from './components/BusinessStatusModal';
import { Pagination } from '../../../components/shared';
import { usePagination, paginateArray } from '../../../hooks/usePagination';
import { MOCK_PLATFORM_BUSINESSES } from '../mock-businesses';
import { PLATFORM_PERMISSIONS, hasPlatformPermission } from '../permissions';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { BusinessFilterState, PlatformBusiness } from '../types';

export interface BusinessesManagementPageProps {
  /** Authenticated administrator. */
  actor?: AuthenticatedActor;
}

const INITIAL_FILTERS: BusinessFilterState = {
  search: '',
  status: 'all',
  plan: 'all',
  dateRange: 'all',
};

/**
 * @description Renders the Businesses Management page with metrics, filters, data table, and status modal.
 * @param {BusinessesManagementPageProps} props - Component properties.
 * @returns {React.ReactElement} Businesses management page.
 * @example
 * ```tsx
 * <BusinessesManagementPage actor={actor} />
 * ```
 */
export function BusinessesManagementPage({
  actor,
}: BusinessesManagementPageProps): React.ReactElement {
  const [businesses, setBusinesses] = useState<PlatformBusiness[]>(MOCK_PLATFORM_BUSINESSES);
  const [filters, setFilters] = useState<BusinessFilterState>(INITIAL_FILTERS);

  // Status modification modal state
  const [modalBusiness, setModalBusiness] = useState<PlatformBusiness | null>(null);
  const [modalTargetStatus, setModalTargetStatus] = useState<'active' | 'suspended' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage = hasPlatformPermission(actor, PLATFORM_PERMISSIONS.BUSINESSES_MANAGE);

  // Filter application
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((biz) => {
      // Search filter (name, email, or ID)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesName = biz.name.toLowerCase().includes(query);
        const matchesEmail = biz.email.toLowerCase().includes(query);
        const matchesId = biz.id.toLowerCase().includes(query);
        const matchesAdmin = biz.primaryAdminName.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesId && !matchesAdmin) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && biz.accountStatus !== filters.status) {
        return false;
      }

      // Plan filter
      if (filters.plan !== 'all' && biz.plan !== filters.plan) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const regDate = new Date(biz.registrationDate).getTime();
        const now = new Date('2026-11-18').getTime();
        const diffDays = (now - regDate) / (1000 * 3600 * 24);

        if (filters.dateRange === '30d' && diffDays > 30) return false;
        if (filters.dateRange === '90d' && diffDays > 90) return false;
        if (filters.dateRange === 'year' && diffDays > 365) return false;
      }

      return true;
    });
  }, [businesses, filters]);

  // Server-side pagination simulation
  const pagination = usePagination({
    totalRecords: filteredBusinesses.length,
    initialPageSize: 10,
  });

  // Reset page when filters change
  useEffect(() => {
    pagination.goToPage(1);
  }, [filters]);

  const paginatedBusinesses = useMemo(() => {
    return paginateArray(filteredBusinesses, pagination.currentPage, pagination.pageSize).data;
  }, [filteredBusinesses, pagination.currentPage, pagination.pageSize]);

  const handleOpenStatusModal = (
    business: PlatformBusiness,
    targetStatus: 'active' | 'suspended'
  ) => {
    setModalBusiness(business);
    setModalTargetStatus(targetStatus);
    setIsModalOpen(true);
  };

  const handleConfirmStatusChange = (
    businessId: string,
    newStatus: 'active' | 'suspended'
  ) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, accountStatus: newStatus } : b))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Business Management"
        description="View, search, filter and inspect all commercial bakery enterprises registered on Cadence."
      />

      {/* Overview Cards */}
      <BusinessOverviewCards businesses={businesses} />

      {/* Search & Filters */}
      <BusinessFiltersBar
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(INITIAL_FILTERS)}
        totalResults={filteredBusinesses.length}
      />

      {/* Table */}
      <BusinessTable
        businesses={paginatedBusinesses}
        canManage={canManage}
        onRequestStatusChange={handleOpenStatusModal}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalRecords={pagination.totalRecords}
        pageSize={pagination.pageSize}
        onPageChange={pagination.goToPage}
        onPageSizeChange={pagination.setPageSize}
      />

      {/* Confirmation Modal */}
      <BusinessStatusModal
        business={modalBusiness}
        targetStatus={modalTargetStatus}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
