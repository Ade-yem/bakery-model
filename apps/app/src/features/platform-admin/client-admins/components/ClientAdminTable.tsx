/**
 * @file Data table presenting Primary Client Administrator accounts across bakery tenants.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, UserCheck, Users } from 'lucide-react';
import { ClientAdminMobileCard } from './ClientAdminMobileCard';
import type { PlatformClientAdmin } from '../../types';
import { EmptyState } from '../../../../components/shared';

export interface ClientAdminTableProps {
  /** Array of administrators to display. */
  admins: PlatformClientAdmin[];
  /** Whether the actor possesses manage permission. */
  canManage: boolean;
  /** Callback to open details modal. */
  onSelectAdmin: (admin: PlatformClientAdmin) => void;
  /** Callback to toggle administrator account status. */
  onToggleStatus?: (admin: PlatformClientAdmin) => void;
}

/**
 * @description Responsive data table listing primary client administrators and linked bakery tenants.
 * @param {ClientAdminTableProps} props - Component properties.
 * @returns {React.ReactElement} Table component.
 * @example
 * ```tsx
 * <ClientAdminTable admins={admins} canManage={canManage} onSelectAdmin={handleSelect} />
 * ```
 */
export function ClientAdminTable({
  admins,
  canManage,
  onSelectAdmin,
  onToggleStatus,
}: ClientAdminTableProps): React.ReactElement {
  if (admins.length === 0) {
    return (
      <EmptyState
        variant="no-search-results"
        icon={<Users className="w-8 h-8" />}
        title="No administrators found"
        description="No primary client administrators match your current search and filter criteria. Try resetting your filters."
      />
    );
  }

  return (
    <div className="bg-white border border-[#D9D3C0] rounded-2xl shadow-xs overflow-hidden font-sans">
      {/* Mobile Card Layout (Visible on Small Screens) */}
      <div className="md:hidden divide-y divide-[#E5E0D0]">
        {admins.map((admin) => (
          <ClientAdminMobileCard
            key={`mobile-${admin.id}`}
            admin={admin}
            canManage={canManage}
            onSelectAdmin={onSelectAdmin}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>

      {/* Desktop Responsive Data Table (Hidden on Mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D9D3C0] bg-[#F6F3EA]/60 text-xs font-bold text-[#10201F]/80 uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4 sm:px-6">Administrator</th>
              <th scope="col" className="py-3.5 px-4 hidden md:table-cell">Email Address</th>
              <th scope="col" className="py-3.5 px-4">Linked Business</th>
              <th scope="col" className="py-3.5 px-4">Account Status</th>
              <th scope="col" className="py-3.5 px-4 hidden lg:table-cell">Created Date</th>
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E0D0] text-sm">
            {admins.map((admin) => {
              const isActive = admin.status === 'active';
              const isSuspended = admin.status === 'suspended';

              return (
                <tr
                  key={admin.id}
                  className="client-admin-row hover:bg-[#F9F7F1]/60 transition-colors group"
                >
                  {/* Administrator Name & Role */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0B5C63]/15 text-[#0B5C63] flex items-center justify-center text-xs font-bold shrink-0">
                        {admin.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-[#10201F] text-xs sm:text-sm">
                          {admin.fullName}
                        </div>
                        <div className="text-[11px] text-[#0B5C63] font-medium">
                          {admin.roleTitle}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email Address */}
                  <td className="py-3.5 px-4 hidden md:table-cell text-xs text-[#10201F]/70 font-mono">
                    {admin.email}
                  </td>

                  {/* Linked Business */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/admin/businesses/${admin.businessId}`}
                      className="font-medium text-[#10201F] hover:text-[#0B5C63] text-xs sm:text-sm transition-colors flex items-center gap-1.5"
                    >
                      <span>{admin.businessName}</span>
                    </Link>
                    <div className="text-[11px] text-[#10201F]/50">
                      ID: {admin.businessId}
                    </div>
                  </td>

                  {/* Account Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isActive
                          ? 'bg-[#EBF3E8] text-[#2C571D] border border-[#CBE2C4]'
                          : isSuspended
                            ? 'bg-[#FDF2F2] text-[#8C1D18] border border-[#F5C2C0]'
                            : 'bg-[#FEF3EB] text-[#A9501A] border border-[#FAD7C0]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive
                            ? 'bg-[#2C571D]'
                            : isSuspended
                              ? 'bg-[#8C1D18]'
                              : 'bg-[#A9501A]'
                        }`}
                      />
                      <span className="capitalize">{admin.status}</span>
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-[#10201F]/70">
                    {admin.createdAt}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectAdmin(admin)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#0B5C63] hover:bg-[#0B5C63]/10 transition-colors cursor-pointer"
                        title="View administrator profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View Profile</span>
                      </button>

                      {canManage && onToggleStatus && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(admin)}
                          className="admin-action-manage-trigger inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#10201F]/70 hover:text-[#10201F] hover:bg-[#F6F3EA] transition-colors cursor-pointer"
                          title="Manage administrator account"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Status</span>
                        </button>
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
