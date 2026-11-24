/**
 * @file Confirmation modal for committing platform-wide settings updates.
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface SettingsConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}

/**
 * @description Dialog confirming before applying global platform configuration changes.
 * @param {SettingsConfirmModalProps} props - Component properties.
 * @returns {React.ReactElement | null} Modal element.
 */
export function SettingsConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isSaving,
}: SettingsConfirmModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10201F]/50 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#D9D3C0] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-[#A9501A]/10 text-[#A9501A]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-md text-[#10201F]/50 hover:text-[#10201F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#10201F]">
            Apply Platform Configuration Changes?
          </h3>
          <p className="text-sm text-[#10201F]/70 mt-1">
            Updating platform settings modifies global behaviors for all client businesses and platform operations. This action will be logged in the immutable Audit trail.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-[#D9D3C0]">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-[#D9D3C0] text-sm font-semibold text-[#10201F]/80 hover:bg-[#F6F3EA]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onConfirm}
            className="flex-1 py-2 px-4 rounded-lg bg-[#0B5C63] text-white text-sm font-bold shadow-xs hover:bg-[#0B5C63]/90 disabled:opacity-50"
          >
            {isSaving ? 'Applying...' : 'Confirm & Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
