/**
 * @file Inventory and stock alerts card adopting Platform Admin card styling.
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
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-rule shadow-2xs font-sans space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D0]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-copper/10 text-copper border border-copper/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-oven-black">
              Stock & Replenishment
            </h3>
            <p className="text-xs text-oven-black/60">
              Items below minimum buffer threshold
            </p>
          </div>
        </div>
        <Link
          to="/business/operations/inventory"
          className="text-xs font-semibold text-verdigris hover:text-verdigris-lift transition-colors flex items-center gap-1 group"
        >
          <span>Inventory</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {ALERTS.map((alert) => (
          <div
            key={alert.id}
            className="p-3.5 rounded-xl bg-flour border border-rule flex items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5 min-w-0">
              <p className="font-bold text-oven-black truncate">{alert.item}</p>
              <p className="text-[11px] text-oven-black/60">{alert.department}</p>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  alert.urgency === 'high'
                    ? 'bg-status-unbalanced/10 text-[#8C1D18] border border-status-unbalanced/20'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {alert.currentStock}
              </span>
              <p className="text-[10px] text-oven-black/50 mt-0.5">{alert.threshold}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
