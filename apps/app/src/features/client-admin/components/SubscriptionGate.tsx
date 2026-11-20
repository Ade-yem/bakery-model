/**
 * @file Feature upgrade banner displayed when an operational module or branch feature
 * is not included in the client business's active subscription tier.
 */

import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/shared/Button';

export interface SubscriptionGateProps {
  featureName: string;
  requiredTier?: string;
  description?: string;
}

export function SubscriptionGate({
  featureName,
  requiredTier = 'Growth or Enterprise',
  description = 'This operational capability is not included in your business subscription tier. Upgrade your workspace plan to unlock multi-branch management and automated workflows.',
}: SubscriptionGateProps): React.ReactElement {
  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto my-8">
      <div className="bg-white rounded-3xl border border-[#D9D3C0] p-8 md:p-10 shadow-xs text-center space-y-6 font-sans">
        <div className="w-16 h-16 rounded-3xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center mx-auto shadow-2xs">
          <Sparkles size={32} />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wider bg-[#0B5C63]/10 text-[#0B5C63] border border-[#0B5C63]/20">
            Subscription Upgrade Required
          </span>
          <h2 className="text-2xl font-black text-[#10201F] tracking-tight">
            Unlock {featureName}
          </h2>
          <p className="text-sm text-[#10201F]/70 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F6F3EA] border border-[#D9D3C0]/60 max-w-md mx-auto text-xs text-[#10201F]/80 flex items-center justify-between">
          <span>Required Plan Tier:</span>
          <span className="font-bold text-[#0B5C63]">{requiredTier}</span>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            onClick={() => alert('Contacting Cadence account manager for plan upgrade...')}
          >
            Upgrade Plan Tier
          </Button>
          <Button
            variant="ghost"
            size="md"
            to="/business/dashboard"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
