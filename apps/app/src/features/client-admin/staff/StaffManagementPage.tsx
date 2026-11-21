/**
 * @file Staff Management directory adopting Platform Admin table and filter patterns.
 */

import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Edit2, Power } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { ClientStaffMember } from '../types';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { StaffModal } from './components/StaffModal';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';
import { AdminPageHeader } from '../../platform-admin/AdminPageHeader';

export function StaffManagementPage(): React.ReactElement {
  const { staff, departments, subscription, actor, createStaff, updateStaff, toggleStaffStatus } = useTenant();

  const canManage = hasClientPermission(actor, CLIENT_PERMISSIONS.STAFF_MANAGE);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<ClientStaffMember | null>(null);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = s.fullName.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesId = s.staffId.toLowerCase().includes(q);
        const matchesRole = s.roleName.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesId && !matchesRole) return false;
      }
      if (deptFilter !== 'all' && s.departmentId !== deptFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      return true;
    });
  }, [staff, search, deptFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: ClientStaffMember) => {
    setEditingStaff(member);
    setIsModalOpen(true);
  };

  const handleSaveStaff = (data: Omit<ClientStaffMember, 'id' | 'businessId' | 'createdAt'>) => {
    if (editingStaff) {
      updateStaff(editingStaff.id, data);
      return { success: true };
    }
    return createStaff(data);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Standardized Header */}
      <AdminPageHeader
        title="Staff & Workforce"
        description="Directory of registered bakery employees, assigned roles, and branch postings."
        action={
          canManage ? (
            <button
              type="button"
              onClick={handleOpenCreate}
              disabled={staff.length >= subscription.maxStaff}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-verdigris hover:bg-verdigris-lift text-flour text-sm font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Staff</span>
            </button>
          ) : undefined
        }
      />

      {/* 2. Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff by name, email, role, or ID..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      >
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          aria-label="Filter by department"
          className="px-3.5 py-2.5 bg-[#F6F3EA]/50 border border-[#D9D3C0] rounded-xl text-sm text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63] focus:border-transparent transition-all cursor-pointer font-medium"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-oven-black/60 font-semibold px-2">
          {staff.length} of {subscription.maxStaff} Accounts
        </span>
      </SearchFilterBar>

      {/* 3. Data Table matching Platform Admin BusinessTable */}
      <div className="bg-white border border-[#D9D3C0] rounded-2xl shadow-xs overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#10201F]">No staff accounts found</h3>
            <p className="text-xs text-[#10201F]/60 mt-1 max-w-sm mx-auto">
              No employees match your search and filter criteria. Adjust your query or clear filters.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-[#E5E0D0]">
              {filteredStaff.map((s) => (
                <div key={`mobile-${s.id}`} className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-verdigris text-flour font-bold flex items-center justify-center text-xs">
                        {s.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#10201F]">{s.fullName}</h4>
                        <span className="font-mono text-xs text-[#10201F]/60">{s.staffId}</span>
                      </div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>

                  <div className="space-y-1 text-xs text-[#10201F]/70 border-t border-[#E5E0D0] pt-2">
                    <div className="flex justify-between">
                      <span>Department:</span>
                      <strong className="text-oven-black">{s.departmentName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Role:</span>
                      <span className="font-semibold text-verdigris">{s.roleName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Branch:</span>
                      <span>{s.branchName || 'All Branches'}</span>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E0D0]">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(s)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-verdigris hover:bg-[#F6F3EA] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStaffStatus(s.id)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-[#10201F]/70 hover:bg-[#F6F3EA] cursor-pointer"
                      >
                        {s.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9D3C0] bg-[#F6F3EA]/60 text-xs font-bold text-[#10201F]/80 uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4 sm:px-6">Staff Member</th>
                    <th scope="col" className="py-3.5 px-4">Department</th>
                    <th scope="col" className="py-3.5 px-4">Role</th>
                    <th scope="col" className="py-3.5 px-4">Branch Location</th>
                    <th scope="col" className="py-3.5 px-4">Status</th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D0] text-sm">
                  {filteredStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F9F7F1]/60 transition-colors group">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-verdigris text-flour flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {s.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#10201F] text-sm">{s.fullName}</div>
                            <div className="flex items-center gap-2 text-xs text-[#10201F]/60">
                              <code className="font-mono text-[11px] font-bold text-copper">{s.staffId}</code>
                              <span>•</span>
                              <span>{s.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-semibold text-[#10201F]">
                        {s.departmentName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-verdigris/10 text-verdigris text-xs font-bold border border-verdigris/20">
                          {s.roleName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-[#10201F]/70">
                        {s.branchName || 'All Branches'}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={s.status} />
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {canManage && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(s)}
                              className="p-1.5 rounded-lg text-oven-black/60 hover:text-verdigris hover:bg-flour transition-colors"
                              title="Edit staff account"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStaffStatus(s.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                s.status === 'active'
                                  ? 'text-status-open hover:bg-amber-50'
                                  : 'text-status-balanced hover:bg-emerald-50'
                              }`}
                              title={s.status === 'active' ? 'Deactivate staff account' : 'Activate staff account'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Staff Modal */}
      <StaffModal
        isOpen={isModalOpen}
        staffMember={editingStaff}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStaff}
      />
    </div>
  );
}
