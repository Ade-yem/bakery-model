/**
 * @file Staff Management directory page for managing workforce assignments and access boundaries.
 */

import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Edit2, Power, Mail, Phone, Building } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { ClientStaffMember } from '../types';
import { Button } from '../../../components/shared/Button';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { StaffModal } from './components/StaffModal';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';

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
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#D9D3C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xs font-extrabold uppercase tracking-wider text-[#0B5C63]">
              Workforce Directory
            </span>
            <span className="text-2xs text-[#10201F]/60">
              Accounts: {staff.length} of {subscription.maxStaff} staff accounts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10201F] tracking-tight">
            Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-[#10201F]/70 mt-0.5">
            Manage employee identities, department postings, and operational roles.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus size={16} />}
            iconPosition="left"
            onClick={handleOpenCreate}
            disabled={staff.length >= subscription.maxStaff}
          >
            Invite Staff
          </Button>
        )}
      </div>

      {/* Filter Bar */}
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
          className="px-3 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs sm:text-sm text-[#10201F] focus:outline-none focus:border-[#0B5C63] cursor-pointer"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </SearchFilterBar>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl border border-[#D9D3C0] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-[#10201F]">
          <thead className="bg-[#F6F3EA] border-b border-[#D9D3C0] text-3xs font-extrabold uppercase tracking-wider text-[#10201F]/70">
            <tr>
              <th className="py-3.5 px-5">Staff Member</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Assigned Role</th>
              <th className="py-3.5 px-4">Branch</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C0]/40">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#10201F]/50">
                  No staff accounts found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredStaff.map((s) => (
                <tr key={s.id} className="hover:bg-[#F6F3EA]/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0B5C63] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {s.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#10201F]">{s.fullName}</div>
                        <div className="flex items-center gap-2 text-2xs text-[#10201F]/60">
                          <code className="font-mono text-3xs font-bold">{s.staffId}</code>
                          <span>• {s.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#10201F]">
                    {s.departmentName}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#10201F]/80">
                    <span className="px-2 py-0.5 rounded-full bg-[#0B5C63]/10 text-[#0B5C63] text-2xs font-bold">
                      {s.roleName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#10201F]/70">
                    {s.branchName || 'All Branches'}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg text-[#10201F]/70 hover:text-[#0B5C63] hover:bg-[#F6F3EA]"
                            title="Edit staff profile"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStaffStatus(s.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              s.status === 'active' ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={s.status === 'active' ? 'Deactivate account' : 'Activate account'}
                          >
                            <Power size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards */}
      <div className="md:hidden space-y-3">
        {filteredStaff.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-2xl border border-[#D9D3C0] shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0B5C63] text-white flex items-center justify-center font-bold text-xs">
                  {s.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#10201F]">{s.fullName}</h3>
                  <code className="text-3xs text-[#10201F]/60 font-mono">{s.staffId}</code>
                </div>
              </div>
              <StatusBadge status={s.status} />
            </div>

            <div className="space-y-1 text-2xs text-[#10201F]/70 border-t border-[#D9D3C0]/40 pt-2">
              <div className="flex justify-between">
                <span>Department:</span>
                <span className="font-bold text-[#10201F]">{s.departmentName}</span>
              </div>
              <div className="flex justify-between">
                <span>Role:</span>
                <span className="font-bold text-[#0B5C63]">{s.roleName}</span>
              </div>
              <div className="flex justify-between">
                <span>Branch:</span>
                <span>{s.branchName || 'All Branches'}</span>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D9D3C0]/40">
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(s)}>
                  Edit
                </Button>
                <Button variant="secondary" size="sm" onClick={() => toggleStaffStatus(s.id)}>
                  {s.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            )}
          </div>
        ))}
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
