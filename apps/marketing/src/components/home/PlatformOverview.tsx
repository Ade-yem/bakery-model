/**
 * @file Platform Overview section matching Finview "Featured Services" design.
 * Features 6 operational features in a self-smooth marquee slider with hover pause.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import {
  OverviewIllustrationBadge,
  type OverviewIllustrationType,
} from './OverviewIllustrationBadge';
import { TiltCard } from '../motion/TiltCard';

interface OverviewFeature {
  id: string;
  illustrationType: OverviewIllustrationType;
  title: string;
  description: string;
  link: string;
}

const OVERVIEW_FEATURES: readonly OverviewFeature[] = [
  {
    id: 'business-operations',
    illustrationType: 'operations',
    title: 'Business Operations Management',
    description:
      'Manage your entire business from one platform. Organize departments, monitor daily activities, and keep every operation connected and running smoothly.',
    link: '/features#operations',
  },
  {
    id: 'inventory-management',
    illustrationType: 'inventory',
    title: 'Inventory Management',
    description:
      'Track stock levels, monitor product movement, manage supplies, and receive timely updates to maintain accurate inventory records and reduce waste.',
    link: '/features#inventory',
  },
  {
    id: 'sales-order-management',
    illustrationType: 'sales',
    title: 'Sales & Order Management',
    description:
      'Manage customer orders, record sales, track transactions, and monitor revenue across your business with accurate, organized records.',
    link: '/features#sales',
  },
  {
    id: 'staff-department-management',
    illustrationType: 'staff',
    title: 'Staff & Department Management',
    description:
      'Create departments, assign responsibilities, manage staff access, and monitor team activities. Give every employee the tools and permissions needed for their role.',
    link: '/features#staff',
  },
  {
    id: 'financial-tracking',
    illustrationType: 'finance',
    title: 'Financial Tracking & Reconciliation',
    description:
      'Monitor business income, expenses, outstanding payments, and shift transactions. Keep financial records organized and improve accountability across your operations.',
    link: '/features#finance',
  },
  {
    id: 'reports-insights',
    illustrationType: 'reports',
    title: 'Reports & Business Insights',
    description:
      'Turn daily business activities into meaningful reports. Monitor performance, identify operational gaps, and make informed decisions using centralized business data.',
    link: '/features#analytics',
  },
] as const;

/**
 * Duplicate array for seamless infinite marquee loop.
 */
const MARQUEE_ITEMS = [...OVERVIEW_FEATURES, ...OVERVIEW_FEATURES];

/**
 * @description Finview-styled Platform Overview component with self-smooth marquee slider.
 * @returns {React.ReactElement} Platform Overview section.
 */
export function HomePlatformOverview(): React.ReactElement {
  return (
    <section className="relative py-24 sm:py-32 bg-[#F6F3EA] border-b border-[#D9D3C0] overflow-hidden">
      {/* Decorative top-right currency watermark matching Finview template */}
      <div
        className="hidden md:flex absolute top-12 right-12 w-14 h-14 rounded-full border border-[#D9D3C0]/80 items-center justify-center text-[#10201F]/20 select-none pointer-events-none"
        aria-hidden="true"
      >
        <span className="text-2xl font-serif">§</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Finview 4-dot star badge */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
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
            <span className="text-sm sm:text-base font-semibold text-[#0B5C63] tracking-wide">
              Platform Overview
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#10201F] tracking-tight leading-[1.18]">
            Empowering Your Business with Real-Time Operations and Control
          </h2>

          <p className="mt-5 text-base sm:text-lg text-[#10201F]/75 leading-relaxed font-normal max-w-2xl mx-auto">
            Take control of your entire business operations with connected tools for inventory,
            production, sales, staff management, and shift reconciliation.
          </p>
        </div>
      </div>

      {/* Infinite Self-Smooth Marquee Slider Track with Gradient Masks */}
      <div className="relative mt-16 sm:mt-20 overflow-hidden w-full">
        {/* Edge fade gradients for elegant seamless transition */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#F6F3EA] to-transparent z-10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#F6F3EA] to-transparent z-10"
          aria-hidden="true"
        />

        {/* Continuous Animated Marquee Track */}
        <div className="animate-marquee-scroll flex gap-6 px-4 py-4">
          {MARQUEE_ITEMS.map((item, idx) => (
            <TiltCard key={`${item.id}-${idx}`}>
              <div className="shrink-0 w-[300px] sm:w-[350px] lg:w-[380px] group bg-[#EFEBDB]/60 hover:bg-[#EFEBDB] rounded-3xl p-8 border border-[#D9D3C0]/90 hover:border-[#0B5C63]/60 transition-all duration-300 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing select-none h-full">
                <div>
                  {/* Visual Vector Illustration in Circular Badge */}
                  <div className="mb-7">
                    <OverviewIllustrationBadge type={item.illustrationType} />
                  </div>

                  {/* Card Title with Clear Typography */}
                  <h3 className="text-xl font-bold text-[#10201F] tracking-tight group-hover:text-[#0B5C63] transition-colors min-h-[56px] flex items-center justify-center">
                    {item.title}
                  </h3>

                  {/* Description with readable font size and high contrast */}
                  <p className="mt-3.5 text-sm sm:text-[15px] leading-relaxed text-[#10201F]/75">
                    {item.description}
                  </p>
                </div>

                {/* Arrow Pill Link at the Bottom */}
                <div className="mt-8 pt-4">
                  <Link
                    to={item.link}
                    aria-label={`Explore ${item.title}`}
                    className="w-10 h-10 rounded-full border border-[#D9D3C0] group-hover:border-[#0B5C63] bg-[#F6F3EA] group-hover:bg-[#0B5C63] flex items-center justify-center text-[#10201F]/70 group-hover:text-[#F6F3EA] transition-all duration-200"
                  >
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
