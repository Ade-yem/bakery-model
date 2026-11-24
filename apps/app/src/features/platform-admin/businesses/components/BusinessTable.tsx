/**
 * @file Data table presenting the SaaS Platform Business Directory with action triggers.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, AlertOctagon, Building2 } from 'lucide-react';
import { BusinessMobileCard } from './BusinessMobileCard';
import type { PlatformBusiness } from '../../types';
import { EmptyState } from '../../../../components/shared';

export interface BusinessTableProps {
  /** Filtered businesses to display. */
  businesses: PlatformBusiness[];
  /** Whether the current actor holds management permission. */
  canManage: boolean;
  /** Callback when user clicks activate/suspend action. */
  onRequestStatusChange: (business: PlatformBusiness, targetStatus: 'active' | 'suspended') => void;
}

/**
 * @description Renders a responsive table of registered businesses with status badges and action menus.
 * @param {BusinessTableProps} props - Table properties.
 * @returns {React.ReactElement} Table element.
 * @example
 * ```tsx
 * <BusinessTable businesses={list} canManage={true} onRequestStatusChange={handleStatus} />
 * ```
 */
export function BusinessTable({
  businesses,
  canManage,
  onRequestStatusChange,
}: BusinessTableProps): React.ReactElement {
  if (businesses.length === 0) {
    return (
      <EmptyState
        variant="no-search-results"
        icon={<Building2 className="w-8 h-8" />}
        title="No businesses found"
        description="No registered bakery businesses match your current search and filter criteria. Try adjusting your query or resetting filters."
      />
    );
  }

  return (
    <div className="bg-white border border-[#D9D3C0] rounded-2xl shadow-xs overflow-hidden font-sans">
      {/* Mobile Card Layout (Visible on Small Screens) */}
      <div className="md:hidden divide-y divide-[#E5E0D0]">
        {businesses.map((biz) => (
          <BusinessMobileCard
            key={`mobile-${biz.id}`}
            business={biz}
            canManage={canManage}
            onRequestStatusChange={onRequestStatusChange}
          />
        ))}
      </div>

      {/* Desktop Responsive Data Table (Hidden on Mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D9D3C0] bg-[#F6F3EA]/60 text-xs font-bold text-[#10201F]/80 uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4 sm:px-6">Business Name</th>
              <th scope="col" className="py-3.5 px-4 hidden md:table-cell">Business Email</th>
              <th scope="col" className="py-3.5 px-4">Primary Admin</th>
              <th scope="col" className="py-3.5 px-4">Plan</th>
              <th scope="col" className="py-3.5 px-4 hidden lg:table-cell">Registration Date</th>
              <th scope="col" className="py-3.5 px-4">Account Status</th>
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E0D0] text-sm">
            {businesses.map((biz) => {
              const isActive = biz.accountStatus === 'active';
              const isSuspended = biz.accountStatus === 'suspended';
              const isPending = biz.accountStatus === 'pending';

              return (
                <tr
                  key={biz.id}
                  className="hover:bg-[#F9F7F1]/60 transition-colors group"
                >
                  {/* Business Name & ID */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="font-bold text-[#10201F] flex items-center gap-2">
                      <Link
                        to={`/admin/businesses/${biz.id}`}
                        className="hover:text-[#0B5C63] transition-colors"
                      >
                        {biz.name}
                      </Link>
                    </div>
                    <div className="text-xs text-[#10201F]/50 flex items-center gap-2 mt-0.5">
                      <span>{biz.id}</span>
                      <span>•</span>
                      <span>{biz.branchesCount} branch{biz.branchesCount === 1 ? '' : 'es'}</span>
                    </div>
                  </td>

                  {/* Business Email */}
                  <td className="py-3.5 px-4 hidden md:table-cell text-xs text-[#10201F]/70 font-mono">
                    {biz.email}
                  </td>

                  {/* Primary Admin */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[#10201F] text-xs sm:text-sm">
                      {biz.primaryAdminName}
                    </div>
                    <div className="text-[11px] text-[#10201F]/60 truncate max-w-[150px]">
                      {biz.primaryAdminEmail}
                    </div>
                  </td>

                  {/* Subscription Plan */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                      biz.plan === 'Business' ? 'bg-[#0B5C63]/10 text-[#0B5C63]' : biz.plan === 'Growth' ? 'bg-[#A9501A]/10 text-[#A9501A]' : 'bg-[#10201F]/10 text-[#10201F]'
                    }`}>
                      {biz.plan}
                    </span>
                  </td>

                  {/* Registration Date */}
                  <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-[#10201F]/70">
                    {biz.registrationDate}
                  </td>

                  {/* Account Status */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isActive ? 'bg-[#EBF3E8] text-[#2C571D] border-[#CBE2C4]' : isSuspended ? 'bg-[#FDF2F2] text-[#8C1D18] border-[#F5C2C0]' : 'bg-[#FEF3EB] text-[#A9501A] border-[#FAD7C0]'
                    } border`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#2C571D]' : isSuspended ? 'bg-[#8C1D18]' : 'bg-[#A9501A]'}`} />
                      <span className="capitalize">{biz.accountStatus}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/businesses/${biz.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#0B5C63] hover:bg-[#0B5C63]/10 transition-colors cursor-pointer"
                        title="View complete business profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View Details</span>
                      </Link>

                      {canManage && (
                        <div className="inline-flex items-center gap-1">
                          {isActive && (
                            <button
                              type="button"
                              onClick={() => onRequestStatusChange(biz, 'suspended')}
                              className="action-status-trigger inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#8C1D18] hover:bg-[#8C1D18]/10 transition-colors cursor-pointer"
                              title="Suspend business account"
                            >
                              <AlertOctagon className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Suspend</span>
                            </button>
                          )}

                          {(isSuspended || isPending) && (
                            <button
                              type="button"
                              onClick={() => onRequestStatusChange(biz, 'active')}
                              className="action-status-trigger inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#2C571D] hover:bg-[#2C571D]/10 transition-colors cursor-pointer"
                              title="Activate business account"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Activate</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
