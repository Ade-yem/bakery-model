/**
 * @file Business Dashboard Overview adopting Platform Admin design standards.
 */

import React from 'react';
import { ShoppingBag, DollarSign, Package, Flame, Truck, CreditCard, CheckCircle2 } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import { MetricCard } from '../components/MetricCard';
import { SalesTrendCard } from './components/SalesTrendCard';
import { StockAlertsCard } from './components/StockAlertsCard';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { QuickActionsBar } from './components/QuickActionsBar';
import { AdminPageHeader } from '../../platform-admin/AdminPageHeader';

export function BusinessOverviewPage(): React.ReactElement {
  const { currentBusiness, subscription, performance, branches, staff } = useTenant();

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Standardized AdminPageHeader */}
      <AdminPageHeader
        title={`${currentBusiness.name} Overview`}
        description="Shift-based operations, department structures, and real-time reconciliation metrics."
        action={
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-white border border-rule text-oven-black/70 font-semibold shadow-2xs">
              Branches: <strong className="text-oven-black">{branches.length} / {subscription.maxBranches}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-rule text-oven-black/70 font-semibold shadow-2xs">
              Staff: <strong className="text-oven-black">{staff.length} / {subscription.maxStaff}</strong>
            </span>
          </div>
        }
      />

      {/* 2. Operational Status Notice Banner (Platform Admin Pattern) */}
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
            All bakery operational departments and POS registers synchronized
          </p>
          <p className="text-xs text-[#2C571D]/80 mt-0.5">
            Active workspace tier: <strong className="font-semibold">{subscription.planName}</strong> • Organization ID: <code className="font-mono">{currentBusiness.id}</code>
          </p>
        </div>
      </div>

      {/* 3. Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Total Orders"
          value={performance.totalOrdersCount.toLocaleString()}
          subtitle="This billing period"
          trend="+12%"
          trendDirection="up"
          icon={<ShoppingBag className="w-5 h-5 text-verdigris" />}
        />
        <MetricCard
          label="Total Sales"
          value={`₦${(performance.totalSalesAmount / 1000000).toFixed(2)}M`}
          subtitle="POS & Wholesale"
          trend="+14.2%"
          trendDirection="up"
          icon={<DollarSign className="w-5 h-5 text-status-balanced" />}
        />
        <MetricCard
          label="Stock Batches"
          value={performance.totalStockBatches}
          subtitle={`${performance.inventoryAlertsCount} low-stock alerts`}
          trend={performance.inventoryAlertsCount > 0 ? `${performance.inventoryAlertsCount} alerts` : 'Optimal'}
          trendDirection={performance.inventoryAlertsCount > 0 ? 'down' : 'up'}
          icon={<Package className="w-5 h-5 text-copper" />}
        />
        <MetricCard
          label="Production Batches"
          value={`${performance.completedBatchesToday} Batches`}
          subtitle={`${performance.activeBatchesCount} active ovens`}
          icon={<Flame className="w-5 h-5 text-copper" />}
        />
        <MetricCard
          label="Procurement Spend"
          value={`₦${(performance.procurementPendingAmount / 1000).toFixed(0)}k`}
          subtitle={`${performance.procurementPendingCount} POs pending`}
          icon={<Truck className="w-5 h-5 text-verdigris" />}
        />
        <MetricCard
          label="Outstanding Credits"
          value={`₦${(performance.outstandingCreditsAmount / 1000).toFixed(0)}k`}
          subtitle={`${performance.outstandingCreditsCount} receivables`}
          icon={<CreditCard className="w-5 h-5 text-status-open" />}
        />
      </div>

      {/* 4. Quick Actions */}
      <QuickActionsBar />

      {/* 5. Mid Section: Trends & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesTrendCard />
        </div>
        <div>
          <StockAlertsCard />
        </div>
      </div>

      {/* 6. Scoped Business Activity Feed */}
      <RecentActivityFeed />
    </div>
  );
}
