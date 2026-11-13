/**
 * @file Finview-styled Pricing page with Dark Header Banner and clear plan cards.
 */

import React, { useState } from 'react';
import { InnerPageHero } from '../components/shared/InnerPageHero';
import { PricingCard } from '../components/shared/PricingCard';
import { PRICING_PLANS } from '../data/pricing';
import { Button } from '../components/shared/Button';
import { ArrowRight } from 'lucide-react';

/**
 * @description Dedicated Pricing page with clear tier pricing and stat proof.
 * @returns {React.ReactElement} Pricing page view.
 */
export function Pricing(): React.ReactElement {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="bg-[#F6F3EA] text-[#10201F] font-sans">
      {/* 1. Cinematic Full-Width Photographic Hero */}
      <InnerPageHero

        heading="The Right Plan for Your Business."
        description="Choose a plan that supports your operational needs and gives your team the tools to work efficiently."
        backgroundImage="/images/4880311.jpg"
        primaryCta={{
          text: 'Get Started',
          href: '/register',
        }}
        secondaryCta={{
          text: 'Contact Sales',
          href: '/contact',
        }}
      />

      {/* 2. Pricing Tiers Section */}
      <section className="py-20 sm:py-24 border-b border-[#D9D3C0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Billing Switch */}
          <div className="flex items-center justify-center gap-3 mb-14">
            <span
              className={`text-sm font-semibold ${
                !isAnnual ? 'text-[#10201F]' : 'text-[#10201F]/60'
              }`}
            >
              Monthly Billing
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isAnnual}
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-[#0B5C63] focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-[#F6F3EA] shadow-md ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-sm font-semibold flex items-center gap-1.5 ${
                isAnnual ? 'text-[#10201F]' : 'text-[#10201F]/60'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#A9501A]/10 text-[#A9501A] text-xs font-bold border border-[#A9501A]/30">
                Save 20%
              </span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {PRICING_PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} isAnnual={isAnnual} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="py-20 sm:py-24 bg-[#0B5C63] text-[#F6F3EA]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready to Empower Your Operations Team?
          </h2>
          <p className="text-base sm:text-lg text-[#F6F3EA]/90 max-w-xl mx-auto leading-relaxed">
            Choose the plan that suits your operational volume and start gaining clarity across all shifts.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button to="/register" variant="copper" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              Get Started Now
            </Button>
            <Button
              to="/contact"
              variant="secondary"
              size="lg"
              className="bg-[#F6F3EA] text-[#0B5C63] hover:bg-[#EFEBDB]"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
