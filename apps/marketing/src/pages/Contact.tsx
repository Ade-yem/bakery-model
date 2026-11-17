/**
 * @file Finview-styled Contact page with Dark Header Banner and clear contact layout.
 */

import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { InnerPageHero } from '../components/shared/InnerPageHero';
import { ContactForm } from '../components/shared/ContactForm';

/**
 * @description Dedicated Contact page with inquiry form and contact card info.
 * @returns {React.ReactElement} Contact page view.
 */
export function Contact(): React.ReactElement {
  return (
    <div className="bg-flour text-oven-black font-sans">
      {/* 1. Cinematic Full-Width Photographic Hero */}
      <InnerPageHero
        heading="Let's Talk About Your Business."
        description="Have questions about Cadence? Contact our team for product information, assistance, and support."
        backgroundImage="/images/4880311.jpg"
        primaryCta={{
          text: 'Get Started Free',
          href: '/register',
        }}
        secondaryCta={{
          text: 'Explore Features',
          href: '/features',
        }}
      />

      {/* 2. Contact Information & Form Split */}
      <section className="py-20 sm:py-28 border-b border-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left: Contact Info Placeholders (5 cols) */}
            <div className="lg:col-span-5 space-y-6 center lg:items-start text-center lg:text-left">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-oven-black tracking-tight mt-1 mb-3">
                  Get in touch
                </h2>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-5 rounded-2xl bg-ledger border border-rule flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-verdigris/10 text-verdigris flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-oven-black block">Central Office</span>
                    <span className="text-xs sm:text-sm text-oven-black/75 mt-0.5 block">
                      Abuja, Nigeria
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-ledger border border-rule flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-verdigris/10 text-verdigris flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-oven-black block">Phone Support</span>
                    <span className="text-xs sm:text-sm text-oven-black/75 mt-0.5 block">
                      (Mon–Fri, 6am–6pm UTC)
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-ledger border border-rule flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-verdigris/10 text-verdigris flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-oven-black block">Email Inquiries</span>
                    <span className="text-xs sm:text-sm text-oven-black/75 mt-0.5 block">
                      support@cadence.com
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form (7 cols) */}
            <div className="lg:col-span-7 bg-ledger/50 p-8 sm:p-10 rounded-3xl border border-rule">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
