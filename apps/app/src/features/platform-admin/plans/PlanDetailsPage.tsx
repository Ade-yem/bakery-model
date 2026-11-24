/**
 * @file Plan Details page displaying comprehensive terms, included modules, and limits.
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Users, Layers, ShieldCheck, HardDrive } from 'lucide-react';
import { MOCK_SUBSCRIPTION_PLANS } from '../mock-plans';
import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '../permissions';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { PlatformSubscriptionPlan } from '../types';

export interface PlanDetailsPageProps {
  /** Optional authenticated actor. */
  actor?: AuthenticatedActor;
  /** Optional plans dataset override. */
  plans?: PlatformSubscriptionPlan[];
}

/**
 * @description Detailed inspection view for a single subscription plan.
 * @param {PlanDetailsPageProps} props - Component properties.
 * @returns {React.ReactElement} Details page element.
 */
export function PlanDetailsPage({
  actor,
  plans = MOCK_SUBSCRIPTION_PLANS,
}: PlanDetailsPageProps): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const plan = plans.find((p) => p.id === id);

  const canManage = hasPlatformPermission(actor, PLATFORM_PERMISSIONS.PLANS_MANAGE);

  if (!plan) {
    return (
      <div className="p-8 text-center rounded-xl border border-[#D9D3C0] bg-white font-sans max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-[#10201F]">Plan Not Found</h2>
        <p className="text-sm text-[#10201F]/70">
          The requested subscription plan could not be located on the platform.
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

  const isArchived = plan.status === 'archived';

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/admin/plans"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5C63] hover:text-[#0B5C63]/80 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Plans</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-[#10201F]">{plan.name}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                  isArchived
                    ? 'bg-[#A9501A]/10 text-[#A9501A] border border-[#A9501A]/20'
                    : 'bg-[#2C571D]/10 text-[#2C571D] border border-[#2C571D]/20'
                }`}
              >
                {plan.status}
              </span>
            </div>
            <p className="text-sm text-[#10201F]/70 mt-1">{plan.description}</p>
          </div>

          {canManage && (
            <Link
              to={`/admin/plans/${plan.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs font-bold text-[#0B5C63] hover:bg-[#0B5C63]/10"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Plan</span>
            </Link>
          )}
        </div>
      </div>

      {/* Pricing & Subscribers Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[#D9D3C0] bg-white">
          <p className="text-xs font-bold text-[#10201F]/60 uppercase tracking-wider">
            Price & Billing
          </p>
          <p className="text-2xl font-extrabold text-[#10201F] mt-1">
            ₦{plan.price.toLocaleString()}
          </p>
          <p className="text-xs text-[#10201F]/60 capitalize">Billed {plan.billingPeriod}</p>
        </div>

        <div className="p-4 rounded-xl border border-[#D9D3C0] bg-white">
          <p className="text-xs font-bold text-[#10201F]/60 uppercase tracking-wider">
            Subscribed Businesses
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Users className="w-5 h-5 text-[#0B5C63]" />
            <p className="text-2xl font-extrabold text-[#10201F]">
              {plan.subscribersCount}
            </p>
          </div>
          <p className="text-xs text-[#10201F]/60">Active tenant deployments</p>
        </div>

        <div className="p-4 rounded-xl border border-[#D9D3C0] bg-white">
          <p className="text-xs font-bold text-[#10201F]/60 uppercase tracking-wider">
            Date Configured
          </p>
          <p className="text-sm font-bold text-[#10201F] mt-2">
            {new Date(plan.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-[#10201F]/60">ID: {plan.id}</p>
        </div>
      </div>

      {/* Included Modules Section */}
      <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-3">
        <div className="flex items-center gap-2 text-[#0B5C63]">
          <Layers className="w-4 h-4" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#10201F]">
            Included Modules
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {plan.includedModules.map((mod) => (
            <div
              key={mod}
              className="p-3 rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] flex items-center gap-2 text-xs font-bold text-[#10201F]"
            >
              <ShieldCheck className="w-4 h-4 text-[#2C571D]" />
              <span>{mod}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Limits Section */}
      <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-3">
        <div className="flex items-center gap-2 text-[#0B5C63]">
          <HardDrive className="w-4 h-4" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#10201F]">
            Usage Limits
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] flex justify-between items-center">
            <span className="text-[#10201F]/70">Staff Accounts:</span>
            <span className="font-bold text-[#10201F]">
              {plan.usageLimits.staffAccounts === 'unlimited'
                ? 'Unlimited'
                : `${plan.usageLimits.staffAccounts} accounts`}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] flex justify-between items-center">
            <span className="text-[#10201F]/70">Departments:</span>
            <span className="font-bold text-[#10201F]">
              {plan.usageLimits.departments === 'unlimited'
                ? 'Unlimited'
                : `${plan.usageLimits.departments} departments`}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] flex justify-between items-center">
            <span className="text-[#10201F]/70">Branches:</span>
            <span className="font-bold text-[#10201F]">
              {plan.usageLimits.branches === 'unlimited'
                ? 'Unlimited'
                : `${plan.usageLimits.branches} branches`}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] flex justify-between items-center">
            <span className="text-[#10201F]/70">Storage Allowance:</span>
            <span className="font-bold text-[#10201F]">
              {plan.usageLimits.storageAllowance}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
