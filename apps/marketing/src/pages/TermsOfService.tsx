/**
 * @file Terms of Service page layout for TallyBakery public website.
 * Note: Clearly labeled placeholder legal content.
 */

import React from 'react';

/**
 * @description Terms of Service page displaying customer subscription and operational obligations.
 * @returns {React.ReactElement} Terms of Service page view.
 */
export function TermsOfService(): React.ReactElement {
  return (
    <div className="bg-[#F6F3EA] text-[#10201F] font-sans">
      <section className="py-16 sm:py-20 border-b border-[#D9D3C0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#10201F] tracking-tight mb-4">
            Terms of Service
          </h1>
        </div>
      </section>

      <section className="py-16 border-b border-[#D9D3C0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Explicit Placeholder Advisory Banner */}
  
          <article className="prose prose-sm max-w-none space-y-6 text-sm text-[#10201F]/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#10201F] mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or registering for the TallyBakery platform, you agree to comply with
                these Terms of Service. If you are registering on behalf of a commercial enterprise,
                retailer, manufacturer, or corporate entity, you represent that you possess the
                authority to bind that entity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#10201F] mb-2">
                2. Operational Ledger Responsibility
              </h2>
              <p>
                TallyBakery provides mathematical reconciliation tools for inventory, production,
                and cash drawers. Users remain responsible for accurate physical inventory counts,
                correct bill-of-materials ratios, and genuine staff credential management.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#10201F] mb-2">
                3. Role Governance & Access Boundaries
              </h2>
              <p>
                Business owners and managers are responsible for designating appropriate operational
                roles (Owner, Manager, Staff) and maintaining departmental permissions so that
                sensitive financial records remain restricted to authorized individuals.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#10201F] mb-2">4. Service Availability</h2>
              <p>
                While TallyBakery incorporates an offline-first architecture to sustain operations
                during local network interruptions, cloud sync and remote reporting depend on
                internet connectivity. We commit to maintaining high service availability standards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#10201F] mb-2">5. Contact Information</h2>
              <p>
                For questions regarding terms or enterprise licensing agreements, please contact{' '}
                <a
                  href="mailto:legal@tallybakery.com"
                  className="text-[#0B5C63] font-semibold underline"
                >
                  legal@tallybakery.com
                </a>
                .
              </p>
            </section>
          </article>
        </div>
      </section>
    </div>
  );
}
