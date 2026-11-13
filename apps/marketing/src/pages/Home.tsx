/**
 * @file Master Homepage for TallyBakery public website.
 * Implements Finview layout structure, editorial illustrations, and interactive widgets.
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { HomeHero } from '../components/home/Hero';
import { HomePlatformOverview } from '../components/home/PlatformOverview';
import { HomeWhyChoose } from '../components/home/WhyChoose';
import { HomeWorkingProcess } from '../components/home/WorkingProcess';

/**
 * @description Master homepage component orchestrating the Finview-inspired marketing sections.
 * @returns {React.ReactElement} Complete homepage view.
 */
export function Home(): React.ReactElement {
  return (
    <div className="bg-[#F6F3EA] text-[#10201F] font-sans selection:bg-[#0B5C63] selection:text-[#F6F3EA]">
      {/* SECTION 2: HERO WITH DASHBOARD PREVIEW */}
      <HomeHero />

      {/* SECTION 3: PLATFORM OVERVIEW (FINVIEW FEATURED SERVICES STYLE) */}
      <HomePlatformOverview />

      {/* SECTION 5: WHY CHOOSE TALLYBAKERY (EDITORIAL SPLIT) */}
      <HomeWhyChoose />

      {/* SECTION 6: OUR WORKING PROCESS (FINVIEW 4-STEP CARDS + ILLUSTRATION) */}
      <HomeWorkingProcess />

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 sm:py-24 bg-[#0B5C63] text-[#F6F3EA] border-b border-[#0F7480]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F6F3EA] mb-6">
            Bring Your Entire Business Together
          </h2>

          <p className="text-base sm:text-lg text-[#F6F3EA]/90 max-w-2xl mx-auto leading-relaxed mb-8">
            Manage inventory, sales, staff, finances, and daily operations from one platform.
            Simplify workflows, improve accountability, and stay in control with TallyBakery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              to="/register"
              variant="copper"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </Button>
            <Button
              to="/contact"
              variant="secondary"
              size="lg"
              className="bg-[#F6F3EA] text-[#0B5C63] hover:bg-[#EFEBDB]"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
