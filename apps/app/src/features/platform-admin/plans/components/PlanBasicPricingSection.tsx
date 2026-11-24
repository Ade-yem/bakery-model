/**
 * @file Basic information and pricing inputs subsection for the PlanForm.
 */

import React from 'react';
import type { PlatformSubscriptionPlan } from '../../types';

export interface PlanBasicPricingSectionProps {
  name: string;
  description: string;
  price: number | string;
  billingPeriod: PlatformSubscriptionPlan['billingPeriod'];
  status: PlatformSubscriptionPlan['status'];
  onNameChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onPriceChange: (val: number | string) => void;
  onBillingPeriodChange: (val: PlatformSubscriptionPlan['billingPeriod']) => void;
  onStatusChange: (val: PlatformSubscriptionPlan['status']) => void;
}

/**
 * @description Form subsection for plan name, description, price, cycle, and status.
 * @param {PlanBasicPricingSectionProps} props - Component properties.
 * @returns {React.ReactElement} Form inputs block.
 */
export function PlanBasicPricingSection({
  name,
  description,
  price,
  billingPeriod,
  status,
  onNameChange,
  onDescriptionChange,
  onPriceChange,
  onBillingPeriodChange,
  onStatusChange,
}: PlanBasicPricingSectionProps): React.ReactElement {
  return (
    <div className="space-y-4 font-sans">
      <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0B5C63]">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
              Plan Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Growth Monthly"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#10201F]/80 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as PlatformSubscriptionPlan['status'])}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Plan Description
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={2}
            placeholder="Describe who this plan is tailored for..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          />
        </div>
      </div>

      <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0B5C63]">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
              Subscription Price (₦) *
            </label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
              Billing Period *
            </label>
            <select
              value={billingPeriod}
              onChange={(e) =>
                onBillingPeriodChange(e.target.value as PlatformSubscriptionPlan['billingPeriod'])
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
