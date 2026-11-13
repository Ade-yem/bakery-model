/**
 * @file Finview-style vector illustration badges for the Platform Overview cards.
 * Tailored vector illustrations in circular frames with official palette accents.
 */

import React from 'react';

export type OverviewIllustrationType =
  | 'operations'
  | 'inventory'
  | 'sales'
  | 'staff'
  | 'finance'
  | 'reports';

export interface OverviewIllustrationProps {
  type: OverviewIllustrationType;
  className?: string;
}

/**
 * @description Renders a tailored Finview-style vector line illustration inside a circular container.
 * @param {OverviewIllustrationProps} props Component props.
 * @returns {React.ReactElement} SVG vector illustration badge.
 */
export function OverviewIllustrationBadge({
  type,
  className = '',
}: OverviewIllustrationProps): React.ReactElement {
  return (
    <div
      className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#EFEBDB]/80 border-2 border-[#D9D3C0] flex items-center justify-center p-3.5 mx-auto transition-transform duration-300 group-hover:scale-105 group-hover:border-[#0B5C63]/50 ${className}`}
    >
      {type === 'operations' && (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          className="w-full h-full text-[#0B5C63]"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Central bakery operations hub / connected gears and house */}
          <rect x="10" y="14" width="28" height="24" rx="4" />
          <path d="M10 24h28" />
          <path d="M24 14v24" />
          <circle cx="24" cy="24" r="5" strokeWidth="2" fill="#EFEBDB" />
          <circle cx="24" cy="24" r="2" fill="#A9501A" stroke="none" />
          {/* Spark rays */}
          <path d="M24 6v4" />
          <path d="M16 8l2 2" />
          <path d="M32 8l-2 2" />
          <circle cx="24" cy="6" r="1.5" fill="#A9501A" stroke="none" />
        </svg>
      )}

      {type === 'inventory' && (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          className="w-full h-full text-[#0B5C63]"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Warehouse inventory / sack / balance scale */}
          <path d="M12 20a12 12 0 0 1 24 0c0 8-4 16-12 16s-12-8-12-16Z" />
          <path d="M20 10h8" />
          <path d="M24 6v4" />
          <path d="M18 24h12" />
          <path d="M21 29h6" />
          <path d="M6 38h36" strokeWidth="2" />
          <circle cx="24" cy="20" r="1.5" fill="#A9501A" stroke="none" />
          <circle cx="9" cy="14" r="1" fill="#0B5C63" stroke="none" />
          <circle cx="39" cy="14" r="1" fill="#0B5C63" stroke="none" />
        </svg>
      )}

      {type === 'sales' && (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          className="w-full h-full text-[#0B5C63]"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Register counter / Sales & Receipt balance */}
          <path d="M10 38V18l14-6 14 6v20" />
          <path d="M10 38h28" strokeWidth="2" />
          <rect x="18" y="22" width="12" height="10" rx="1.5" />
          <path d="M22 27h4" />
          <circle cx="24" cy="15" r="2" fill="#A9501A" stroke="none" />
          <circle cx="36" cy="12" r="4" strokeWidth="1.5" />
          <path d="M36 10v4M34.5 12h3" strokeWidth="1.25" />
        </svg>
      )}

      {type === 'staff' && (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          className="w-full h-full text-[#0B5C63]"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Team / Department / Responsibility coordination */}
          <circle cx="24" cy="15" r="5" />
          <path d="M14 36c0-5.5 4.5-9 10-9s10 3.5 10 9" />
          <circle cx="12" cy="18" r="3.5" />
          <path d="M6 35c0-3.5 3-6 7-6" />
          <circle cx="36" cy="18" r="3.5" />
          <path d="M42 35c0-3.5-3-6-7-6" />
          <circle cx="24" cy="8" r="1.5" fill="#A9501A" stroke="none" />
        </svg>
      )}

      {type === 'finance' && (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          className="w-full h-full text-[#0B5C63]"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Financial ledger / Bank reconciliation / Coin stack */}
          <rect x="10" y="10" width="28" height="28" rx="3" />
          <path d="M10 18h28" />
          <path d="M18 10v28" />
          <circle cx="30" cy="28" r="4" strokeWidth="1.5" />
          <path d="M30 26v4M28.5 28h3" strokeWidth="1.2" />
          <circle cx="24" cy="6" r="1.5" fill="#A9501A" stroke="none" />
          <path d="M14 24h2" />
          <path d="M14 30h2" />
        </svg>
      )}

      {type === 'reports' && (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          className="w-full h-full text-[#0B5C63]"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Analytics chart / Insights / Growing trend arrow */}
          <rect x="8" y="8" width="32" height="32" rx="4" />
          <path d="M14 32v-6" strokeWidth="2.5" />
          <path d="M22 32v-12" strokeWidth="2.5" />
          <path d="M30 32v-18" strokeWidth="2.5" />
          <path d="M14 22l8-6 8 4 6-8" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="36" cy="12" r="1.5" fill="#A9501A" stroke="none" />
        </svg>
      )}
    </div>
  );
}
