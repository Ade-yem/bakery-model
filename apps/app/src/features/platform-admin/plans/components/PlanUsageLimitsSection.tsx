/**
 * @file Usage quotas and resource limits form section for Subscription Plan.
 */

import React from 'react';

export interface PlanUsageLimitsSectionProps {
  staffUnlimited: boolean;
  staffCount: number;
  storageAllowance: string;
  onStaffUnlimitedChange: (unlimited: boolean) => void;
  onStaffCountChange: (count: number) => void;
  onStorageAllowanceChange: (storage: string) => void;
}

/**
 * @description Form subsection configuring staff, department, and storage allowance limits.
 * @param {PlanUsageLimitsSectionProps} props - Component properties.
 * @returns {React.ReactElement} Form section element.
 */
export function PlanUsageLimitsSection({
  staffUnlimited,
  staffCount,
  storageAllowance,
  onStaffUnlimitedChange,
  onStaffCountChange,
  onStorageAllowanceChange,
}: PlanUsageLimitsSectionProps): React.ReactElement {
  return (
    <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-4 font-sans">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#0B5C63]">
        Usage Limits
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[#10201F]/80">Staff Accounts</label>
            <label className="text-[11px] font-semibold text-[#0B5C63] flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={staffUnlimited}
                onChange={(e) => onStaffUnlimitedChange(e.target.checked)}
              />
              <span>Unlimited</span>
            </label>
          </div>
          <input
            type="number"
            disabled={staffUnlimited}
            value={staffUnlimited ? '' : staffCount}
            onChange={(e) => onStaffCountChange(Number(e.target.value))}
            placeholder={staffUnlimited ? 'Unlimited' : 'Max staff accounts'}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Storage Allowance
          </label>
          <input
            type="text"
            value={storageAllowance}
            onChange={(e) => onStorageAllowanceChange(e.target.value)}
            placeholder="e.g. 20 GB"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          />
        </div>
      </div>
    </div>
  );
}
