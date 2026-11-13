/**
 * @file Finview-styled Why Choose Us split section.
 * Features vector consultation graphic on left and editorial copy with 4 double-check items and pill CTA on right.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const VALUE_PROPOSITIONS = [
  { label: 'Centralized Management' },
  { label: 'Real-Time Visibility' },
  { label: 'Staff & Department Control' },
  { label: 'Reliable Business Records' },
] as const;

/**
 * @description Why Choose Us section strictly matching Finview reference layout and typography.
 * @returns {React.ReactElement} Section element.
 */
export function HomeWhyChoose(): React.ReactElement {
  return (
    <section className="relative py-24 sm:py-32 bg-[#F6F3EA] border-b border-[#D9D3C0] overflow-hidden">
      {/* Subtle globe watermark in the upper right matching template */}
      <div
        className="hidden xl:flex absolute top-12 right-12 w-14 h-14 rounded-full border border-[#D9D3C0]/70 items-center justify-center text-[#10201F]/20 select-none pointer-events-none"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8" strokeWidth="1">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Seamless Editorial Vector Illustration without enclosing box (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-lg lg:max-w-none flex items-center justify-center">
              <img
                src="/images/magnific_flatdesignbusinesscommunicationconcept5268376243_lJoFq9sgv9.png"
                alt="Business team consultation and operational communication"
                className="w-full h-auto max-h-[420px] object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105 select-none"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: Explanatory Content Block (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Finview 4-dot star badge */}
            <div className="inline-flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#A9501A]"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="8" cy="2" r="1.5" fill="#A9501A" />
                <circle cx="14" cy="8" r="1.5" fill="#0B5C63" />
                <circle cx="8" cy="14" r="1.5" fill="#A9501A" />
                <circle cx="2" cy="8" r="1.5" fill="#0B5C63" />
              </svg>
              <span className="text-sm font-semibold text-[#0B5C63] tracking-wide">
                Why Choose Us
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#10201F] tracking-tight leading-[1.18]">
              Smarter Business Operations. Complete Control.
            </h2>

            {/* Description Paragraph */}
            <p className="text-base sm:text-lg text-[#10201F]/75 leading-relaxed font-normal max-w-2xl">
             Manage your departments, inventory, sales, staff, and finances from one connected platform designed to simplify daily business operations.
            </p>

            {/* 4 Feature Checklist Items with double-check motif */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 pt-2">
              {VALUE_PROPOSITIONS.map((prop) => (
                <div key={prop.label} className="flex items-center gap-2.5">
                  <span className="inline-flex items-center text-[#0B5C63]">
                    <Check className="w-4 h-4 -mr-2" strokeWidth={2.5} />
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm sm:text-[15px] font-semibold text-[#10201F]/90">
                    {prop.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Solid Pill CTA Button "Read On" matching Finview */}
            <div className="pt-4">
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#0B5C63] text-[#F6F3EA] text-sm font-bold hover:bg-[#0F7480] transition-colors shadow-xs"
              >
                Read On
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
