/**
 * @file Master page for Client Admin Accounts directory in Cadence Platform Admin.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { AdminPageHeader } from '../AdminPageHeader';
import { ClientAdminOverviewCards } from './components/ClientAdminOverviewCards';
import { ClientAdminFiltersBar } from './components/ClientAdminFiltersBar';
import { ClientAdminTable } from './components/ClientAdminTable';
import { ClientAdminDetailsModal } from './components/ClientAdminDetailsModal';
import { Pagination } from '../../../components/shared';
import { usePagination, paginateArray } from '../../../hooks/usePagination';
import { MOCK_CLIENT_ADMINS } from '../mock-businesses';
import { PLATFORM_PERMISSIONS, hasPlatformPermission } from '../permissions';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { ClientAdminFilterState, PlatformClientAdmin } from '../types';

export interface ClientAdminsPageProps {
  /** Authenticated administrator. */
  actor?: AuthenticatedActor;
}

const INITIAL_FILTERS: ClientAdminFilterState = {
  search: '',
  businessId: 'all',
  status: 'all',
};

/**
 * @description Renders Client Admin Accounts management directory with search, business filter, and profile dialog.
 * @param {ClientAdminsPageProps} props - Component properties.
 * @returns {React.ReactElement} Client admin accounts page.
 * @example
 * ```tsx
 * <ClientAdminsPage actor={actor} />
 * ```
 */
export function ClientAdminsPage({ actor }: ClientAdminsPageProps): React.ReactElement {
  const [admins, setAdmins] = useState<PlatformClientAdmin[]>(MOCK_CLIENT_ADMINS);
  const [filters, setFilters] = useState<ClientAdminFilterState>(INITIAL_FILTERS);
  const [selectedAdmin, setSelectedAdmin] = useState<PlatformClientAdmin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage = hasPlatformPermission(actor, PLATFORM_PERMISSIONS.CLIENT_ADMINS_MANAGE);

  // Extract unique businesses for the dropdown
  const uniqueBusinesses = useMemo(() => {
    const map = new Map<string, string>();
    admins.forEach((a) => {
      if (!map.has(a.businessId)) {
        map.set(a.businessId, a.businessName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [admins]);

  // Apply filters
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      // Search filter (name or email)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesName = admin.fullName.toLowerCase().includes(query);
        const matchesEmail = admin.email.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }

      // Linked business filter
      if (filters.businessId !== 'all' && admin.businessId !== filters.businessId) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && admin.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [admins, filters]);

  const pagination = usePagination({
    totalRecords: filteredAdmins.length,
    initialPageSize: 10,
  });

  useEffect(() => {
    pagination.goToPage(1);
  }, [filters]);

  const paginatedAdmins = useMemo(() => {
    return paginateArray(filteredAdmins, pagination.currentPage, pagination.pageSize).data;
  }, [filteredAdmins, pagination.currentPage, pagination.pageSize]);

  const handleSelectAdmin = (admin: PlatformClientAdmin) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (admin: PlatformClientAdmin) => {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    setAdmins((prev) =>
      prev.map((a) => (a.id === admin.id ? { ...a, status: newStatus } : a))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Client Admin Accounts"
        description="View primary business administrators and account credentials linked to each bakery enterprise."
      />

      {/* Overview Cards */}
      <ClientAdminOverviewCards admins={admins} />

      {/* Search & Filters Toolbar */}
      <ClientAdminFiltersBar
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(INITIAL_FILTERS)}
        businesses={uniqueBusinesses}
        totalResults={filteredAdmins.length}
      />

      {/* Table */}
      <ClientAdminTable
        admins={paginatedAdmins}
        canManage={canManage}
        onSelectAdmin={handleSelectAdmin}
        onToggleStatus={handleToggleStatus}
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

      {/* Profile Details Modal */}
      <ClientAdminDetailsModal
        admin={selectedAdmin}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
