/**
 * @file Roles & Permissions management page for establishing clear organizational
 * responsibility boundaries and granular access authorization.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Plus, Edit2, Lock, Users } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { ClientRole } from '../types';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { RoleModal } from './components/RoleModal';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';
import { AdminPageHeader } from '../../platform-admin/AdminPageHeader';
import { EmptyState, Pagination } from '../../../components/shared';
import { usePagination, paginateArray } from '../../../hooks/usePagination';

export function RolesPermissionsPage(): React.ReactElement {
  const { roles, actor, createRole, updateRole } = useTenant();

  const canManage = hasClientPermission(actor, CLIENT_PERMISSIONS.ROLES_MANAGE);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<ClientRole | null>(null);

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCode = r.code.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }
      return true;
    });
  }, [roles, search]);

  const pagination = usePagination({
    totalRecords: filteredRoles.length,
    initialPageSize: 10,
  });

  useEffect(() => {
    pagination.goToPage(1);
  }, [search]);

  const paginatedRoles = useMemo(() => {
    return paginateArray(filteredRoles, pagination.currentPage, pagination.pageSize).data;
  }, [filteredRoles, pagination.currentPage, pagination.pageSize]);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: ClientRole) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleSaveRole = (data: Omit<ClientRole, 'id' | 'businessId' | 'staffCount' | 'createdAt'>) => {
    if (editingRole) {
      updateRole(editingRole.id, data);
      return { success: true };
    }
    return createRole(data);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Standardized Platform Admin Page Header */}
      <AdminPageHeader
        title="Roles & Permissions"
        description="Maintain clear role responsibilities and configure granular operational action boundaries."
        action={
          canManage ? (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-verdigris hover:bg-verdigris-lift text-flour text-sm font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
            >
              <Plus className="w-4 h-4" />
              <span>Create Role</span>
            </button>
          ) : undefined
        }
      />

      {/* 2. Access Model Clarity Banner */}
      <div className="p-4 rounded-2xl bg-white border border-[#D9D3C0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#10201F]">
        <div className="space-y-0.5">
          <p className="font-extrabold text-[#0B5C63]">Cadence Three-Tier Access Model</p>
          <p className="text-[#10201F]/70 text-xs">
            <strong>Department</strong> defines where staff work • <strong>Role</strong> defines general responsibility • <strong>Permissions</strong> define specific transactional actions allowed.
          </p>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search roles by title, code, or description..."
      />

      {/* 4. Table matching Platform Admin BusinessTable */}
      {filteredRoles.length === 0 ? (
        <EmptyState
          variant="no-search-results"
          title="No roles found"
          description="No roles match your search criteria. Try adjusting your query or create a new role."
        />
      ) : (
        <>
          <div className="bg-white border border-[#D9D3C0] rounded-2xl shadow-xs overflow-hidden">
            {/* Mobile Stacked Cards */}
            <div className="md:hidden divide-y divide-[#E5E0D0]">
              {paginatedRoles.map((r) => (
                <div key={`mobile-${r.id}`} className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#10201F]">{r.name}</h4>
                      <span className="font-mono text-xs text-[#10201F]/60">{r.code}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBF3E8] text-[#3F7A2A]">
                      {r.permissions.length} perms
                    </span>
                  </div>

                  <p className="text-xs text-[#10201F]/70 border-t border-[#E5E0D0] pt-2">
                    {r.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D0] text-xs">
                    <span className="text-[#10201F]/60">{r.staffCount} staff members</span>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(r)}
                        className="font-semibold text-verdigris hover:text-verdigris-lift cursor-pointer"
                      >
                        Edit Permissions
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-[#10201F]">
                <thead className="border-b border-[#D9D3C0] bg-[#F6F3EA]/60 text-xs font-bold text-[#10201F]/80 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Role Name & Code</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Assigned Staff</th>
                    <th className="py-3.5 px-4">Permissions Granted</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D0]">
                  {paginatedRoles.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F6F3EA]/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center font-bold shrink-0">
                            <ShieldCheck size={16} />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#10201F] block">{r.name}</span>
                            <code className="text-xs font-mono text-[#10201F]/60">{r.code}</code>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[240px] truncate text-[#10201F]/70">
                        {r.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-[#10201F]">
                          <Users size={12} className="text-[#0B5C63]" />
                          {r.staffCount} Staff
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0B5C63]/10 text-[#0B5C63]">
                          {r.permissions.length} actions
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {r.isSystem ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10201F]/60 bg-[#EFE9D9] px-2.5 py-0.5 rounded-full">
                            <Lock size={10} /> System
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            Custom
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg text-[#10201F]/70 hover:text-[#0B5C63] hover:bg-[#F6F3EA] cursor-pointer"
                            title="Edit role permissions"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalRecords={pagination.totalRecords}
            pageSize={pagination.pageSize}
            onPageChange={pagination.goToPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </>
      )}

      {/* Role Modal */}
      <RoleModal
        isOpen={isModalOpen}
        role={editingRole}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
      />
    </div>
  );
}
