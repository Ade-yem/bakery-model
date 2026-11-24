/**
 * @file Modal dialog for creating and editing a branch location within subscription limits.
 */

import React, { useState, useEffect } from 'react';
import { X, Store, AlertCircle } from 'lucide-react';
import type { ClientBranch } from '../../types';
import { Button } from '../../../../components/shared/Button';

export interface BranchModalProps {
  isOpen: boolean;
  branch: ClientBranch | null;
  onClose: () => void;
  onSave: (data: Omit<ClientBranch, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => { success: boolean; error?: string };
}

export function BranchModal({ isOpen, branch, onClose, onSave }: BranchModalProps): React.ReactElement | null {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    managerName: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        code: branch.code,
        address: branch.address,
        contactEmail: branch.contactEmail,
        contactPhone: branch.contactPhone,
        managerName: branch.managerName || '',
        status: branch.status,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        managerName: '',
        status: 'active',
      });
    }
    setError(null);
  }, [branch, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.address.trim()) {
      setError('Branch name, branch code, and address are required.');
      return;
    }

    const res = onSave(formData);
    if (!res.success) {
      setError(res.error || 'Failed to save branch.');
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
              <Store size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#10201F]">
                {branch ? 'Edit Branch Location' : 'Create New Branch'}
              </h3>
              <p className="text-2xs text-[#10201F]/60">
                {branch ? 'Update branch address and manager' : 'Add an operational location to your chain'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close branch modal"
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
            <div className="sm:col-span-2">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Branch Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Lekki Main Branch"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Branch Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. LEK-01"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white uppercase font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Branch Manager
              </label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                placeholder="Manager name"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Physical Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, city"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="branch@bakery.com"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+234..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#D9D3C0]/60">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {branch ? 'Save Branch' : 'Create Branch'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
