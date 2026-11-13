/**
 * @file Finview-styled "About Us / Trusted Source" split section.
 * Features 4 value items with circular icon containers on left, and a central character illustration on right.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Scale, Award } from 'lucide-react';

const TRUST_POINTS = [
  {
    title: 'Expertise & Objectivity',
    description: 'Designed around real-world business floors, inventory warehouses, and fulfillment workflows.',
    icon: Layers,
  },
  {
    title: 'Isolated Station Roles',
    description: 'Operators manage production yields; sales teams handle orders and registers with security.',
    icon: ShieldCheck,
  },
  {
    title: 'Immutable Ledgers',
    description: 'Every stock movement and cash transaction is recorded with tamper-evident audit trails.',
    icon: Scale,
  },
  {
    title: 'Verifiable Reconciliation',
    description: 'End-of-shift drawer handovers balance to the exact currency unit before sign-off.',
    icon: Award,
  },
] as const;

/**
 * @description Finview-styled split section featuring trusted operational pillars and illustration.
 * @returns {React.ReactElement} Section element.
 */
export function AboutTrustSection(): React.ReactElement {
  return (
    <section className="relative py-24 sm:py-32 bg-[#EFEBDB]/40 border-b border-[#D9D3C0] overflow-hidden">
      {/* Decorative top-right watermark circle */}
      <div
        className="hidden md:flex absolute top-12 right-12 w-14 h-14 rounded-full border border-[#D9D3C0] items-center justify-center text-[#10201F]/20 select-none pointer-events-none"
        aria-hidden="true"
      >
        <span className="text-2xl font-serif">§</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Content & 4 Feature Rows (7 cols) */}
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
                About Us
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#10201F] tracking-tight leading-[1.18]">
              Your Trusted Platform for Business Operations & Reconciliation
            </h2>

            <p className="text-base sm:text-lg text-[#10201F]/75 leading-relaxed font-normal max-w-2xl">
              We are dedicated to providing businesses with a reliable, ledger-backed platform that eliminates discrepancies between warehouses, production units, and sales registers.
            </p>

            {/* 4 Feature Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3">
              {TRUST_POINTS.map((pt) => {
                const Icon = pt.icon;
                return (
                  <div key={pt.title} className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#F6F3EA] border border-[#D9D3C0] flex items-center justify-center shrink-0 shadow-2xs text-[#0B5C63]">
                      <Icon className="w-5 h-5 text-[#0B5C63]" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#10201F] tracking-tight">
                        {pt.title}
                      </h4>
                      <p className="text-xs text-[#10201F]/70 leading-relaxed mt-1">
                        {pt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Solid Pill CTA Button matching Finview */}
            <div className="pt-4">
              <Link
                to="/features"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#0B5C63] text-[#F6F3EA] text-sm font-bold hover:bg-[#0F7480] transition-colors shadow-xs"
              >
                Read On
              </Link>
            </div>
          </div>

          {/* Right: Vector Illustration from Public SVG with natural background blending (5 cols) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-lg lg:max-w-none flex items-center justify-center select-none">
              <img
                src="/images/about_illustration_transparent.svg"
                alt="Bakery trust and operations specialist illustration"
                className="w-full h-auto max-h-[440px] object-contain drop-shadow-sm transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
