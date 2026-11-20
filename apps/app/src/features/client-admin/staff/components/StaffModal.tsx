/**
 * @file Modal dialog for creating and editing staff accounts within plan limits.
 */

import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import type { ClientStaffMember } from '../../types';
import { useTenant } from '../../context/TenantContext';
import { Button } from '../../../../components/shared/Button';

export interface StaffModalProps {
  isOpen: boolean;
  staffMember: ClientStaffMember | null;
  onClose: () => void;
  onSave: (data: Omit<ClientStaffMember, 'id' | 'businessId' | 'createdAt'>) => { success: boolean; error?: string };
}

export function StaffModal({ isOpen, staffMember, onClose, onSave }: StaffModalProps): React.ReactElement | null {
  const { departments, roles, branches, subscription } = useTenant();

  const [formData, setFormData] = useState({
    staffId: '',
    fullName: '',
    email: '',
    phone: '',
    departmentId: '',
    roleId: '',
    branchId: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staffMember) {
      setFormData({
        staffId: staffMember.staffId,
        fullName: staffMember.fullName,
        email: staffMember.email,
        phone: staffMember.phone,
        departmentId: staffMember.departmentId,
        roleId: staffMember.roleId,
        branchId: staffMember.branchId || '',
        status: staffMember.status,
      });
    } else {
      setFormData({
        staffId: `STF-${Math.floor(100 + Math.random() * 900)}`,
        fullName: '',
        email: '',
        phone: '',
        departmentId: departments[0]?.id || '',
        roleId: roles[0]?.id || '',
        branchId: branches[0]?.id || '',
        status: 'active',
      });
    }
    setError(null);
  }, [staffMember, isOpen, departments, roles, branches]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.departmentId || !formData.roleId) {
      setError('Full name, email, department, and role are required.');
      return;
    }

    const selectedDept = departments.find((d) => d.id === formData.departmentId);
    const selectedRole = roles.find((r) => r.id === formData.roleId);
    const selectedBranch = branches.find((b) => b.id === formData.branchId);

    const res = onSave({
      ...formData,
      departmentName: selectedDept?.name || 'General',
      roleName: selectedRole?.name || 'Staff',
      branchName: selectedBranch?.name,
    });

    if (!res.success) {
      setError(res.error || 'Failed to save staff account.');
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
      <div className="bg-white rounded-3xl border border-[#D9D3C0] max-w-lg w-full p-6 sm:p-8 shadow-xl space-y-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9D3C0]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#10201F]">
                {staffMember ? 'Edit Staff Profile' : 'Invite Staff Member'}
              </h3>
              <p className="text-2xs text-[#10201F]/60">
                Assign department duties, roles, and branch locations
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Danladi Bello"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Staff ID Code
              </label>
              <input
                type="text"
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#0B5C63] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@bakery.ng"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+234..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Assigned Department *
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
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

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Assigned Role *
              </label>
              <select
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63]"
                required
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {subscription.isMultiBranchSupported && branches.length > 0 && (
              <div className="sm:col-span-2">
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                  Assigned Branch
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63]"
                >
                  <option value="">No branch restriction</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#D9D3C0]/60">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {staffMember ? 'Save Staff Profile' : 'Create Staff Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
