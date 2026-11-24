/**
 * @file Accessible confirmation dialog for destructive or state-modifying actions.
 */

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../../../components/shared/Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps): React.ReactElement | null {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
    >
      <div className="bg-white rounded-3xl border border-[#D9D3C0] max-w-md w-full p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8C1D18]/10 text-[#8C1D18] flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <h3 id="confirm-dialog-title" className="text-base font-extrabold text-[#10201F]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="p-1 rounded-xl text-[#10201F]/60 hover:text-[#10201F] hover:bg-[#F6F3EA]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#10201F]/70 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'copper' : 'primary'}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
