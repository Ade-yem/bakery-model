/**
 * @file Modal dialog for defining or editing a department operational duty.
 */

import React, { useState, useEffect } from 'react';
import { X, CheckSquare } from 'lucide-react';
import type { DepartmentDuty } from '../../types';
import { Button } from '../../../../components/shared/Button';

export interface DutyEditorModalProps {
  isOpen: boolean;
  duty: DepartmentDuty | null;
  onClose: () => void;
  onSave: (duty: DepartmentDuty) => void;
}

export function DutyEditorModal({ isOpen, duty, onClose, onSave }: DutyEditorModalProps): React.ReactElement | null {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (duty) {
      setTitle(duty.title);
      setDescription(duty.description);
    } else {
      setTitle('');
      setDescription('');
    }
  }, [duty, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: duty ? duty.id : `duty-${Date.now()}`,
      title,
      description,
      assignedRoleIds: duty ? duty.assignedRoleIds : [],
      assignedStaffIds: duty ? duty.assignedStaffIds : [],
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl border border-[#D9D3C0] max-w-md w-full p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#D9D3C0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center">
              <CheckSquare size={16} />
            </div>
            <h3 className="text-base font-black text-[#10201F]">
              {duty ? 'Edit Operational Duty' : 'Add Department Duty'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-xl text-[#10201F]/50 hover:text-[#10201F] hover:bg-[#F6F3EA]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
              Duty Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flour Hydration & Batch Kneading"
              className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
              Duty Description & Procedure
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Specify standard operating procedures, checklist steps, or criteria..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs focus:outline-none focus:border-[#0B5C63] focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D9D3C0]/60">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Duty
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
