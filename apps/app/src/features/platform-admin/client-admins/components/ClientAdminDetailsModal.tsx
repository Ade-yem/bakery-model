/**
 * @file Modal dialog presenting Client Administrator account details and linked business context.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Building2, Calendar, Clock, X, ExternalLink } from 'lucide-react';
import type { PlatformClientAdmin } from '../../types';

export interface ClientAdminDetailsModalProps {
  /** Target client administrator. */
  admin: PlatformClientAdmin | null;
  /** Whether modal is currently open. */
  isOpen: boolean;
  /** Dismiss callback. */
  onClose: () => void;
}

/**
 * @description Modal dialog presenting primary client administrator details and linked business relationship.
 * @param {ClientAdminDetailsModalProps} props - Component properties.
 * @returns {React.ReactElement | null} Modal element or null when closed.
 * @example
 * ```tsx
 * <ClientAdminDetailsModal admin={selectedAdmin} isOpen={isOpen} onClose={() => setOpen(false)} />
 * ```
 */
export function ClientAdminDetailsModal({
  admin,
  isOpen,
  onClose,
}: ClientAdminDetailsModalProps): React.ReactElement | null {
  if (!isOpen || !admin) {
    return null;
  }

  const isActive = admin.status === 'active';
  const isSuspended = admin.status === 'suspended';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10201F]/60 backdrop-blur-xs font-sans animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#D9D3C0] shadow-xl p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#E5E0D0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0B5C63] text-[#F6F3EA] flex items-center justify-center font-bold text-base shadow-xs">
              {admin.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <h3 id="admin-details-title" className="text-base font-bold text-[#10201F]">
                {admin.fullName}
              </h3>
              <p className="text-xs text-[#0B5C63] font-semibold mt-0.5">{admin.roleTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-[#10201F]/50 hover:text-[#10201F] hover:bg-[#F6F3EA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#10201F] uppercase tracking-wider text-[#10201F]/70">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F6F3EA]/60 border border-[#D9D3C0]/60">
              <Mail className="w-4 h-4 text-[#0B5C63] shrink-0" />
              <div className="min-w-0">
                <p className="text-[#10201F]/60">Email</p>
                <p className="font-semibold text-[#10201F] truncate">{admin.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F6F3EA]/60 border border-[#D9D3C0]/60">
              <Phone className="w-4 h-4 text-[#0B5C63] shrink-0" />
              <div className="min-w-0">
                <p className="text-[#10201F]/60">Phone</p>
                <p className="font-semibold text-[#10201F]">{admin.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Business Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#10201F] uppercase tracking-wider text-[#10201F]/70">
            Associated Business Entity
          </h4>
          <div className="p-4 rounded-xl bg-[#F6F3EA]/70 border border-[#D9D3C0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#10201F]">{admin.businessName}</p>
                <p className="text-xs text-[#10201F]/60">Tenant ID: {admin.businessId}</p>
              </div>
            </div>
            <Link
              to={`/admin/businesses/${admin.businessId}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0B5C63] bg-white border border-[#D9D3C0] hover:bg-[#F6F3EA] transition-colors"
            >
              <span>View Business</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Status & Timestamps */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-[#F9F7F1] rounded-xl border border-[#E5E0D0] text-xs">
          <div>
            <p className="text-[#10201F]/60">Account Status</p>
            <span
              className={`inline-flex items-center gap-1 font-semibold mt-1 capitalize ${
                isActive
                  ? 'text-[#2C571D]'
                  : isSuspended
                    ? 'text-[#8C1D18]'
                    : 'text-[#A9501A]'
              }`}
            >
              {admin.status}
            </span>
          </div>
          <div>
            <p className="text-[#10201F]/60">Account Created</p>
            <p className="font-medium text-[#10201F] mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0B5C63]" />
              <span>{admin.createdAt}</span>
            </p>
          </div>
          <div>
            <p className="text-[#10201F]/60">Last Platform Active</p>
            <p className="font-medium text-[#10201F] mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#A9501A]" />
              <span>{admin.lastLoginAt}</span>
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#0B5C63] text-white text-xs font-semibold rounded-xl hover:bg-[#0F7480] transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
