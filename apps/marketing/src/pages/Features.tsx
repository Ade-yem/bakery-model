/**
 * @file Finview-styled Features page for TallyBakery.
 * Matches the clean layout, dark banner, and concise feature pillars.
 */

import React from 'react';
import { InnerPageHero } from '../components/shared/InnerPageHero';
import { HomePlatformOverview } from '../components/home/PlatformOverview';
import { HomeWorkingProcess } from '../components/home/WorkingProcess';
import { Button } from '../components/shared/Button';
import { ArrowRight } from 'lucide-react';

/**
 * @description Features page providing an overview of TallyBakery's operational capabilities.
 * @returns {React.ReactElement} Features page view.
 */
export function Features(): React.ReactElement {
  return (
    <div className="bg-[#F6F3EA] text-[#10201F] font-sans">
      {/* 1. Cinematic Full-Width Photographic Hero */}
      <InnerPageHero
        heading="Everything Your Business Needs to Operate Better."
        description="Explore the tools that help you manage inventory, procurement, sales, production, staff, finances, and business performance."
        backgroundImage="/images/8576717.jpg"
        primaryCta={{
          text: 'Get Started Free',
          href: '/register',
        }}
        secondaryCta={{
          text: 'View Pricing',
          href: '/pricing',
        }}
      />

      {/* 2. Platform Overview Continuous Marquee */}
      <HomePlatformOverview />

      {/* 4. Working Process */}
      <HomeWorkingProcess />

      {/* 5. Call To Action */}
      <section className="py-20 sm:py-24 bg-[#0B5C63] text-[#F6F3EA]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Take Control of Your Business Operations Today
          </h2>
          <p className="text-base sm:text-lg text-[#F6F3EA]/90 max-w-xl mx-auto leading-relaxed">
            Start organizing your inventory, operational runs, sales, and shift handovers with one
            unified platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button
              to="/register"
              variant="copper"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started Free
            </Button>
            <Button
              to="/pricing"
              variant="secondary"
              size="lg"
              className="bg-[#F6F3EA] text-[#0B5C63] hover:bg-[#EFEBDB]"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
