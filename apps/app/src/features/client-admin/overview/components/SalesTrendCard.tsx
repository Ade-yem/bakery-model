/**
 * @file Visual 7-day sales trend card for business dashboard overview.
 */

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface SalesTrendPoint {
  day: string;
  sales: number;
  orders: number;
}

const TREND_DATA: SalesTrendPoint[] = [
  { day: 'Mon', sales: 620000, orders: 185 },
  { day: 'Tue', sales: 580000, orders: 172 },
  { day: 'Wed', sales: 740000, orders: 210 },
  { day: 'Thu', sales: 690000, orders: 198 },
  { day: 'Fri', sales: 890000, orders: 254 },
  { day: 'Sat', sales: 1120000, orders: 312 },
  { day: 'Sun', sales: 480500, orders: 97 },
];

export function SalesTrendCard(): React.ReactElement {
  const maxSales = Math.max(...TREND_DATA.map((d) => d.sales));

  return (
    <div className="bg-white rounded-3xl border border-[#D9D3C0] p-5 sm:p-6 shadow-2xs font-sans space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#10201F]">
            Weekly Sales & Revenue Trend
          </h3>
          <p className="text-2xs sm:text-xs text-[#10201F]/60">
            Past 7 days across all active bakery registers
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <TrendingUp size={14} />
          <span>+14.2% vs last week</span>
        </div>
      </div>

      {/* Bar Chart Representation */}
      <div className="pt-4 flex items-end justify-between gap-2 sm:gap-4 h-48 border-b border-[#D9D3C0]/40 pb-2">
        {TREND_DATA.map((point) => {
          const heightPercent = Math.round((point.sales / maxSales) * 100);
          return (
            <div key={point.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="text-3xs font-semibold text-[#10201F]/60 opacity-0 group-hover:opacity-100 transition-opacity">
                ₦{(point.sales / 1000).toFixed(0)}k
              </div>
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full max-w-[40px] rounded-t-xl bg-[#0B5C63]/80 group-hover:bg-[#0B5C63] transition-all relative cursor-pointer"
              />
              <span className="text-2xs font-bold text-[#10201F]/70">
                {point.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-2xs text-[#10201F]/60 pt-1">
        <span>Average Daily Sales: <strong>₦731,500</strong></span>
        <span>Peak Day: <strong>Saturday (₦1.12M)</strong></span>
      </div>
    </div>
  );
}
