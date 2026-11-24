/**
 * @file Revenue overview card with trend area chart, MRR, date range filter, and empty state.
 */

import React, { useState } from 'react';
import { CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import type { RevenueMetrics } from '../types';

export interface RevenueOverviewCardProps {
  /** Revenue dataset including total, MRR, and trend points. */
  data?: RevenueMetrics;
}

type DateRangeFilter = '30d' | '90d' | '12m' | 'ytd';

/**
 * @description Displays platform revenue analytics, MRR, responsive SVG chart, and date range filters.
 * @param {RevenueOverviewCardProps} props - Revenue metrics.
 * @returns {React.ReactElement} Revenue card component.
 */
export function RevenueOverviewCard({ data }: RevenueOverviewCardProps): React.ReactElement {
  const [activeRange, setActiveRange] = useState<DateRangeFilter>('30d');

  const isEmpty = !data || !data.trendPoints || data.trendPoints.length === 0;

  // SVG Chart Dimensions & Computations
  const points = data?.trendPoints ?? [];
  const maxAmount = points.length > 0 ? Math.max(...points.map((p) => p.amount)) : 1;
  const minAmount = points.length > 0 ? Math.min(...points.map((p) => p.amount)) : 0;
  const range = maxAmount - minAmount || 1;

  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 20;
  const paddingY = 25;

  const coordinates = points.map((p, idx) => {
    const x =
      paddingX +
      (idx / Math.max(points.length - 1, 1)) * (chartWidth - paddingX * 2);
    const normalizedY = (p.amount - minAmount) / range;
    const y = chartHeight - paddingY - normalizedY * (chartHeight - paddingY * 2);
    return { x, y, ...p };
  });

  const pathD = coordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD =
    coordinates.length > 0
      ? `${pathD} L ${coordinates[coordinates.length - 1]?.x} ${chartHeight - paddingY} L ${coordinates[0]?.x} ${chartHeight - paddingY} Z`
      : '';

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-rule shadow-2xs flex flex-col justify-between">
      {/* Card Header with Date Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E0D0]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-copper/10 text-copper border border-copper/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-oven-black">Revenue Overview</h2>
            <p className="text-xs text-oven-black/60">
              Aggregated from verified gateway settlements
            </p>
          </div>
        </div>

        {/* Date Range Filter Selector */}
        <div className="flex items-center p-1 bg-flour rounded-xl border border-rule text-xs font-semibold self-start sm:self-auto">
          {(
            [
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: '12m', label: '12 Months' },
              { id: 'ytd', label: 'YTD' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveRange(filter.id)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeRange === filter.id
                  ? 'bg-white text-oven-black shadow-2xs font-bold'
                  : 'text-oven-black/60 hover:text-oven-black'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
        <div className="p-4 rounded-xl bg-flour border border-rule">
          <span className="text-xs font-semibold text-oven-black/60 uppercase tracking-wider block">
            Total Subscription Revenue
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-oven-black">
              {data?.totalRevenueFormatted || '₦0'}
            </span>
            <span className="text-xs font-bold text-status-balanced bg-status-balanced/10 px-2 py-0.5 rounded-full flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              {data?.changePercentage || '0%'}
            </span>
          </div>
          <span className="text-[11px] text-oven-black/50 mt-1 block">
            {data?.periodLabel || 'Current Billing Cycle'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-flour border border-rule">
          <span className="text-xs font-semibold text-oven-black/60 uppercase tracking-wider block">
            Monthly Recurring Revenue (MRR)
          </span>
          <div className="text-2xl font-extrabold text-oven-black mt-1">
            {data?.mrrFormatted || '₦0'}
          </div>
          <span className="text-[11px] text-oven-black/50 mt-1 block">
            Active committed annual & monthly tiers
          </span>
        </div>
      </div>

      {/* SVG Trend Chart or Empty State */}
      <div className="mt-2 min-h-[160px] flex items-center justify-center">
        {isEmpty ? (
          <div className="text-center py-8 px-4 flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-oven-black/30 mb-2" />
            <p className="text-sm font-semibold text-oven-black">
              No payment transactions recorded
            </p>
            <p className="text-xs text-oven-black/60 max-w-xs mt-0.5">
              Revenue analytics populate automatically as tenant subscriptions process payments.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-40 overflow-visible"
              aria-label="Revenue Trend Chart"
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A9501A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#A9501A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Shaded Area */}
              <path d={areaD} fill="url(#revenueGradient)" />

              {/* Line Stroke */}
              <path
                d={pathD}
                fill="none"
                stroke="#A9501A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points and Labels */}
              {coordinates.map((pt) => (
                <g key={pt.date} className="group">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#F6F3EA"
                    stroke="#A9501A"
                    strokeWidth="2.5"
                    className="transition-transform group-hover:scale-125"
                  />
                  <text
                    x={pt.x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    className="text-[10px] font-semibold fill-[#10201F]/50"
                  >
                    {pt.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
