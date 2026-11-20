/**
 * @file Modal dialog for creating and editing shifts with integrated conflict detection.
 */

import React, { useState, useEffect } from 'react';
import { X, CalendarClock, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import type { ClientShift, ShiftConflict } from '../../types';
import { useTenant } from '../../context/TenantContext';
import { detectShiftConflicts } from '../utils/conflict-detector';
import { Button } from '../../../../components/shared/Button';

export interface ShiftModalProps {
  isOpen: boolean;
  shift: ClientShift | null;
  onClose: () => void;
  onSave: (data: Omit<ClientShift, 'id' | 'businessId' | 'createdAt'>) => { success: boolean; error?: string };
}

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const;

export function ShiftModal({ isOpen, shift, onClose, onSave }: ShiftModalProps): React.ReactElement | null {
  const { departments, branches, staff, shifts, subscription } = useTenant();

  const [formData, setFormData] = useState({
    name: '',
    shiftType: 'day' as 'day' | 'evening' | 'night' | 'custom',
    startTime: '06:00',
    endTime: '14:00',
    assignedDepartmentId: '',
    assignedBranchId: '',
    assignedStaffIds: [] as string[],
    shiftDays: ['mon', 'tue', 'wed', 'thu', 'fri'] as ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[],
    rotationPattern: 'fixed' as 'fixed' | 'weekly_rotation' | 'biweekly_rotation',
    status: 'active' as 'active' | 'inactive',
  });

  const [conflicts, setConflicts] = useState<ShiftConflict[]>([]);
  const [error, setError] = useState<string | null>(null);

  const staffDirectory = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of staff) {
      map[s.id] = s.fullName;
    }
    return map;
  }, [staff]);

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name,
        shiftType: shift.shiftType,
        startTime: shift.startTime,
        endTime: shift.endTime,
        assignedDepartmentId: shift.assignedDepartmentId,
        assignedBranchId: shift.assignedBranchId || '',
        assignedStaffIds: shift.assignedStaffIds,
        shiftDays: shift.shiftDays,
        rotationPattern: shift.rotationPattern,
        status: shift.status,
      });
    } else {
      setFormData({
        name: '',
        shiftType: 'day',
        startTime: '06:00',
        endTime: '14:00',
        assignedDepartmentId: departments[0]?.id || '',
        assignedBranchId: branches[0]?.id || '',
        assignedStaffIds: [],
        shiftDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        rotationPattern: 'fixed',
        status: 'active',
      });
    }
    setError(null);
    setConflicts([]);
  }, [shift, isOpen, departments, branches]);

  // Run live conflict detection
  useEffect(() => {
    if (!isOpen) return;
    const detected = detectShiftConflicts({
      targetShift: {
        id: shift?.id,
        ...formData,
      },
      existingShifts: shifts,
      staffDirectory,
    });
    setConflicts(detected);
  }, [formData, isOpen, shift, shifts, staffDirectory]);

  if (!isOpen) return null;

  const handleToggleDay = (day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun') => {
    setFormData((prev) => {
      const exists = prev.shiftDays.includes(day);
      return {
        ...prev,
        shiftDays: exists ? prev.shiftDays.filter((d) => d !== day) : [...prev.shiftDays, day],
      };
    });
  };

  const handleToggleStaff = (staffId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedStaffIds.includes(staffId);
      return {
        ...prev,
        assignedStaffIds: exists ? prev.assignedStaffIds.filter((id) => id !== staffId) : [...prev.assignedStaffIds, staffId],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.assignedDepartmentId || formData.shiftDays.length === 0) {
      setError('Shift name, department, and at least one shift day are required.');
      return;
    }

    const blockingConflicts = conflicts.filter((c) => c.type === 'invalid_time_range');
    if (blockingConflicts.length > 0) {
      setError(blockingConflicts[0].message);
      return;
    }

    const res = onSave(formData);
    if (!res.success) {
      setError(res.error || 'Failed to save shift.');
    } else {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl border border-[#D9D3C0] max-w-xl w-full p-6 sm:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9D3C0]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center">
              <CalendarClock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#10201F]">
                {shift ? 'Edit Shift Schedule' : 'Schedule New Shift'}
              </h3>
              <p className="text-2xs text-[#10201F]/60">
                Configure timing, staff assignments, and rotation patterns
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-xl text-[#10201F]/50 hover:text-[#10201F] hover:bg-[#F6F3EA]"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-[#8C1D18]/10 text-[#8C1D18] border border-[#8C1D18]/20 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Conflict Warnings */}
        {conflicts.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertTriangle size={15} />
              <span>Scheduling Conflict Detected ({conflicts.length})</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-2xs">
              {conflicts.map((c, i) => (
                <li key={i}>{c.message}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Shift Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Morning Oven Bake Shift"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Shift Type
              </label>
              <select
                value={formData.shiftType}
                onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63]"
              >
                <option value="day">Day Shift</option>
                <option value="evening">Evening Shift</option>
                <option value="night">Night Shift (Overnight)</option>
                <option value="custom">Custom Shift</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Rotation Pattern
              </label>
              <select
                value={formData.rotationPattern}
                onChange={(e) => setFormData({ ...formData, rotationPattern: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63]"
              >
                <option value="fixed">Fixed Roster</option>
                <option value="weekly_rotation">Weekly Rotation</option>
                <option value="biweekly_rotation">Bi-Weekly Rotation</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Start Time (HH:mm) *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                End Time (HH:mm) *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Assigned Department *
              </label>
              <select
                value={formData.assignedDepartmentId}
                onChange={(e) => setFormData({ ...formData, assignedDepartmentId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63]"
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {subscription.isMultiBranchSupported && branches.length > 0 && (
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                  Branch Location
                </label>
                <select
                  value={formData.assignedBranchId}
                  onChange={(e) => setFormData({ ...formData, assignedBranchId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63]"
                >
                  <option value="">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Shift Days Selection */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70">
              Shift Days *
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = formData.shiftDays.includes(d.key as any);
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => handleToggleDay(d.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B5C63] text-white shadow-xs'
                        : 'bg-[#F6F3EA] text-[#10201F]/70 hover:bg-[#EFE9D9]'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Staff Checkbox List */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70">
              Assign Staff Members ({formData.assignedStaffIds.length} assigned)
            </label>
            <div className="max-h-36 overflow-y-auto p-2 rounded-2xl border border-[#D9D3C0] bg-[#F6F3EA]/30 space-y-1 text-xs">
              {staff.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white cursor-pointer"
                >
                  <div className="truncate">
                    <span className="font-bold text-[#10201F]">{s.fullName}</span>
                    <span className="text-3xs text-[#10201F]/60 ml-2">({s.roleName})</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.assignedStaffIds.includes(s.id)}
                    onChange={() => handleToggleStaff(s.id)}
                    className="rounded text-[#0B5C63] focus:ring-[#0B5C63]"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#D9D3C0]/60">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {shift ? 'Save Shift Schedule' : 'Create Shift'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
