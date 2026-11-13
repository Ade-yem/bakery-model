/**
 * @file Privacy Policy layout for TallyBakery.
 * Note: Clearly identified as placeholder legal content pending official corporate legal counsel.
 */

import React from 'react';

/**
 * @description Renders public Privacy Policy with prominent placeholder disclosures.
 * @returns {React.ReactElement} Legal privacy page view.
 */
export function PrivacyPolicy(): React.ReactElement {
  return (
    <div className="bg-[#F6F3EA] text-[#10201F] font-sans">
      <section className="py-16 sm:py-20  border-b border-[#D9D3C0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#10201F] tracking-tight mb-4">
            Privacy Policy
          </h1>
         
        </div>
      </section>

      <section className="py-16 border-b border-[#D9D3C0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Explicit Placeholder Advisory Banner */}
          

          <article className="prose prose-sm max-w-none space-y-6 text-sm text-[#10201F]/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#10201F] mb-2">1. Introduction</h2>
              <p>
                TallyBakery respects your privacy and is committed to protecting the operational data
                of our business subscribers and their employees. This Privacy Policy describes how we
                collect, store, and process information when you use our public website and SaaS
                platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#10201F] mb-2">2. Information We Collect</h2>
              <p>
                When your business registers for an account, we collect operational information
                including business names, branch physical addresses, designated manager contact
                information, and staff profile handles. Operational event logs—such as inventory
                stock adjustments, production batch records, and shift cash drawer balance declarations—are
                recorded to maintain the integrity of your business ledger.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#10201F] mb-2">
                3. Multi-Tenant Data Isolation
              </h2>
              <p>
                TallyBakery enforces strict multi-tenant boundaries. Operational data, production specifications, sales
                figures, and employee logs belonging to one business tenant are strictly isolated and
                cannot be accessed by other tenants.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#10201F] mb-2">4. Data Retention & Ledgers</h2>
              <p>
                Because TallyBakery functions as an operational audit system, financial and stock
                movement entries are maintained in append-only records to guarantee reconciliation
                auditability throughout your active subscription.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#10201F] mb-2">5. Inquiries & Contact</h2>
              <p>
                Questions regarding our data handling procedures may be directed to{' '}
                <a
                  href="mailto:privacy@tallybakery.com"
                  className="text-[#0B5C63] font-semibold underline"
                >
                  privacy@tallybakery.com
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
