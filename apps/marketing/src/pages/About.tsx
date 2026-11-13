/**
 * @file Finview-styled "About Us" page.
 * Implements the full page composition from the reference image:
 * 1. Dark Header Banner with Breadcrumbs & Vector Artwork
 * 2. Why Choose Us (Consultation Editorial)
 * 3. About Us / Trusted Platform (4 Feature Points & Center Character)
 * 4. 4 Metric Counters Strip
 * 5. Our Working Process (4 Numbered Cards + Illustration)
 * 6. App Download Banner (Dual Phone Terminals)
 * 7. Call To Action Footer
 */

import React from 'react';
import { InnerPageHero } from '../components/shared/InnerPageHero';
import { HomeWhyChoose } from '../components/home/WhyChoose';
import { AboutTrustSection } from '../components/shared/AboutTrustSection';
import { HomeWorkingProcess } from '../components/home/WorkingProcess';
import { Button } from '../components/shared/Button';
import { ArrowRight } from 'lucide-react';

/**
 * @description Dedicated About Us page with cinematic photographic hero.
 * @returns {React.ReactElement} About page view.
 */
export function About(): React.ReactElement {
  return (
    <div className="bg-[#F6F3EA] text-[#10201F] font-sans">
      {/* 1. Cinematic Full-Width Photographic Hero */}
      <InnerPageHero
        heading="Better Operations. Better Business Management."
        description="Learn how TallyBakery connects business operations, departments, teams, and records in one centralized platform."
        backgroundImage="/images/magnific_flatdesignbusinesscommunicationconcept5268376243_lJoFq9sgv9.png"
        primaryCta={{
          text: 'Get Started Free',
          href: '/register',
        }}
        secondaryCta={{
          text: 'Explore Features',
          href: '/features',
        }}
      />

      {/* 2. Why Choose Us Split Editorial Section */}
      <HomeWhyChoose />

      {/* 3. About Us / Trusted Platform (4 Value Points + Central Specialist Illustration) */}
      <AboutTrustSection />

      {/* 5. Our Working Process (4 Cards + Character Illustration) */}
      <HomeWorkingProcess />

      {/* 7. Final Call to Action */}
      <section className="py-20 sm:py-24 bg-[#0B5C63] text-[#F6F3EA]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready to Connect Your Business Operations?
          </h2>
          <p className="text-base sm:text-lg text-[#F6F3EA]/90 max-w-xl mx-auto leading-relaxed">
            Join growing businesses across retail, manufacturing, and commerce that maintain clarity
            across inventory intake, daily production, and sales.
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
