/**
 * @file Business Dashboard Overview page presenting KPIs, production and sales summaries,
 * stock alerts, and recent business activity scoped to the current tenant.
 */

import React from 'react';
import { ShoppingBag, DollarSign, Package, Flame, Truck, CreditCard } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import { MetricCard } from '../components/MetricCard';
import { SalesTrendCard } from './components/SalesTrendCard';
import { StockAlertsCard } from './components/StockAlertsCard';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { QuickActionsBar } from './components/QuickActionsBar';

export function BusinessOverviewPage(): React.ReactElement {
  const { currentBusiness, subscription, performance, branches, staff } = useTenant();

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#D9D3C0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-[#0B5C63]/10 text-[#0B5C63]">
              {subscription.planName} Tier
            </span>
            <span className="text-2xs text-[#10201F]/60">
              Workspace ID: {currentBusiness.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10201F] tracking-tight">
            {currentBusiness.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#10201F]/70 mt-0.5">
            Shift-based operations, department structures, and reconciliation performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="px-3 py-2 rounded-2xl bg-[#F6F3EA] border border-[#D9D3C0]/60 text-center">
            <span className="text-3xs font-bold text-[#10201F]/60 uppercase block">Branches</span>
            <span className="font-extrabold text-[#10201F]">{branches.length} / {subscription.maxBranches}</span>
          </div>
          <div className="px-3 py-2 rounded-2xl bg-[#F6F3EA] border border-[#D9D3C0]/60 text-center">
            <span className="text-3xs font-bold text-[#10201F]/60 uppercase block">Staff Accounts</span>
            <span className="font-extrabold text-[#10201F]">{staff.length} / {subscription.maxStaff}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          label="Total Orders"
          value={performance.totalOrdersCount.toLocaleString()}
          subtitle="This billing period"
          icon={<ShoppingBag size={16} />}
          variant="default"
        />
        <MetricCard
          label="Total Sales"
          value={`₦${(performance.totalSalesAmount / 1000000).toFixed(2)}M`}
          subtitle="POS & Wholesale"
          icon={<DollarSign size={16} />}
          variant="success"
        />
        <MetricCard
          label="Stock Batches"
          value={performance.totalStockBatches}
          subtitle={`${performance.inventoryAlertsCount} low-stock alerts`}
          icon={<Package size={16} />}
          variant="accent"
        />
        <MetricCard
          label="Production"
          value={`${performance.completedBatchesToday} Batches`}
          subtitle={`${performance.activeBatchesCount} active ovens`}
          icon={<Flame size={16} />}
          variant="default"
        />
        <MetricCard
          label="Procurement"
          value={`₦${(performance.procurementPendingAmount / 1000).toFixed(0)}k`}
          subtitle={`${performance.procurementPendingCount} POs pending`}
          icon={<Truck size={16} />}
          variant="default"
        />
        <MetricCard
          label="Open Credits"
          value={`₦${(performance.outstandingCreditsAmount / 1000).toFixed(0)}k`}
          subtitle={`${performance.outstandingCreditsCount} receivables`}
          icon={<CreditCard size={16} />}
          variant="warning"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <QuickActionsBar />

      {/* Mid Section: Trends & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesTrendCard />
        </div>
        <div>
          <StockAlertsCard />
        </div>
      </div>

      {/* Scoped Business Activity Feed */}
      <RecentActivityFeed />
    </div>
  );
}
