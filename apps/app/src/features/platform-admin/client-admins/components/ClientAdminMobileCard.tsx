/**
 * @file Mobile card representation of a Client Administrator account.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Building2, Mail, Calendar, UserCheck } from 'lucide-react';
import type { PlatformClientAdmin } from '../../types';

export interface ClientAdminMobileCardProps {
  /** Target client administrator. */
  admin: PlatformClientAdmin;
  /** Whether the actor holds management permission. */
  canManage: boolean;
  /** Callback to view administrator profile dialog. */
  onSelectAdmin: (admin: PlatformClientAdmin) => void;
  /** Status toggle callback. */
  onToggleStatus?: (admin: PlatformClientAdmin) => void;
}

/**
 * @description Renders a touch-friendly mobile card for a primary client administrator.
 * @param {ClientAdminMobileCardProps} props - Component properties.
 * @returns {React.ReactElement} Administrator card element.
 * @example
 * ```tsx
 * <ClientAdminMobileCard admin={admin} canManage={canManage} onSelectAdmin={handleSelect} />
 * ```
 */
export function ClientAdminMobileCard({
  admin,
  canManage,
  onSelectAdmin,
  onToggleStatus,
}: ClientAdminMobileCardProps): React.ReactElement {
  const isActive = admin.status === 'active';
  const isSuspended = admin.status === 'suspended';

  return (
    <div className="client-admin-mobile-card p-4 space-y-3 font-sans hover:bg-[#F9F7F1]/60 transition-colors">
      {/* Top Header: Avatar, Name, Role & Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-[#0B5C63]/15 text-[#0B5C63] flex items-center justify-center text-xs font-bold shrink-0">
            {admin.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-[#10201F] truncate">{admin.fullName}</h4>
            <p className="text-[11px] text-[#0B5C63] font-medium truncate">{admin.roleTitle}</p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
            isActive
              ? 'bg-[#EBF3E8] text-[#2C571D] border border-[#CBE2C4]'
              : isSuspended
                ? 'bg-[#FDF2F2] text-[#8C1D18] border border-[#F5C2C0]'
                : 'bg-[#FEF3EB] text-[#A9501A] border border-[#FAD7C0]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-[#2C571D]' : isSuspended ? 'bg-[#8C1D18]' : 'bg-[#A9501A]'
            }`}
          />
          <span className="capitalize">{admin.status}</span>
        </span>
      </div>

      {/* Info Stack */}
      <div className="space-y-1.5 text-xs py-1.5 border-y border-[#E5E0D0]/80">
        {/* Email */}
        <div className="flex items-center gap-2 text-[#10201F]/70">
          <Mail className="w-3.5 h-3.5 text-[#0B5C63] shrink-0" />
          <span className="truncate font-mono text-[11px]">{admin.email}</span>
        </div>

        {/* Linked Business */}
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-[#0B5C63] shrink-0" />
          <Link
            to={`/admin/businesses/${admin.businessId}`}
            className="font-medium text-[#10201F] hover:text-[#0B5C63] truncate text-xs"
          >
            {admin.businessName}
          </Link>
          <span className="text-[10px] text-[#10201F]/40 shrink-0">({admin.businessId})</span>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2 text-[#10201F]/50 text-[11px]">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>Created on {admin.createdAt}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSelectAdmin(admin)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0B5C63] bg-[#0B5C63]/10 hover:bg-[#0B5C63]/20 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Profile</span>
        </button>

        {canManage && onToggleStatus && (
          <button
            type="button"
            onClick={() => onToggleStatus(admin)}
            className="admin-action-manage-trigger inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#10201F]/70 hover:text-[#10201F] bg-[#F6F3EA] hover:bg-[#EFEBDB] transition-colors cursor-pointer"
            title="Toggle account status"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Status</span>
          </button>
        )}
      </div>
    </div>
  );
}
