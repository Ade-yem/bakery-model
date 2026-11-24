/**
 * @file Platform Overview Dashboard presenting SaaS platform performance, multi-tenant health, revenue, and activities.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Plus } from 'lucide-react';
import { AdminPageHeader } from './AdminPageHeader';
import { PlatformOverviewCards } from './components/PlatformOverviewCards';
import { RevenueOverviewCard } from './components/RevenueOverviewCard';
import { BusinessGrowthChart } from './components/BusinessGrowthChart';
import { SubscriptionDistributionCard } from './components/SubscriptionDistributionCard';
import { RecentBusinessesTable } from './components/RecentBusinessesTable';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { AdminQuickActions } from './components/AdminQuickActions';
import {
  MOCK_PLATFORM_METRICS,
  MOCK_REVENUE_ANALYTICS,
  MOCK_REGISTRATION_TRENDS,
  MOCK_SUBSCRIPTION_DISTRIBUTION,
  MOCK_TENANT_BUSINESSES,
  MOCK_PLATFORM_ACTIVITIES,
} from './mock-data';
import { hasPlatformPermission, PLATFORM_PERMISSIONS } from './permissions';
import type {
  PlatformMetric,
  TenantBusinessSummary,
  PlatformActivityItem,
  RevenueMetrics,
  SubscriptionDistribution,
} from './types';
import type { AuthenticatedActor } from '../../components/layout/types';

export interface AdminDashboardProps {
  /** Current administrator actor holding platform permissions. */
  actor?: AuthenticatedActor;
  /** Optional metric items override. */
  metrics?: PlatformMetric[];
  /** Optional revenue analytics override. */
  revenueData?: RevenueMetrics;
  /** Optional business registration trends override. */
  trends?: typeof MOCK_REGISTRATION_TRENDS;
  /** Optional subscription distribution override. */
  distribution?: SubscriptionDistribution;
  /** Optional tenant businesses list override. */
  businesses?: TenantBusinessSummary[];
  /** Optional platform activities list override. */
  activities?: PlatformActivityItem[];
}

/**
 * @description Primary administrative dashboard presenting SaaS KPIs, subscription distribution, revenue analytics, and recent activity.
 * @param {AdminDashboardProps} props - Dashboard configuration and dataset overrides.
 * @returns {React.ReactElement} Admin dashboard component.
 */
export function AdminDashboard({
  actor,
  metrics = MOCK_PLATFORM_METRICS,
  revenueData = MOCK_REVENUE_ANALYTICS,
  trends = MOCK_REGISTRATION_TRENDS,
  distribution = MOCK_SUBSCRIPTION_DISTRIBUTION,
  businesses = MOCK_TENANT_BUSINESSES,
  activities = MOCK_PLATFORM_ACTIVITIES,
}: AdminDashboardProps): React.ReactElement {
  const canManageBusinesses = hasPlatformPermission(
    actor,
    PLATFORM_PERMISSIONS.BUSINESSES_MANAGE
  );

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Dashboard Header */}
      <AdminPageHeader
        title="Platform Overview"
        description="Comprehensive overview of Cadence SaaS operations, tenant registrations, subscriptions, and revenue."
        action={
          canManageBusinesses ? (
            <Link
              to="/admin/businesses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-verdigris hover:bg-verdigris-lift text-flour text-sm font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
            >
              <Plus className="w-4 h-4" />
              <span>Register Business</span>
            </Link>
          ) : undefined
        }
      />

      {/* Operational Status Notice Banner */}
      <div
        role="status"
        className="p-4 rounded-r-xl rounded-l-md border-l-4 text-sm flex items-start gap-3 shadow-xs bg-status-balanced/8 border-status-balanced text-[#2C571D]"
      >
        <CheckCircle2
          className="w-5 h-5 shrink-0 mt-0.5 text-status-balanced"
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className="font-bold text-sm text-[#2C571D]">
            All Cadence platform services operational & synchronized
          </p>
          <p className="text-xs text-[#2C571D]/90 mt-0.5 leading-relaxed">
            Multi-tenant billing gateways, offline synchronization nodes, and database connections are operating with 99.98% uptime.
          </p>
        </div>
      </div>

      {/* 2. Platform Overview Metric Cards */}
      <section aria-label="Key Performance Indicators">
        <PlatformOverviewCards metrics={metrics} actor={actor} />
      </section>

      {/* 3 & 4. Analytics Grid: Revenue Overview & Business Growth */}
      <section
        aria-label="Revenue and Growth Analytics"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <RevenueOverviewCard data={revenueData} />
        <BusinessGrowthChart trends={trends} />
      </section>

      {/* 5. Subscription Distribution Overview */}
      <section aria-label="Subscription Overview">
        <SubscriptionDistributionCard distribution={distribution} actor={actor} />
      </section>

      {/* 6 & 7. Main Split: Recent Businesses Table & Recent Platform Activity */}
      <section
        aria-label="Operations and Activity Stream"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <RecentBusinessesTable businesses={businesses} actor={actor} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityFeed activities={activities} actor={actor} />
        </div>
      </section>

      {/* 8. Quick Actions Panel */}
      <section aria-label="Administrative Shortcuts">
        <AdminQuickActions actor={actor} />
      </section>
    </div>
  );
}
