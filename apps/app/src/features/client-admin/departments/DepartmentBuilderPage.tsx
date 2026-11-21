/**
 * @file Department Builder page adopting Platform Admin layout and design hierarchy.
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FolderTree, Plus, Edit2, Sliders, Power, Trash2, Users, AlertCircle } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { ClientDepartment } from '../types';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DepartmentModal } from './components/DepartmentModal';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';
import { AdminPageHeader } from '../../platform-admin/AdminPageHeader';

export function DepartmentBuilderPage(): React.ReactElement {
  const {
    departments,
    subscription,
    actor,
    createDepartment,
    updateDepartment,
    toggleDepartmentStatus,
    deleteDepartment,
  } = useTenant();

  const canManage = hasClientPermission(actor, CLIENT_PERMISSIONS.DEPARTMENTS_MANAGE);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<ClientDepartment | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ClientDepartment | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesDesc = d.description.toLowerCase().includes(q);
        const matchesManager = d.managerName?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesManager) return false;
      }
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      return true;
    });
  }, [departments, search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
    setActionError(null);
  };

  const handleOpenEdit = (dept: ClientDepartment) => {
    setEditingDepartment(dept);
    setIsModalOpen(true);
    setActionError(null);
  };

  const handleSaveDepartment = (data: Omit<ClientDepartment, 'id' | 'businessId' | 'staffCount' | 'createdAt' | 'updatedAt'>) => {
    if (editingDepartment) {
      updateDepartment(editingDepartment.id, data);
      return { success: true };
    }
    return createDepartment(data);
  };

  const handleToggle = (id: string) => {
    setActionError(null);
    const res = toggleDepartmentStatus(id);
    if (!res.success) {
      setActionError(res.error || 'Cannot modify department status.');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const res = deleteDepartment(deleteTarget.id);
    if (!res.success) {
      setActionError(res.error || 'Cannot delete department.');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header with AdminPageHeader */}
      <AdminPageHeader
        title="Departments & Workspaces"
        description="Construct custom operational divisions, assign managers, and delegate duties."
        action={
          canManage ? (
            <button
              type="button"
              onClick={handleOpenCreate}
              disabled={departments.length >= subscription.maxDepartments}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-verdigris hover:bg-verdigris-lift text-flour text-sm font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Create Department</span>
            </button>
          ) : undefined
        }
      />

      {actionError && (
        <div className="p-4 rounded-xl bg-status-unbalanced/10 text-status-unbalanced border border-status-unbalanced/20 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments by name, manager, or description..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      >
        <span className="text-xs text-oven-black/60 font-semibold px-2">
          {departments.length} of {subscription.maxDepartments} Departments
        </span>
      </SearchFilterBar>

      {/* 3. Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepartments.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-rule text-oven-black/50">
            No departments found matching your search query.
          </div>
        ) : (
          filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-rule p-5 shadow-2xs hover:border-[#C8C2AD] hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-flour border border-rule text-verdigris flex items-center justify-center shrink-0 shadow-2xs">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <StatusBadge status={dept.status} />
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-oven-black tracking-tight">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-oven-black/70 line-clamp-2 mt-1 leading-relaxed">
                    {dept.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-[#E5E0D0] text-xs">
                <div className="flex items-center justify-between text-xs text-oven-black/70">
                  <span>Manager:</span>
                  <span className="font-bold text-oven-black">{dept.managerName || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-oven-black/70">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-verdigris" /> Assigned Staff:
                  </span>
                  <span className="font-bold text-verdigris">{dept.staffCount} Members</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E0D0]">
                  <Link
                    to={`/business/departments/config?dept=${dept.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-flour hover:bg-[#EFEBDB] text-oven-black text-xs font-semibold border border-rule transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-verdigris" />
                    <span>Configure Duties</span>
                  </Link>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 rounded-lg text-oven-black/60 hover:text-verdigris hover:bg-flour"
                        title="Edit department"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(dept.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          dept.status === 'active' ? 'text-status-open hover:bg-amber-50' : 'text-status-balanced hover:bg-emerald-50'
                        }`}
                        title={dept.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(dept)}
                        className="p-1.5 rounded-lg text-oven-black/60 hover:text-status-unbalanced hover:bg-rose-50"
                        title="Delete department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <DepartmentModal
        isOpen={isModalOpen}
        department={editingDepartment}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDepartment}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete Department: ${deleteTarget?.name}?`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? If there are active staff or shifts assigned to this department, deletion will be blocked.`}
        confirmLabel="Delete Department"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
