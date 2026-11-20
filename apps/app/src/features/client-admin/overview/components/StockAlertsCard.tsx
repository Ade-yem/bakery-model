/**
 * @file Inventory and stock alerts card for business overview.
 */

import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StockAlertItem {
  id: string;
  item: string;
  department: string;
  currentStock: string;
  threshold: string;
  urgency: 'high' | 'medium';
}

const ALERTS: StockAlertItem[] = [
  {
    id: 'alt-1',
    item: 'Golden Penny Bakers Flour (50kg)',
    department: 'Raw Materials Store',
    currentStock: '6 bags remaining',
    threshold: 'Min 20 bags',
    urgency: 'high',
  },
  {
    id: 'alt-2',
    item: 'Instant Dry Baker Yeast (500g)',
    department: 'Baking & Production',
    currentStock: '12 packs remaining',
    threshold: 'Min 30 packs',
    urgency: 'high',
  },
  {
    id: 'alt-3',
    item: 'Custom Branded Bread Wax Bags',
    department: 'Packaging & Dispatch',
    currentStock: '450 units',
    threshold: 'Min 1,000 units',
    urgency: 'medium',
  },
];

export function StockAlertsCard(): React.ReactElement {
  return (
    <div className="bg-white rounded-3xl border border-[#D9D3C0] p-5 sm:p-6 shadow-2xs font-sans space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#A9501A]/10 text-[#A9501A] flex items-center justify-center">
            <AlertCircle size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#10201F]">
              Stock & Replenishment Alerts
            </h3>
            <p className="text-2xs sm:text-xs text-[#10201F]/60">
              Ingredients below minimum buffer threshold
            </p>
          </div>
        </div>
        <Link
          to="/business/operations/inventory"
          className="text-xs font-bold text-[#0B5C63] hover:underline flex items-center gap-1"
        >
          View Inventory <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-2.5">
        {ALERTS.map((alert) => (
          <div
            key={alert.id}
            className="p-3 rounded-2xl bg-[#F6F3EA] border border-[#D9D3C0]/60 flex items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5">
              <p className="font-extrabold text-[#10201F]">{alert.item}</p>
              <p className="text-2xs text-[#10201F]/60">{alert.department}</p>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase ${
                  alert.urgency === 'high'
                    ? 'bg-[#8C1D18]/10 text-[#8C1D18]'
                    : 'bg-amber-500/10 text-amber-800'
                }`}
              >
                {alert.currentStock}
              </span>
              <p className="text-3xs text-[#10201F]/50 mt-0.5">{alert.threshold}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
