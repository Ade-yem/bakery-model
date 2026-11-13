/**
 * @file Pricing card component supporting monthly / annual pricing toggle states.
 */

import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { formatCurrency } from '../../utils/format';
import type { PricingPlan } from '../../types';

export interface PricingCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
  className?: string;
}

/**
 * @description Plan subscription card displaying configurable limits and feature lists.
 * @param {PricingCardProps} props - Plan configuration and billing cycle state.
 * @returns {React.ReactElement} Subscription plan card.
 */
export function PricingCard({
  plan,
  isAnnual,
  className = '',
}: PricingCardProps): React.ReactElement {
  const currentPrice = isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice;
  const isPopular = plan.isPopular;

  return (
    <div
      className={`relative rounded-2xl flex flex-col justify-between p-6 sm:p-8 transition-all duration-200 ${
        isPopular
          ? 'bg-[#EFEBDB] border-2 border-[#0B5C63] shadow-md scale-100 lg:-translate-y-2'
          : 'bg-[#EFEBDB] border border-[#D9D3C0] hover:border-[#0B5C63]/50'
      } ${className}`}
    >
      {isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F6F3EA] bg-[#0B5C63] rounded-full shadow-sm">
          Most Popular for Busy Bakeries
        </span>
      )}

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-2xl font-bold text-[#10201F] tracking-tight">{plan.name}</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#F6F3EA] border border-[#D9D3C0] text-[#10201F]">
            {plan.departmentLimit}
          </span>
        </div>

        <p className="text-xs text-[#10201F]/70 leading-relaxed mb-5 min-h-[36px]">
          {plan.tagline}
        </p>

        {/* Pricing display */}
        <div className="p-4 rounded-xl bg-[#F6F3EA] border border-[#D9D3C0] mb-6">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold text-[#A9501A] tracking-tight font-sans">
              {formatCurrency(currentPrice)}
            </span>
            <span className="text-xs font-semibold text-[#10201F]/60">/ month</span>
          </div>
          <p className="text-[11px] text-[#10201F]/60 mt-1">
            {isAnnual ? 'Billed annually • Save ~20%' : 'Billed monthly • Cancel anytime'}
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-3 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#10201F]/70 block">
            Included Capabilities
          </span>
          <ul className="space-y-2.5">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-xs text-[#10201F]/90">
                <span className="w-4 h-4 rounded-full bg-[#0B5C63]/15 text-[#0B5C63] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button
        to={`/register?plan=${plan.id}`}
        variant={isPopular ? 'primary' : 'secondary'}
        fullWidth
        size="md"
        icon={<ArrowRight className="w-4 h-4" />}
      >
        {plan.ctaText}
      </Button>
    </div>
  );
}
