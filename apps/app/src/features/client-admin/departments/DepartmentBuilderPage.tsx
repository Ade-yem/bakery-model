/**
 * @file Department Builder page allowing businesses to dynamically create,
 * configure, and manage departments according to their unique operational needs.
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FolderTree, Plus, Edit2, Sliders, Power, Trash2, Users, AlertCircle } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { ClientDepartment } from '../types';
import { Button } from '../../../components/shared/Button';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DepartmentModal } from './components/DepartmentModal';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';

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

  // Deletion safety dialog state
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
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#D9D3C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xs font-extrabold uppercase tracking-wider text-[#0B5C63]">
              Operational Structure
            </span>
            <span className="text-2xs text-[#10201F]/60">
              Usage: {departments.length} of {subscription.maxDepartments} departments
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10201F] tracking-tight">
            Department Builder
          </h1>
          <p className="text-xs sm:text-sm text-[#10201F]/70 mt-0.5">
            Construct custom operational divisions, assign managers, and delegate duties.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            iconPosition="left"
            onClick={handleOpenCreate}
            disabled={departments.length >= subscription.maxDepartments}
          >
            Create Department
          </Button>
        )}
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-[#8C1D18]/10 text-[#8C1D18] border border-[#8C1D18]/20 text-xs flex items-center justify-between gap-3">
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

      {/* Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments by name, manager, or description..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepartments.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-[#D9D3C0] text-[#10201F]/50">
            No departments found matching your criteria.
          </div>
        ) : (
          filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-3xl border border-[#D9D3C0] p-5 shadow-2xs hover:border-[#0B5C63]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center shrink-0">
                    <FolderTree size={18} />
                  </div>
                  <StatusBadge status={dept.status} />
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#10201F] tracking-tight">
                    {dept.name}
                  </h3>
                  <p className="text-2xs sm:text-xs text-[#10201F]/70 line-clamp-2 mt-1 leading-relaxed">
                    {dept.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#D9D3C0]/40 text-xs">
                <div className="flex items-center justify-between text-2xs text-[#10201F]/70">
                  <span>Manager:</span>
                  <span className="font-bold text-[#10201F]">{dept.managerName || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between text-2xs text-[#10201F]/70">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> Assigned Staff:
                  </span>
                  <span className="font-bold text-[#0B5C63]">{dept.staffCount} Members</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#D9D3C0]/40">
                  <Link
                    to={`/business/departments/config?dept=${dept.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6F3EA] hover:bg-[#EFE9D9] text-[#10201F] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Sliders size={13} className="text-[#0B5C63]" />
                    <span>Configure</span>
                  </Link>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 rounded-lg text-[#10201F]/70 hover:text-[#0B5C63] hover:bg-[#F6F3EA]"
                        title="Edit department"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(dept.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          dept.status === 'active' ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={dept.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(dept)}
                        className="p-1.5 rounded-lg text-[#10201F]/70 hover:text-[#8C1D18] hover:bg-[#8C1D18]/10"
                        title="Delete department"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Department Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        department={editingDepartment}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDepartment}
      />

      {/* Safe Deletion Confirmation Dialog */}
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
