/**
 * @file Mobile card representation of a SaaS Platform Business.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, AlertOctagon, User, Mail, Calendar } from 'lucide-react';
import type { PlatformBusiness } from '../../types';

export interface BusinessMobileCardProps {
  /** Target business account. */
  business: PlatformBusiness;
  /** Whether the administrator possesses management permission. */
  canManage: boolean;
  /** Status change request callback. */
  onRequestStatusChange: (business: PlatformBusiness, targetStatus: 'active' | 'suspended') => void;
}

/**
 * @description Renders a touch-friendly mobile card for a registered business with contextual actions.
 * @param {BusinessMobileCardProps} props - Component properties.
 * @returns {React.ReactElement} Business card element.
 * @example
 * ```tsx
 * <BusinessMobileCard business={item} canManage={canManage} onRequestStatusChange={handleStatus} />
 * ```
 */
export function BusinessMobileCard({
  business,
  canManage,
  onRequestStatusChange,
}: BusinessMobileCardProps): React.ReactElement {
  const isActive = business.accountStatus === 'active';
  const isSuspended = business.accountStatus === 'suspended';

  return (
    <div className="business-mobile-card p-4 space-y-3 font-sans hover:bg-[#F9F7F1]/60 transition-colors">
      {/* Header: Name, ID, and Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            to={`/admin/businesses/${business.id}`}
            className="font-bold text-sm text-[#10201F] hover:text-[#0B5C63] transition-colors truncate block"
          >
            {business.name}
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#10201F]/50 mt-0.5">
            <span>{business.id}</span>
            <span>•</span>
            <span>{business.branchesCount} branch{business.branchesCount === 1 ? '' : 'es'}</span>
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
          <span className="capitalize">{business.accountStatus}</span>
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs py-1.5 border-y border-[#E5E0D0]/80">
        <div>
          <span className="text-[#10201F]/50 text-[11px] block">Plan Tier</span>
          <span
            className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-semibold ${
              business.plan === 'Business'
                ? 'bg-[#0B5C63]/10 text-[#0B5C63]'
                : business.plan === 'Growth'
                  ? 'bg-[#A9501A]/10 text-[#A9501A]'
                  : 'bg-[#10201F]/10 text-[#10201F]'
            }`}
          >
            {business.plan}
          </span>
        </div>

        <div>
          <span className="text-[#10201F]/50 text-[11px] block flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Registered</span>
          </span>
          <span className="font-medium text-[#10201F] mt-0.5 block">{business.registrationDate}</span>
        </div>

        <div className="col-span-2 pt-1 flex items-center justify-between text-xs">
          <div className="min-w-0 flex items-center gap-1.5 text-[#10201F]/70">
            <User className="w-3.5 h-3.5 text-[#0B5C63] shrink-0" />
            <span className="font-semibold text-[#10201F] truncate">{business.primaryAdminName}</span>
          </div>
          <div className="min-w-0 flex items-center gap-1.5 text-[#10201F]/60 text-[11px]">
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[150px]">{business.email}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Link
          to={`/admin/businesses/${business.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0B5C63] bg-[#0B5C63]/10 hover:bg-[#0B5C63]/20 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </Link>

        {canManage && (
          <div>
            {isActive ? (
              <button
                type="button"
                onClick={() => onRequestStatusChange(business, 'suspended')}
                className="action-status-trigger inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#8C1D18] bg-[#8C1D18]/10 hover:bg-[#8C1D18]/20 transition-colors cursor-pointer"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Suspend</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onRequestStatusChange(business, 'active')}
                className="action-status-trigger inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#2C571D] bg-[#2C571D]/10 hover:bg-[#2C571D]/20 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Activate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
