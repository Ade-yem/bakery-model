/**
 * @file Finview-styled How It Works page for TallyBakery.
 * Features Dark Header Banner, 4-Step Working Process, App Terminals Banner, and CTA.
 */

import React from 'react';
import { InnerPageHero } from '../components/shared/InnerPageHero';
import { HomeWorkingProcess } from '../components/home/WorkingProcess';
import { Button } from '../components/shared/Button';
import { ArrowRight } from 'lucide-react';

/**
 * @description Dedicated How It Works page matching the Finview layout.
 * @returns {React.ReactElement} How It Works view.
 */
export function HowItWorks(): React.ReactElement {
  return (
    <div className="bg-[#F6F3EA] text-[#10201F] font-sans">
      {/* 1. Cinematic Full-Width Photographic Hero */}
      <InnerPageHero
        heading="From Business Setup to Daily Operations, Made Simple."
        description="Set up your business, organize departments, assign responsibilities, and manage daily operations from one connected platform."
        backgroundImage="/images/8576717.jpg"
        primaryCta={{
          text: 'Get Started Free',
          href: '/register',
        }}
        secondaryCta={{
          text: 'Explore Features',
          href: '/features',
        }}
      />

      {/* 3. 4-Step Working Process */}
      <HomeWorkingProcess />

      {/* 5. Call to Action */}
      <section className="py-20 sm:py-24 bg-[#0B5C63] text-[#F6F3EA]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready to Streamline Your Daily Business Operations?
          </h2>
          <p className="text-base sm:text-lg text-[#F6F3EA]/90 max-w-xl mx-auto leading-relaxed">
            Set up your organization, invite your team, and begin managing your operations in
            minutes.
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
              to="/about"
              variant="secondary"
              size="lg"
              className="bg-[#F6F3EA] text-[#0B5C63] hover:bg-[#EFEBDB]"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
