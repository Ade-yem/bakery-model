/**
 * @file Business Details read-only inspection page for Platform Administrators.
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  User,
  CheckCircle2,
  AlertOctagon,
  History,
  FileText,
  Clock,
} from 'lucide-react';
import { AdminPageHeader } from '../AdminPageHeader';
import { BusinessStatusModal } from './components/BusinessStatusModal';
import { MOCK_PLATFORM_BUSINESSES } from '../mock-businesses';
import { PLATFORM_PERMISSIONS, hasPlatformPermission } from '../permissions';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { PlatformBusiness } from '../types';

export interface BusinessDetailsPageProps {
  /** Authenticated administrator. */
  actor?: AuthenticatedActor;
}

/**
 * @description Detailed inspection view for an individual registered bakery enterprise.
 * @param {BusinessDetailsPageProps} props - Component properties.
 * @returns {React.ReactElement} Business details page.
 * @example
 * ```tsx
 * <BusinessDetailsPage actor={actor} />
 * ```
 */
export function BusinessDetailsPage({ actor }: BusinessDetailsPageProps): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [businesses, setBusinesses] = useState<PlatformBusiness[]>(MOCK_PLATFORM_BUSINESSES);
  const [modalTargetStatus, setModalTargetStatus] = useState<'active' | 'suspended' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const business = businesses.find((b) => b.id === id);
  const canManage = hasPlatformPermission(actor, PLATFORM_PERMISSIONS.BUSINESSES_MANAGE);

  if (!business) {
    return (
      <div className="space-y-6 font-sans">
        <Link
          to="/admin/businesses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B5C63] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Businesses</span>
        </Link>
        <div className="bg-white border border-[#D9D3C0] rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#8C1D18]/10 text-[#8C1D18] flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#10201F]">Business Not Found</h2>
          <p className="text-xs text-[#10201F]/60 mt-1 max-w-sm mx-auto">
            The requested business identifier &quot;{id}&quot; does not exist in the platform tenant registry.
          </p>
          <div className="mt-5">
            <Link
              to="/admin/businesses"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B5C63] text-white text-xs font-semibold rounded-xl hover:bg-[#0F7480] transition-colors"
            >
              Return to Business Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isActive = business.accountStatus === 'active';
  const isSuspended = business.accountStatus === 'suspended';

  const handleConfirmStatusChange = (
    businessId: string,
    newStatus: 'active' | 'suspended'
  ) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, accountStatus: newStatus } : b))
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/admin/businesses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B5C63] hover:underline cursor-pointer min-h-[36px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Businesses</span>
        </Link>

        {/* Status Actions */}
        {canManage && (
          <div className="flex items-center gap-2">
            {isActive ? (
              <button
                type="button"
                onClick={() => {
                  setModalTargetStatus('suspended');
                  setIsModalOpen(true);
                }}
                className="action-status-trigger w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8C1D18] bg-[#8C1D18]/10 hover:bg-[#8C1D18]/20 transition-colors cursor-pointer min-h-[40px]"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Suspend Account</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setModalTargetStatus('active');
                  setIsModalOpen(true);
                }}
                className="action-status-trigger w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2C571D] bg-[#2C571D]/10 hover:bg-[#2C571D]/20 transition-colors cursor-pointer min-h-[40px]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Activate Account</span>
              </button>
            )}
          </div>
        )}
      </div>

      <AdminPageHeader
        title={business.name}
        description={`Enterprise profile, subscription status, and platform audit records for ${business.id}.`}
      />

      {/* Main Grid: Profile & Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business Profile & Primary Admin */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile & Contact Details Card */}
          <div className="bg-white border border-[#D9D3C0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D0] pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center font-bold text-base sm:text-lg shrink-0">
                  {business.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#10201F] truncate">{business.name}</h3>
                  <p className="text-xs text-[#10201F]/60">Registered ID: {business.id}</p>
                </div>
              </div>
              <span
                className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isActive
                    ? 'bg-[#EBF3E8] text-[#2C571D] border border-[#CBE2C4]'
                    : isSuspended
                      ? 'bg-[#FDF2F2] text-[#8C1D18] border border-[#F5C2C0]'
                      : 'bg-[#FEF3EB] text-[#A9501A] border border-[#FAD7C0]'
                }`}
              >
                <span className="capitalize">{business.accountStatus}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F6F3EA]/50 border border-[#D9D3C0]/60 min-w-0">
                <Mail className="w-4 h-4 text-[#0B5C63] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[#10201F]/60">Business Email</p>
                  <p className="font-semibold text-[#10201F] truncate break-all">{business.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F6F3EA]/50 border border-[#D9D3C0]/60 min-w-0">
                <Phone className="w-4 h-4 text-[#0B5C63] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[#10201F]/60">Phone</p>
                  <p className="font-semibold text-[#10201F] truncate">{business.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F6F3EA]/50 border border-[#D9D3C0]/60 min-w-0 sm:col-span-2">
                <MapPin className="w-4 h-4 text-[#0B5C63] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[#10201F]/60">Registered Address</p>
                  <p className="font-semibold text-[#10201F] truncate">{business.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F6F3EA]/50 border border-[#D9D3C0]/60 min-w-0 sm:col-span-2">
                <FileText className="w-4 h-4 text-[#0B5C63] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[#10201F]/60">Corporate Registry (RC)</p>
                  <p className="font-semibold text-[#10201F]">{business.registrationNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Administrator Information */}
          <div className="bg-white border border-[#D9D3C0] rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#10201F] flex items-center gap-2">
              <User className="w-4 h-4 text-[#0B5C63]" />
              <span>Primary Administrator</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[#10201F]/60">Full Name</p>
                <p className="font-bold text-[#10201F] text-sm mt-0.5">{business.primaryAdminName}</p>
              </div>
              <div>
                <p className="text-[#10201F]/60">Admin Email</p>
                <p className="font-medium text-[#10201F] mt-0.5">{business.primaryAdminEmail}</p>
              </div>
              <div>
                <p className="text-[#10201F]/60">Contact Phone</p>
                <p className="font-medium text-[#10201F] mt-0.5">{business.primaryAdminPhone}</p>
              </div>
            </div>
          </div>

          {/* Platform Activity History */}
          <div className="bg-white border border-[#D9D3C0] rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#10201F] flex items-center gap-2">
              <History className="w-4 h-4 text-[#0B5C63]" />
              <span>Platform Activity History</span>
            </h4>

            <div className="divide-y divide-[#E5E0D0] text-xs">
              {(business.recentActivity || []).length > 0 ? (
                business.recentActivity!.map((act) => (
                  <div key={act.id} className="py-3 flex items-start justify-between">
                    <div>
                      <p className="font-bold text-[#10201F]">{act.title}</p>
                      <p className="text-[#10201F]/70 mt-0.5">{act.description}</p>
                      {act.actorName && (
                        <p className="text-[11px] text-[#10201F]/50 mt-1">Actor: {act.actorName}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-[#10201F]/50 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {act.timestamp}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-[#10201F]/50">
                  No recent security or ledger events logged for this enterprise.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Subscription & Registration Details */}
        <div className="space-y-6">
          {/* Subscription Details Card */}
          <div className="bg-white border border-[#D9D3C0] rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#10201F] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0B5C63]" />
              <span>Subscription Details</span>
            </h4>

            <div className="p-4 rounded-xl bg-[#F6F3EA]/70 border border-[#D9D3C0]/80 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#10201F]/70">Plan Tier</span>
                <span className="font-extrabold text-[#0B5C63] text-sm">{business.plan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#10201F]/70">Billing Cycle</span>
                <span className="font-semibold text-[#10201F]">{business.billingCycle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#10201F]/70">Current Rate</span>
                <span className="font-bold text-[#10201F]">{business.subscriptionPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#10201F]/70">Subscription Status</span>
                <span className="capitalize font-semibold text-[#2C571D]">
                  {business.subscriptionStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E5E0D0] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#10201F]/60 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0B5C63]" />
                  <span>Cycle Start</span>
                </span>
                <span className="font-mono text-[#10201F]">{business.subscriptionStartDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#10201F]/60 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#A9501A]" />
                  <span>Cycle Expiry</span>
                </span>
                <span className="font-mono text-[#10201F]">{business.subscriptionExpiryDate}</span>
              </div>
            </div>
          </div>

          {/* Registration Details Card */}
          <div className="bg-white border border-[#D9D3C0] rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#10201F]">Registration Details</h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#10201F]/60">Platform Registration</span>
                <span className="font-medium text-[#10201F]">{business.registrationDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#10201F]/60">Registered Branches</span>
                <span className="font-bold text-[#10201F]">{business.branchesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#10201F]/60">Active Shifts</span>
                <span className="font-bold text-[#0B5C63]">{business.activeShifts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#10201F]/60">Last Platform Heartbeat</span>
                <span className="text-[#10201F]/70">{business.lastActive}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <BusinessStatusModal
        business={business}
        targetStatus={modalTargetStatus}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
