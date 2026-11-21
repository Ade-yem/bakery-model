/**
 * @file Shift Scheduling page for configuring rosters, staff allocations, and rotation cycles.
 */

import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Clock, Users } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { ClientShift } from '../types';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ShiftModal } from './components/ShiftModal';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';
import { AdminPageHeader } from '../../platform-admin/AdminPageHeader';

const DAYS_HEADER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ShiftSchedulingPage(): React.ReactElement {
  const { shifts, departments, actor, createShift, updateShift, deleteShift } = useTenant();

  const canManage = hasClientPermission(actor, CLIENT_PERMISSIONS.SHIFTS_MANAGE);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ClientShift | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientShift | null>(null);

  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q)) return false;
      }
      if (deptFilter !== 'all' && s.assignedDepartmentId !== deptFilter) return false;
      return true;
    });
  }, [shifts, search, deptFilter]);

  const handleOpenCreate = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift: ClientShift) => {
    setEditingShift(shift);
    setIsModalOpen(true);
  };

  const handleSaveShift = (data: Omit<ClientShift, 'id' | 'businessId' | 'createdAt'>) => {
    if (editingShift) {
      updateShift(editingShift.id, data);
      return { success: true };
    }
    return createShift(data);
  };

  const getDepartmentName = (deptId: string) => {
    return departments.find((d) => d.id === deptId)?.name || 'General';
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Standardized Platform Admin Page Header */}
      <AdminPageHeader
        title="Shift Scheduling"
        description="Plan operating rosters, configure shift rotations, and resolve staff assignment conflicts."
        action={
          <div className="flex items-center gap-3">
            <div className="inline-flex p-1 rounded-xl bg-[#F6F3EA] border border-[#D9D3C0]">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'calendar' ? 'bg-[#0B5C63] text-white shadow-2xs' : 'text-[#10201F]/70'
                }`}
              >
                Weekly Calendar
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#0B5C63] text-white shadow-2xs' : 'text-[#10201F]/70'
                }`}
              >
                List View
              </button>
            </div>

            {canManage && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-verdigris hover:bg-verdigris-lift text-flour text-sm font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Shift</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2. Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search shifts by title..."
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

      {/* 3. Calendar Grid View or Table View */}
      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-2xl border border-[#D9D3C0] shadow-xs p-5 space-y-4">
          <div className="grid grid-cols-7 gap-2 border-b border-[#D9D3C0]/60 pb-3 text-center">
            {DAYS_HEADER.map((d) => (
              <span key={d} className="text-xs font-extrabold uppercase tracking-wider text-[#10201F]/70">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 min-h-[300px]">
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((dayKey) => {
              const dayShifts = filteredShifts.filter((s) => s.shiftDays.includes(dayKey as any));
              return (
                <div
                  key={dayKey}
                  className="rounded-xl bg-[#F6F3EA]/40 p-2 space-y-2 border border-[#D9D3C0]/40 flex flex-col"
                >
                  {dayShifts.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => canManage && handleOpenEdit(s)}
                      className="p-2.5 rounded-xl bg-white border border-[#D9D3C0] shadow-2xs space-y-1 cursor-pointer hover:border-[#0B5C63] transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-[#10201F] truncate">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#0B5C63] font-mono font-bold">
                        <Clock size={11} />
                        <span>{s.startTime}-{s.endTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#10201F]/60 pt-0.5">
                        <span className="truncate">{getDepartmentName(s.assignedDepartmentId)}</span>
                        <span className="font-bold">{s.assignedStaffIds.length} staff</span>
                      </div>
                    </div>
                  ))}
                  {dayShifts.length === 0 && (
                    <span className="text-xs text-[#10201F]/30 text-center my-auto py-8">No shifts</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View matching Platform Admin BusinessTable */
        <div className="bg-white rounded-2xl border border-[#D9D3C0] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs text-[#10201F]">
            <thead className="border-b border-[#D9D3C0] bg-[#F6F3EA]/60 text-xs font-bold text-[#10201F]/80 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Shift Title</th>
                <th className="py-3.5 px-4">Timing & Type</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Active Days</th>
                <th className="py-3.5 px-4">Assigned Staff</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D0]">
              {filteredShifts.map((s) => (
                <tr key={s.id} className="hover:bg-[#F6F3EA]/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-sm text-[#10201F]">
                    {s.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-[#0B5C63]">
                      <Clock size={13} />
                      <span>{s.startTime} - {s.endTime}</span>
                    </div>
                    <span className="text-xs font-bold uppercase text-[#10201F]/50">{s.shiftType} shift</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#10201F]">
                    {getDepartmentName(s.assignedDepartmentId)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {s.shiftDays.map((d) => (
                        <span key={d} className="px-1.5 py-0.5 rounded bg-[#F6F3EA] text-xs font-bold uppercase text-[#10201F]/70 border border-[#D9D3C0]/40">
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-xs text-[#10201F]">
                      <Users size={13} className="text-[#0B5C63]" />
                      {s.assignedStaffIds.length} Staff
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {canManage && (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg text-[#10201F]/70 hover:text-[#0B5C63] hover:bg-[#F6F3EA] cursor-pointer"
                          title="Edit shift"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(s)}
                          className="p-1.5 rounded-lg text-[#10201F]/70 hover:text-[#DF1B22] hover:bg-[#FDECEC] cursor-pointer"
                          title="Delete shift"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shift Modal */}
      <ShiftModal
        isOpen={isModalOpen}
        shift={editingShift}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveShift}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete Shift: ${deleteTarget?.name}?`}
        message="Are you sure you want to remove this shift schedule? Associated roster assignments will be cleared."
        confirmLabel="Delete Shift"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteShift(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
