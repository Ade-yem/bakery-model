/**
 * @file Roles & Permissions management page for establishing clear organizational
 * responsibility boundaries and granular access authorization.
 */

import React, { useState, useMemo } from 'react';
import { ShieldCheck, Plus, Edit2, Lock, Users } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { ClientRole } from '../types';
import { Button } from '../../../components/shared/Button';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { RoleModal } from './components/RoleModal';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';

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
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#D9D3C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-3xs font-extrabold uppercase tracking-wider text-[#0B5C63]">
            Access Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10201F] tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-[#10201F]/70 mt-0.5">
            Maintain clear role responsibilities and configure granular action permissions.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            iconPosition="left"
            onClick={handleOpenCreate}
          >
            Create Role
          </Button>
        )}
      </div>

      {/* Role vs Department Clarity Callout */}
      <div className="p-4 rounded-2xl bg-[#0B5C63]/5 border border-[#0B5C63]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#10201F]">
        <div className="space-y-0.5">
          <p className="font-extrabold text-[#0B5C63]">Cadence Three-Tier Access Model</p>
          <p className="text-[#10201F]/70 text-2xs">
            <strong>Department</strong> defines where staff work • <strong>Role</strong> defines general responsibility • <strong>Permissions</strong> define specific transactional actions allowed.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search roles by title, code, or description..."
      />

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl border border-[#D9D3C0] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-[#10201F]">
          <thead className="bg-[#F6F3EA] border-b border-[#D9D3C0] text-3xs font-extrabold uppercase tracking-wider text-[#10201F]/70">
            <tr>
              <th className="py-3.5 px-5">Role Name & Code</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Assigned Staff</th>
              <th className="py-3.5 px-4">Permissions Granted</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C0]/40">
            {filteredRoles.map((r) => (
              <tr key={r.id} className="hover:bg-[#F6F3EA]/40 transition-colors">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center font-bold shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#10201F] block">{r.name}</span>
                      <code className="text-2xs font-mono text-[#10201F]/60">{r.code}</code>
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
                  <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-[#0B5C63]/10 text-[#0B5C63]">
                    {r.permissions.length} actions
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {r.isSystem ? (
                    <span className="inline-flex items-center gap-1 text-2xs font-bold text-[#10201F]/60 bg-[#EFE9D9] px-2 py-0.5 rounded-full">
                      <Lock size={10} /> System
                    </span>
                  ) : (
                    <span className="text-2xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Custom
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-right">
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(r)}
                      className="p-1.5 rounded-lg text-[#10201F]/70 hover:text-[#0B5C63] hover:bg-[#F6F3EA]"
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

      {/* Mobile Stacked Cards */}
      <div className="md:hidden space-y-3">
        {filteredRoles.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-2xl border border-[#D9D3C0] shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#10201F]">{r.name}</h3>
                <span className="font-mono text-2xs text-[#10201F]/60">{r.code}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-[#0B5C63]/10 text-[#0B5C63]">
                {r.permissions.length} perms
              </span>
            </div>

            <p className="text-2xs text-[#10201F]/70 border-t border-[#D9D3C0]/40 pt-2">
              {r.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#D9D3C0]/40 text-2xs">
              <span className="text-[#10201F]/60">{r.staffCount} staff members</span>
              {canManage && (
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(r)}>
                  Edit Permissions
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

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
