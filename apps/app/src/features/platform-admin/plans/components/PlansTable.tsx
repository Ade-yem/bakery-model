/**
 * @file Data table presenting subscription plans with alternating row colors and pagination.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit2, Archive, CheckCircle2 } from 'lucide-react';
import type { PlatformSubscriptionPlan } from '../../types';

export interface PlansTableProps {
  /** Filtered list of plans to display. */
  plans: PlatformSubscriptionPlan[];
  /** Whether the actor possesses platform.plans.manage permission. */
  canManage: boolean;
  /** Callback to trigger archive or activate confirmation modal. */
  onToggleStatus: (plan: PlatformSubscriptionPlan) => void;
}

/**
 * @description Table displaying platform subscription plans with alternating row background colors and View More pagination.
 * @param {PlansTableProps} props - Component properties.
 * @returns {React.ReactElement} Table element.
 */
export function PlansTable({
  plans,
  canManage,
  onToggleStatus,
}: PlansTableProps): React.ReactElement {
  const [visibleCount, setVisibleCount] = useState<number>(10);

  const displayedPlans = plans.slice(0, visibleCount);
  const hasMore = plans.length > visibleCount;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-[#D9D3C0] shadow-xs">
        <table className="w-full text-left text-sm font-sans border-collapse">
          <thead>
            <tr className="bg-[#10201F] text-[#F6F3EA] text-xs font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Plan Name</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Billing Period</th>
              <th className="py-3.5 px-4">Included Modules</th>
              <th className="py-3.5 px-4">Usage Limits</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C0]/60">
            {displayedPlans.map((plan) => {
              const isArchived = plan.status === 'archived';

              return (
                <tr
                  key={plan.id}
                  className="odd:bg-[#EFEBDB] even:bg-[#F6F3EA] hover:bg-[#FDFCF7] transition-colors"
                >
                  {/* Plan Name & Description */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <Link
                      to={`/admin/plans/${plan.id}`}
                      className="font-bold text-[#10201F] hover:text-[#0B5C63] transition-colors block truncate"
                    >
                      {plan.name}
                    </Link>
                    <p className="text-xs text-[#10201F]/70 line-clamp-1 mt-0.5">
                      {plan.description}
                    </p>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-bold text-[#10201F] whitespace-nowrap">
                    ₦{plan.price.toLocaleString()}
                  </td>

                  {/* Billing Period */}
                  <td className="py-3.5 px-4 capitalize text-[#10201F]/80 whitespace-nowrap">
                    {plan.billingPeriod}
                  </td>

                  {/* Included Modules */}
                  <td className="py-3.5 px-4 text-xs text-[#10201F]/80 max-w-xs">
                    <span className="line-clamp-2">{plan.includedModules.join(', ')}</span>
                  </td>

                  {/* Usage Limits */}
                  <td className="py-3.5 px-4 text-xs text-[#10201F]/80 whitespace-nowrap">
                    <div>
                      {plan.usageLimits.staffAccounts === 'unlimited'
                        ? 'Unlimited Staff'
                        : `${plan.usageLimits.staffAccounts} Staff`}
                    </div>
                    <div className="text-[11px] text-[#10201F]/60">
                      {plan.usageLimits.departments === 'unlimited'
                        ? 'Unlimited Depts'
                        : `${plan.usageLimits.departments} Depts`}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        isArchived
                          ? 'bg-[#A9501A]/10 text-[#A9501A] border border-[#A9501A]/20'
                          : 'bg-[#2C571D]/10 text-[#2C571D] border border-[#2C571D]/20'
                      }`}
                    >
                      {plan.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/plans/${plan.id}`}
                        aria-label={`View details for ${plan.name}`}
                        className="p-1.5 rounded-md text-[#10201F]/70 hover:text-[#0B5C63] hover:bg-white transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {canManage && (
                        <>
                          <Link
                            to={`/admin/plans/${plan.id}/edit`}
                            aria-label={`Edit ${plan.name}`}
                            className="p-1.5 rounded-md text-[#10201F]/70 hover:text-[#0B5C63] hover:bg-white transition-colors"
                            title="Edit Plan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => onToggleStatus(plan)}
                            aria-label={
                              isArchived
                                ? `Activate ${plan.name}`
                                : `Archive ${plan.name}`
                            }
                            className={`p-1.5 rounded-md transition-colors ${
                              isArchived
                                ? 'text-[#2C571D] hover:bg-[#2C571D]/10'
                                : 'text-[#A9501A] hover:bg-[#A9501A]/10'
                            }`}
                            title={isArchived ? 'Activate Plan' : 'Archive Plan'}
                          >
                            {isArchived ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Archive className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination View More */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-5 py-2 text-xs font-bold rounded-lg border border-[#D9D3C0] bg-white text-[#10201F] hover:bg-[#F6F3EA] shadow-xs transition-colors"
          >
            View More ({plans.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
