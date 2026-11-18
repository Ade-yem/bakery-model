/**
 * @file Reusable form component for creating and editing platform subscription plans.
 */

import React, { useState } from 'react';
import { PlanBasicPricingSection } from './PlanBasicPricingSection';
import { PlanModulesCheckboxes } from './PlanModulesCheckboxes';
import { PlanUsageLimitsSection } from './PlanUsageLimitsSection';
import type { PlatformSubscriptionPlan } from '../../types';

export interface PlanFormProps {
  /** Optional existing plan when editing, or undefined when creating. */
  initialPlan?: PlatformSubscriptionPlan;
  /** Submission handler receiving validated plan payload. */
  onSubmit: (plan: Partial<PlatformSubscriptionPlan>) => Promise<void> | void;
  /** Cancel handler to return to plans list or details view. */
  onCancel: () => void;
  /** Submit button text label. */
  submitLabel?: string;
}

/**
 * @description Form supporting creation and editing of plan names, pricing, modules, and limits.
 * @param {PlanFormProps} props - Component properties.
 * @returns {React.ReactElement} Form element.
 */
export function PlanForm({
  initialPlan,
  onSubmit,
  onCancel,
  submitLabel = 'Save Plan',
}: PlanFormProps): React.ReactElement {
  const [name, setName] = useState(initialPlan?.name || '');
  const [description, setDescription] = useState(initialPlan?.description || '');
  const [price, setPrice] = useState<number | string>(initialPlan?.price ?? 25000);
  const [currency] = useState(initialPlan?.currency || 'NGN');
  const [billingPeriod, setBillingPeriod] = useState<PlatformSubscriptionPlan['billingPeriod']>(
    initialPlan?.billingPeriod || 'monthly'
  );
  const [status, setStatus] = useState<PlatformSubscriptionPlan['status']>(
    initialPlan?.status || 'active'
  );
  const [includedModules, setIncludedModules] = useState<string[]>(
    initialPlan?.includedModules || ['Shifts', 'Sales', 'Reconciliation']
  );
  const [staffUnlimited, setStaffUnlimited] = useState(
    initialPlan?.usageLimits.staffAccounts === 'unlimited'
  );
  const [staffCount, setStaffCount] = useState<number>(
    typeof initialPlan?.usageLimits.staffAccounts === 'number'
      ? initialPlan.usageLimits.staffAccounts
      : 10
  );
  const [storageAllowance, setStorageAllowance] = useState(
    initialPlan?.usageLimits.storageAllowance || '20 GB'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleModule = (mod: string) => {
    setIncludedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Plan Name is required.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg('Subscription Price must be a valid non-negative number.');
      return;
    }
    if (includedModules.length === 0) {
      setErrorMsg('Please select at least one included module.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        currency,
        billingPeriod,
        status,
        includedModules,
        usageLimits: {
          staffAccounts: staffUnlimited ? 'unlimited' : Number(staffCount),
          departments: staffUnlimited ? 'unlimited' : 4,
          storageAllowance,
          branches: staffUnlimited ? 'unlimited' : 2,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#A9501A]/10 border border-[#A9501A]/30 text-xs font-bold text-[#A9501A]">
          {errorMsg}
        </div>
      )}

      {/* 1 & 2. Basic Information and Pricing */}
      <PlanBasicPricingSection
        name={name}
        description={description}
        price={price}
        billingPeriod={billingPeriod}
        status={status}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onPriceChange={setPrice}
        onBillingPeriodChange={setBillingPeriod}
        onStatusChange={setStatus}
      />

      {/* 3. Included Modules */}
      <PlanModulesCheckboxes
        includedModules={includedModules}
        onToggle={toggleModule}
      />

      {/* 4. Usage Limits */}
      <PlanUsageLimitsSection
        staffUnlimited={staffUnlimited}
        staffCount={staffCount}
        storageAllowance={storageAllowance}
        onStaffUnlimitedChange={setStaffUnlimited}
        onStaffCountChange={setStaffCount}
        onStorageAllowanceChange={setStorageAllowance}
      />

      {/* Form Submission Actions */}
      <div className="flex items-center justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-lg border border-[#D9D3C0] text-sm font-semibold text-[#10201F]/80 hover:bg-[#F6F3EA] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-[#0B5C63] text-white text-sm font-bold hover:bg-[#0B5C63]/90 shadow-xs disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
