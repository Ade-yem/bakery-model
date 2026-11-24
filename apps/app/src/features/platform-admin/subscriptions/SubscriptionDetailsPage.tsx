/**
 * @file Subscription Details page presenting subscription terms, independent payments, and history timeline.
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, History, Calendar, CheckCircle2 } from 'lucide-react';
import { SubscriptionPaymentHistorySection } from './components/SubscriptionPaymentHistorySection';
import { MOCK_PLATFORM_SUBSCRIPTIONS } from '../mock-subscriptions';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { PlatformSubscription } from '../types';

export interface SubscriptionDetailsPageProps {
  /** Optional authenticated actor. */
  actor?: AuthenticatedActor;
  /** Optional dataset override. */
  subscriptions?: PlatformSubscription[];
}

/**
 * @description Comprehensive inspection page for a client business subscription record.
 * @param {SubscriptionDetailsPageProps} props - Component properties.
 * @returns {React.ReactElement} Details page element.
 */
export function SubscriptionDetailsPage({
  actor: _actor,
  subscriptions = MOCK_PLATFORM_SUBSCRIPTIONS,
}: SubscriptionDetailsPageProps): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const sub = subscriptions.find((s) => s.id === id);

  if (!sub) {
    return (
      <div className="p-8 text-center rounded-xl border border-[#D9D3C0] bg-white font-sans max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-[#10201F]">Subscription Not Found</h2>
        <p className="text-sm text-[#10201F]/70">
          The requested subscription record does not exist on the platform.
        </p>
        <Link
          to="/admin/subscriptions"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B5C63] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subscriptions</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      {/* Header */}
      <div>
        <Link
          to="/admin/subscriptions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5C63] hover:text-[#0B5C63]/80 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Subscriptions</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-[#10201F]">{sub.businessName}</h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#0B5C63]/10 text-[#0B5C63] font-bold">
                {sub.id}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#10201F]/70 mt-1">
              {sub.planName} · ₦{sub.price.toLocaleString()} ({sub.billingPeriod})
            </p>
          </div>
        </div>
      </div>

      {/* 1. Subscription Information */}
      <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-4">
        <div className="flex items-center gap-2 text-[#0B5C63]">
          <Calendar className="w-4 h-4" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#10201F]">
            Subscription Information
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg border border-[#D9D3C0] bg-[#FDFCF7]">
            <span className="text-[#10201F]/60 block mb-1">Subscription Status:</span>
            <span className="font-bold text-sm text-[#10201F] capitalize">{sub.status}</span>
          </div>
          <div className="p-3 rounded-lg border border-[#D9D3C0] bg-[#FDFCF7]">
            <span className="text-[#10201F]/60 block mb-1">Start Date:</span>
            <span className="font-bold text-sm text-[#10201F]">
              {new Date(sub.startDate).toLocaleDateString()}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-[#D9D3C0] bg-[#FDFCF7]">
            <span className="text-[#10201F]/60 block mb-1">Expiry Date:</span>
            <span className="font-bold text-sm text-[#10201F]">
              {new Date(sub.expiryDate).toLocaleDateString()}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-[#D9D3C0] bg-[#FDFCF7]">
            <span className="text-[#10201F]/60 block mb-1">Auto-Renew:</span>
            <span className="font-bold text-sm text-[#10201F]">
              {sub.autoRenew ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Payment Information */}
      <SubscriptionPaymentHistorySection paymentRecords={sub.paymentRecords} />

      {/* 3. Plan Features */}
      <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-4">
        <div className="flex items-center gap-2 text-[#0B5C63]">
          <ShieldCheck className="w-4 h-4" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#10201F]">
            Plan Features
          </h2>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[#10201F]/60 block mb-1 font-semibold">Included Modules:</span>
            <div className="flex flex-wrap gap-2">
              {sub.includedModules.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-md border border-[#D9D3C0] bg-[#FDFCF7] font-semibold text-[#10201F] flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#2C571D]" />
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#D9D3C0]/60">
            <div>
              <span className="text-[#10201F]/60 block">Staff Limit:</span>
              <span className="font-bold text-[#10201F]">
                {sub.usageLimits.staffAccounts === 'unlimited' ? 'Unlimited' : sub.usageLimits.staffAccounts}
              </span>
            </div>
            <div>
              <span className="text-[#10201F]/60 block">Depts Limit:</span>
              <span className="font-bold text-[#10201F]">
                {sub.usageLimits.departments === 'unlimited' ? 'Unlimited' : sub.usageLimits.departments}
              </span>
            </div>
            <div>
              <span className="text-[#10201F]/60 block">Branches:</span>
              <span className="font-bold text-[#10201F]">
                {sub.usageLimits.branches === 'unlimited' ? 'Unlimited' : sub.usageLimits.branches}
              </span>
            </div>
            <div>
              <span className="text-[#10201F]/60 block">Storage:</span>
              <span className="font-bold text-[#10201F]">{sub.usageLimits.storageAllowance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Subscription History Timeline */}
      <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-4">
        <div className="flex items-center gap-2 text-[#0B5C63]">
          <History className="w-4 h-4" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#10201F]">
            Subscription History
          </h2>
        </div>
        {sub.historyEvents.length === 0 ? (
          <p className="text-xs text-[#10201F]/60">No history events recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {sub.historyEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-xs flex justify-between items-start gap-4"
              >
                <div>
                  <p className="font-bold text-[#10201F]">{evt.title}</p>
                  <p className="text-[#10201F]/70 mt-0.5">{evt.description}</p>
                  <p className="text-[11px] text-[#0B5C63] font-medium mt-1">Actor: {evt.actorName}</p>
                </div>
                <span className="text-[11px] text-[#10201F]/50 whitespace-nowrap">
                  {new Date(evt.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
