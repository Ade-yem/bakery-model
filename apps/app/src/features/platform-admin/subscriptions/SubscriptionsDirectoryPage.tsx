/**
 * @file Platform Admin directory page for inspecting and managing all client business subscriptions.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { SubscriptionsOverviewCards } from './components/SubscriptionsOverviewCards';
import { SubscriptionsFiltersBar } from './components/SubscriptionsFiltersBar';
import { SubscriptionMobileFilters } from './components/SubscriptionMobileFilters';
import { SubscriptionsTable } from './components/SubscriptionsTable';
import { SubscriptionMobileCard } from './components/SubscriptionMobileCard';
import { SubscriptionActionModals } from './components/SubscriptionActionModals';
import { EmptyState, Pagination } from '../../../components/shared';
import { usePagination, paginateArray } from '../../../hooks/usePagination';
import { MOCK_PLATFORM_SUBSCRIPTIONS } from '../mock-subscriptions';
import { MOCK_SUBSCRIPTION_PLANS } from '../mock-plans';
import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '../permissions';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { PlatformSubscription, SubscriptionFilterState } from '../types';

export interface SubscriptionsDirectoryPageProps {
  /** Optional authenticated actor. */
  actor?: AuthenticatedActor;
  /** Optional subscriptions dataset. */
  subscriptions?: PlatformSubscription[];
}

/**
 * @description Subscriptions directory view presenting KPI cards, multi-criteria filters, and administrative actions.
 * @param {SubscriptionsDirectoryPageProps} props - Component properties.
 * @returns {React.ReactElement} Subscriptions directory page element.
 */
export function SubscriptionsDirectoryPage({
  actor,
  subscriptions: initialSubs = MOCK_PLATFORM_SUBSCRIPTIONS,
}: SubscriptionsDirectoryPageProps): React.ReactElement {
  const [subsList, setSubsList] = useState<PlatformSubscription[]>(initialSubs);
  const [filters, setFilters] = useState<SubscriptionFilterState>({
    search: '',
    subscriptionStatus: 'all',
    paymentStatus: 'all',
    plan: 'all',
    billingPeriod: 'all',
    dateRange: 'all',
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<{
    sub: PlatformSubscription | null;
    type: 'change_plan' | 'extend' | 'cancel' | null;
  }>({ sub: null, type: null });

  const canManage = hasPlatformPermission(actor, PLATFORM_PERMISSIONS.SUBSCRIPTIONS_MANAGE);
  const canExtend =
    hasPlatformPermission(actor, PLATFORM_PERMISSIONS.SUBSCRIPTIONS_EXTEND) || canManage;
  const canCancel =
    hasPlatformPermission(actor, PLATFORM_PERMISSIONS.SUBSCRIPTIONS_CANCEL) || canManage;

  const planNames = useMemo(
    () => Array.from(new Set(subsList.map((s) => s.planName))),
    [subsList]
  );

  const filteredSubs = useMemo(() => {
    return subsList.filter((sub) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = sub.businessName.toLowerCase().includes(query);
        const matchesId = sub.id.toLowerCase().includes(query);
        if (!matchesName && !matchesId) return false;
      }
      if (
        filters.subscriptionStatus !== 'all' &&
        sub.status !== filters.subscriptionStatus
      ) {
        return false;
      }
      if (
        filters.paymentStatus !== 'all' &&
        sub.paymentStatus !== filters.paymentStatus
      ) {
        return false;
      }
      if (filters.plan !== 'all' && sub.planName !== filters.plan) {
        return false;
      }
      return true;
    });
  }, [subsList, filters]);

  const pagination = usePagination({
    totalRecords: filteredSubs.length,
    initialPageSize: 10,
  });

  useEffect(() => {
    pagination.goToPage(1);
  }, [filters]);

  const paginatedSubs = useMemo(() => {
    return paginateArray(filteredSubs, pagination.currentPage, pagination.pageSize).data;
  }, [filteredSubs, pagination.currentPage, pagination.pageSize]);

  const handleChangePlan = (sub: PlatformSubscription, newPlanId: string) => {
    const plan = MOCK_SUBSCRIPTION_PLANS.find((p) => p.id === newPlanId);
    if (!plan) return;
    setSubsList((prev) =>
      prev.map((s) =>
        s.id === sub.id
          ? {
              ...s,
              planId: plan.id,
              planName: plan.name,
              price: plan.price,
              billingPeriod: plan.billingPeriod,
              includedModules: plan.includedModules,
              usageLimits: plan.usageLimits,
            }
          : s
      )
    );
    setActiveModal({ sub: null, type: null });
  };

  const handleExtend = (sub: PlatformSubscription, days: number) => {
    setSubsList((prev) =>
      prev.map((s) => {
        if (s.id !== sub.id) return s;
        const currentExp = new Date(s.expiryDate);
        currentExp.setDate(currentExp.getDate() + days);
        return { ...s, expiryDate: currentExp.toISOString(), status: 'active' };
      })
    );
    setActiveModal({ sub: null, type: null });
  };

  const handleCancel = (sub: PlatformSubscription, _reason: string) => {
    setSubsList((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: 'cancelled' } : s))
    );
    setActiveModal({ sub: null, type: null });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#10201F] tracking-tight">
          Subscriptions
        </h1>
        <p className="text-xs sm:text-sm text-[#10201F]/70 mt-1">
          Monitor subscription health, independent payment settlements, and customer renewal cycles.
        </p>
      </div>

      {/* KPI Cards */}
      <SubscriptionsOverviewCards subscriptions={subsList} />

      {/* Filter and Search Bar */}
      <SubscriptionsFiltersBar
        filters={filters}
        planNames={planNames}
        onChange={setFilters}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
      />

      <SubscriptionMobileFilters
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        planNames={planNames}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            search: '',
            subscriptionStatus: 'all',
            paymentStatus: 'all',
            plan: 'all',
            billingPeriod: 'all',
            dateRange: 'all',
          })
        }
      />

      {/* Directory Records: Desktop Table & Mobile Cards */}
      {filteredSubs.length === 0 ? (
        <EmptyState
          variant="no-search-results"
          title="No subscriptions found"
          description="No subscriptions match your search and filter criteria. Try adjusting your query or resetting filters."
        />
      ) : (
        <>
          <div className="hidden md:block">
            <SubscriptionsTable
              subscriptions={paginatedSubs}
              canManage={canManage}
              canExtend={canExtend}
              canCancel={canCancel}
              onChangePlan={(sub) => setActiveModal({ sub, type: 'change_plan' })}
              onExtend={(sub) => setActiveModal({ sub, type: 'extend' })}
              onCancelSub={(sub) => setActiveModal({ sub, type: 'cancel' })}
            />
          </div>

          <div className="md:hidden space-y-3">
            {paginatedSubs.map((sub) => (
              <SubscriptionMobileCard
                key={sub.id}
                subscription={sub}
                canManage={canManage}
                canExtend={canExtend}
                onChangePlan={(s) => setActiveModal({ sub: s, type: 'change_plan' })}
                onExtend={(s) => setActiveModal({ sub: s, type: 'extend' })}
              />
            ))}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalRecords={pagination.totalRecords}
            pageSize={pagination.pageSize}
            onPageChange={pagination.goToPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </>
      )}

      {/* Action Modals */}
      <SubscriptionActionModals
        subscription={activeModal.sub}
        modalType={activeModal.type}
        onClose={() => setActiveModal({ sub: null, type: null })}
        onConfirmChangePlan={handleChangePlan}
        onConfirmExtend={handleExtend}
        onConfirmCancel={handleCancel}
      />
    </div>
  );
}
