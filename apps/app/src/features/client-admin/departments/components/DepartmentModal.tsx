/**
 * @file Modal dialog for creating and editing dynamic departments.
 */

import React, { useState, useEffect } from 'react';
import { X, FolderTree, AlertCircle } from 'lucide-react';
import type { ClientDepartment } from '../../types';
import { Button } from '../../../../components/shared/Button';

export interface DepartmentModalProps {
  isOpen: boolean;
  department: ClientDepartment | null;
  onClose: () => void;
  onSave: (data: Omit<ClientDepartment, 'id' | 'businessId' | 'staffCount' | 'createdAt' | 'updatedAt'>) => { success: boolean; error?: string };
}

export function DepartmentModal({ isOpen, department, onClose, onSave }: DepartmentModalProps): React.ReactElement | null {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerName: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        description: department.description,
        managerName: department.managerName || '',
        status: department.status,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        managerName: '',
        status: 'active',
      });
    }
    setError(null);
  }, [department, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Department name and operational description are required.');
      return;
    }

    const res = onSave(formData);
    if (!res.success) {
      setError(res.error || 'Failed to save department.');
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
      <div className="bg-white rounded-3xl border border-[#D9D3C0] max-w-md w-full p-6 sm:p-8 shadow-xl space-y-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9D3C0]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center">
              <FolderTree size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#10201F]">
                {department ? 'Edit Department' : 'Create Custom Department'}
              </h3>
              <p className="text-2xs text-[#10201F]/60">
                Define an operational workspace unit for your business
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
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Pastry & Confectionery"
              className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
              Operational Scope & Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Describe the department's core responsibilities and functions..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
              Department Manager / Head
            </label>
            <input
              type="text"
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              placeholder="Manager full name"
              className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#D9D3C0]/60">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {department ? 'Save Department' : 'Create Department'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
