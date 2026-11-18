/**
 * @file Main directory and overview page for Cadence Platform Admin Subscription Plans.
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PlansOverviewCards } from './components/PlansOverviewCards';
import { PlansFiltersBar } from './components/PlansFiltersBar';
import { PlanMobileFilters } from './components/PlanMobileFilters';
import { PlansTable } from './components/PlansTable';
import { PlanMobileCard } from './components/PlanMobileCard';
import { PlanStatusModal } from './components/PlanStatusModal';
import { MOCK_SUBSCRIPTION_PLANS } from '../mock-plans';
import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '../permissions';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { PlatformSubscriptionPlan, PlanFilterState } from '../types';

export interface PlansOverviewPageProps {
  /** Optional authenticated actor. */
  actor?: AuthenticatedActor;
  /** Optional dataset override. */
  plans?: PlatformSubscriptionPlan[];
}

/**
 * @description Subscription Plans overview page providing KPI cards, search, filtering, and plan lifecycle operations.
 * @param {PlansOverviewPageProps} props - Component properties.
 * @returns {React.ReactElement} Overview page element.
 */
export function PlansOverviewPage({
  actor,
  plans: initialPlans = MOCK_SUBSCRIPTION_PLANS,
}: PlansOverviewPageProps): React.ReactElement {
  const [plansList, setPlansList] = useState<PlatformSubscriptionPlan[]>(initialPlans);
  const [filters, setFilters] = useState<PlanFilterState>({
    search: '',
    status: 'all',
    billingPeriod: 'all',
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedPlanForStatus, setSelectedPlanForStatus] =
    useState<PlatformSubscriptionPlan | null>(null);

  const canManage = hasPlatformPermission(actor, PLATFORM_PERMISSIONS.PLANS_MANAGE);

  const filteredPlans = useMemo(() => {
    return plansList.filter((plan) => {
      if (
        filters.search &&
        !plan.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !plan.description.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.status !== 'all' && plan.status !== filters.status) {
        return false;
      }
      if (
        filters.billingPeriod !== 'all' &&
        plan.billingPeriod !== filters.billingPeriod
      ) {
        return false;
      }
      return true;
    });
  }, [plansList, filters]);

  const handleConfirmStatus = (
    plan: PlatformSubscriptionPlan,
    nextStatus: 'active' | 'archived'
  ) => {
    setPlansList((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, status: nextStatus } : p))
    );
    setSelectedPlanForStatus(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#10201F] tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-xs sm:text-sm text-[#10201F]/70 mt-1">
            Configure pricing tiers, included modules, and usage quotas for client businesses.
          </p>
        </div>

        {canManage && (
          <Link
            to="/admin/plans/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B5C63] text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#0B5C63]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </Link>
        )}
      </div>

      {/* Metric Summary Cards */}
      <PlansOverviewCards plans={plansList} />

      {/* Filter and Search Bar */}
      <PlansFiltersBar
        filters={filters}
        onChange={setFilters}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
      />

      <PlanMobileFilters
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={() =>
          setFilters({ search: '', status: 'all', billingPeriod: 'all' })
        }
      />

      {/* Directory Records: Desktop Table & Mobile Stacked Cards */}
      {filteredPlans.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-[#D9D3C0] bg-white">
          <p className="text-sm font-semibold text-[#10201F]/70">
            No subscription plans found matching your criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <PlansTable
              plans={filteredPlans}
              canManage={canManage}
              onToggleStatus={setSelectedPlanForStatus}
            />
          </div>

          <div className="md:hidden space-y-3">
            {filteredPlans.map((plan) => (
              <PlanMobileCard
                key={plan.id}
                plan={plan}
                canManage={canManage}
                onToggleStatus={setSelectedPlanForStatus}
              />
            ))}
          </div>
        </>
      )}

      {/* Status Confirmation Modal */}
      <PlanStatusModal
        plan={selectedPlanForStatus}
        onClose={() => setSelectedPlanForStatus(null)}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
}
