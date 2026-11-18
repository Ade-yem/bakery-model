/**
 * @file Recent businesses table component for Platform Admin Dashboard with empty state.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ExternalLink, ArrowRight } from 'lucide-react';
import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '../permissions';
import { MOCK_TENANT_BUSINESSES } from '../mock-data';
import type { TenantBusinessSummary } from '../types';
import type { AuthenticatedActor } from '../../../components/layout/types';

export interface RecentBusinessesTableProps {
  /** Business entities array. */
  businesses?: TenantBusinessSummary[];
  /** Current administrator actor. */
  actor?: AuthenticatedActor;
}

const PLAN_BADGE_STYLE: Record<TenantBusinessSummary['plan'], string> = {
  Starter: 'bg-flour text-oven-black border-rule',
  Growth: 'bg-verdigris/10 text-verdigris border-verdigris/30',
  Business: 'bg-copper/10 text-copper border-copper/30',
};

const STATUS_BADGE_STYLE: Record<TenantBusinessSummary['status'], string> = {
  active: 'bg-status-balanced/10 text-[#2C571D] border-status-balanced/30',
  trial: 'bg-verdigris/10 text-verdigris border-verdigris/30',
  past_due: 'bg-status-open/10 text-[#8A5A00] border-status-open/30',
  suspended: 'bg-status-unbalanced/10 text-[#8C1D18] border-status-unbalanced/30',
};

/**
 * @description Compact table presenting recently registered tenant enterprises with administrator and plan indicators.
 * @param {RecentBusinessesTableProps} props - Businesses list and active actor.
 * @returns {React.ReactElement} Table component.
 */
export function RecentBusinessesTable({
  businesses = MOCK_TENANT_BUSINESSES,
  actor,
}: RecentBusinessesTableProps): React.ReactElement {
  const canViewBusinesses = hasPlatformPermission(
    actor,
    PLATFORM_PERMISSIONS.BUSINESSES_VIEW
  );

  return (
    <div className="rounded-2xl bg-white border border-rule shadow-2xs overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="p-5 border-b border-[#E5E0D0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-verdigris/10 text-verdigris border border-verdigris/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-oven-black">Recent Businesses</h2>
              <p className="text-xs text-oven-black/60">
                Latest enterprise tenant registrations
              </p>
            </div>
          </div>

          {canViewBusinesses && (
            <Link
              to="/admin/businesses"
              className="text-xs font-semibold text-verdigris hover:text-verdigris-lift flex items-center gap-1 cursor-pointer"
            >
              <span>View all businesses</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Content / Empty State */}
        {businesses.length === 0 ? (
          <div className="text-center py-12 px-4 flex flex-col items-center">
            <Building2 className="w-8 h-8 text-oven-black/30 mb-2" />
            <p className="text-sm font-semibold text-oven-black">
              No businesses registered yet
            </p>
            <p className="text-xs text-oven-black/60 max-w-xs mt-0.5">
              New business registrations through the onboarding portal will display here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9F7F1] border-b border-[#E5E0D0] text-oven-black/70">
                <tr>
                  <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">
                    Business
                  </th>
                  <th scope="col" className="py-3 px-3 font-bold uppercase tracking-wider text-[11px]">
                    Primary Admin
                  </th>
                  <th scope="col" className="py-3 px-3 font-bold uppercase tracking-wider text-[11px]">
                    Registered
                  </th>
                  <th scope="col" className="py-3 px-3 font-bold uppercase tracking-wider text-[11px]">
                    Plan
                  </th>
                  <th scope="col" className="py-3 px-3 font-bold uppercase tracking-wider text-[11px]">
                    Status
                  </th>
                  <th scope="col" className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D0]">
                {businesses.slice(0, 5).map((biz) => (
                  <tr key={biz.id} className="hover:bg-flour/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-oven-black">{biz.name}</div>
                      <div className="text-xs text-oven-black/50">{biz.id}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-oven-black">{biz.ownerName}</div>
                      <div className="text-xs text-oven-black/60 truncate max-w-[160px]">
                        {biz.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-oven-black/70">
                      {biz.joinedDate}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${PLAN_BADGE_STYLE[biz.plan]}`}
                      >
                        {biz.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_BADGE_STYLE[biz.status]}`}
                      >
                        {biz.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {canViewBusinesses ? (
                        <Link
                          to={`/admin/businesses?id=${biz.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-verdigris hover:text-verdigris-lift cursor-pointer"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-xs text-oven-black/40 font-medium">Restricted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
