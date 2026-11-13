/**
 * @file Finview-styled Inner Page Banner Header with Dark Green surface, breadcrumbs, and floating editorial graphic badge.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export interface PageHeaderBannerProps {
  title: string;
  badge?: string;
  subtitle?: string;
  illustrationType?: 'teamwork' | 'analytics' | 'workflow' | 'pricing';
}

/**
 * @description Master dark header banner matching the Finview "About Us" page header.
 * @param {PageHeaderBannerProps} props Title and optional subtitle/badge.
 * @returns {React.ReactElement} Scalable banner component.
 */
export function PageHeaderBanner({
  title,
  subtitle,
}: PageHeaderBannerProps): React.ReactElement {
  return (
    <section className="relative bg-[#0C1716] text-[#E9E4D2] pt-14 pb-16 sm:py-20 border-b border-[#0F7480]/30 overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute -top-24 right-0 w-96 h-96 rounded-full bg-[#52C2C9]/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Breadcrumbs & Page Title */}
        <div className="space-y-3 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#E9E4D2] tracking-tight">
            {title}
          </h1>

          {/* Breadcrumb links */}
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-[#E9E4D2]/60 font-medium">
            <Link to="/" className="hover:text-[#52C2C9] transition-colors">
              Home
            </Link>
            <span>›</span>
            <span>Pages</span>
            <span>›</span>
            <span className="text-[#52C2C9]">{title}</span>
          </div>

          {subtitle && (
            <p className="pt-2 text-sm sm:text-base text-[#E9E4D2]/75 max-w-xl font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Floating Vector Illustration in Dark Pill Badge matching Finview */}
        <div className="shrink-0 w-48 sm:w-56 h-36 sm:h-40 rounded-3xl bg-[#10201F] border border-[#52C2C9]/20 p-4 flex items-center justify-center relative shadow-lg">
          <svg
            viewBox="0 0 200 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full select-none"
          >
            {/* Background graph bars in copper & teal */}
            <rect x="25" y="80" width="10" height="35" rx="2" fill="#F09A5E" />
            <rect x="40" y="65" width="10" height="50" rx="2" fill="#52C2C9" />
            <rect x="55" y="50" width="10" height="65" rx="2" fill="#9BD46F" />
            {/* Table and talking professionals silhouette */}
            <path d="M75 110H175V115H75V110Z" fill="#E9E4D2" />
            <circle cx="100" cy="80" r="12" fill="#52C2C9" />
            <path d="M88 110C88 98 94 92 100 92C106 92 112 98 112 110" fill="#52C2C9" />
            <circle cx="150" cy="80" r="12" fill="#E9E4D2" />
            <path d="M138 110C138 98 144 92 150 92C156 92 162 98 162 110" fill="#E9E4D2" />
            {/* Laptop in center */}
            <rect x="118" y="98" width="16" height="12" rx="1.5" fill="#F09A5E" />
          </svg>
        </div>
      </div>
    </section>
  );
}
