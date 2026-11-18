/**
 * @file Business growth analytics chart showing registration trends with weekly/monthly toggle.
 */

import React, { useState } from 'react';
import { TrendingUp, Building2 } from 'lucide-react';
import { MOCK_REGISTRATION_TRENDS } from '../mock-data';

export interface BusinessGrowthChartProps {
  /** Optional custom trend datasets for monthly and weekly views. */
  trends?: typeof MOCK_REGISTRATION_TRENDS;
}

/**
 * @description Visualizes new business onboarding trends with togglable monthly and weekly aggregations.
 * @param {BusinessGrowthChartProps} props - Registration trends data.
 * @returns {React.ReactElement} Growth chart component.
 */
export function BusinessGrowthChart({
  trends = MOCK_REGISTRATION_TRENDS,
}: BusinessGrowthChartProps): React.ReactElement {
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly'>('monthly');

  const dataset = timeframe === 'monthly' ? trends.monthly : trends.weekly;
  const maxCount = Math.max(...dataset.map((d) => d.newRegistrations), 1);

  const chartHeight = 160;
  const totalRegistrations = dataset.reduce((acc, curr) => acc + curr.newRegistrations, 0);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-rule shadow-2xs flex flex-col justify-between">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E0D0]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-verdigris/10 text-verdigris border border-verdigris/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-oven-black">Business Growth</h2>
            <p className="text-xs text-oven-black/60">
              New commercial bakery tenant registrations
            </p>
          </div>
        </div>

        {/* Weekly / Monthly Toggle */}
        <div className="flex items-center p-1 bg-flour rounded-xl border border-rule text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              timeframe === 'weekly'
                ? 'bg-white text-oven-black shadow-2xs font-bold'
                : 'text-oven-black/60 hover:text-oven-black'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              timeframe === 'monthly'
                ? 'bg-white text-oven-black shadow-2xs font-bold'
                : 'text-oven-black/60 hover:text-oven-black'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Metric Badge */}
      <div className="flex items-center justify-between my-4 p-3.5 rounded-xl bg-flour border border-rule">
        <div>
          <span className="text-xs font-semibold text-oven-black/60 uppercase tracking-wider block">
            New Registrations
          </span>
          <div className="text-2xl font-extrabold text-oven-black mt-0.5">
            +{totalRegistrations}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-status-balanced bg-status-balanced/10 px-2.5 py-1 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+18.5% rate</span>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
        {dataset.map((item) => {
          const barHeightRatio = item.newRegistrations / maxCount;
          const heightPx = Math.max(Math.round(barHeightRatio * (chartHeight - 40)), 8);

          return (
            <div
              key={item.period}
              className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
            >
              <div className="text-[11px] font-bold text-oven-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.newRegistrations}
              </div>
              <div
                style={{ height: `${heightPx}px` }}
                className="w-full max-w-[36px] bg-verdigris/80 group-hover:bg-verdigris rounded-t-lg transition-all duration-200 shadow-2xs"
              />
              <span className="text-[11px] font-semibold text-oven-black/50 group-hover:text-oven-black transition-colors">
                {item.period}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
