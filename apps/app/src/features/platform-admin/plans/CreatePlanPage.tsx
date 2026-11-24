/**
 * @file Page for authoring and provisioning a new Cadence platform subscription plan.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PlanForm } from './components/PlanForm';
import { MOCK_SUBSCRIPTION_PLANS } from '../mock-plans';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { PlatformSubscriptionPlan } from '../types';

export interface CreatePlanPageProps {
  /** Optional authenticated actor. */
  actor?: AuthenticatedActor;
}

/**
 * @description Create Subscription Plan view enabling administrators to construct and publish new tiers.
 * @param {CreatePlanPageProps} props - Component properties.
 * @returns {React.ReactElement} Create plan page element.
 */
export function CreatePlanPage({ actor: _actor }: CreatePlanPageProps): React.ReactElement {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (planData: Partial<PlatformSubscriptionPlan>) => {
    const newPlan: PlatformSubscriptionPlan = {
      id: `plan-${Date.now()}`,
      name: planData.name || 'New Plan',
      description: planData.description || '',
      price: planData.price ?? 25000,
      currency: planData.currency || 'NGN',
      billingPeriod: planData.billingPeriod || 'monthly',
      includedModules: planData.includedModules || ['Shifts'],
      usageLimits: planData.usageLimits || {
        staffAccounts: 10,
        departments: 4,
        storageAllowance: '20 GB',
        branches: 2,
      },
      status: planData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscribersCount: 0,
    };

    MOCK_SUBSCRIPTION_PLANS.unshift(newPlan);
    setSuccessMsg(true);
    setTimeout(() => {
      navigate('/admin/plans');
    }, 400);
  };

  return (
    <div className="space-y-6 font-sans max-w-3xl">
      <div>
        <Link
          to="/admin/plans"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5C63] hover:text-[#0B5C63]/80 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Plans</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-[#10201F] tracking-tight">
          Create Subscription Plan
        </h1>
        <p className="text-sm text-[#10201F]/70 mt-1">
          Configure a new commercial subscription package for registered bakery businesses.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#2C571D]/10 border border-[#2C571D]/30 text-xs font-bold text-[#2C571D]">
          Subscription plan created successfully! Redirecting...
        </div>
      )}

      <PlanForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/plans')}
        submitLabel="Save Plan"
      />
    </div>
  );
}
