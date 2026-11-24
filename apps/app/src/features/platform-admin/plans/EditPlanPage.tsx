/**
 * @file Page for updating existing subscription plan pricing, limits, and module inclusions.
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PlanForm } from './components/PlanForm';
import { MOCK_SUBSCRIPTION_PLANS } from '../mock-plans';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { PlatformSubscriptionPlan } from '../types';

export interface EditPlanPageProps {
  /** Optional authenticated actor. */
  actor?: AuthenticatedActor;
  /** Optional dataset override. */
  plans?: PlatformSubscriptionPlan[];
}

/**
 * @description Edit Subscription Plan view allowing modification of plan pricing and usage limits.
 * @param {EditPlanPageProps} props - Component properties.
 * @returns {React.ReactElement} Edit plan page element.
 */
export function EditPlanPage({
  actor: _actor,
  plans = MOCK_SUBSCRIPTION_PLANS,
}: EditPlanPageProps): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const plan = plans.find((p) => p.id === id);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!plan) {
    return (
      <div className="p-8 text-center rounded-xl border border-[#D9D3C0] bg-white font-sans max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-[#10201F]">Plan Not Found</h2>
        <p className="text-sm text-[#10201F]/70">
          Cannot edit non-existent subscription plan.
        </p>
        <Link
          to="/admin/plans"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B5C63] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plans</span>
        </Link>
      </div>
    );
  }

  const handleUpdate = (updatedFields: Partial<PlatformSubscriptionPlan>) => {
    Object.assign(plan, updatedFields, { updatedAt: new Date().toISOString() });
    setSuccessMsg(true);
    setTimeout(() => {
      navigate(`/admin/plans/${plan.id}`);
    }, 400);
  };

  return (
    <div className="space-y-6 font-sans max-w-3xl">
      <div>
        <Link
          to={`/admin/plans/${plan.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5C63] hover:text-[#0B5C63]/80 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Plan Details</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-[#10201F] tracking-tight">
          Edit Subscription Plan
        </h1>
        <p className="text-sm text-[#10201F]/70 mt-1">
          Update specifications, terms, and limits for {plan.name}.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#2C571D]/10 border border-[#2C571D]/30 text-xs font-bold text-[#2C571D]">
          Subscription plan updated successfully! Redirecting...
        </div>
      )}

      <PlanForm
        initialPlan={plan}
        onSubmit={handleUpdate}
        onCancel={() => navigate(`/admin/plans/${plan.id}`)}
        submitLabel="Update Plan"
      />
    </div>
  );
}
