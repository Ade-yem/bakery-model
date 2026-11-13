/**
 * @file Brand Logo component for TallyBakery matching Finview dual-tone logo.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showTagline?: boolean;
}

/**
 * @description Official TallyBakery logo mark and wordmark styled like Finview brand header.
 * @param {LogoProps} props - Logo display properties.
 * @returns {React.ReactElement} Clickable brand logo linking to home.
 */
export function Logo({
  variant = 'light',
  className = '',
  showTagline = false,
}: LogoProps): React.ReactElement {
  const isDark = variant === 'dark';

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5C63] rounded-md ${className}`}
      aria-label="TallyBakery Home"
    >
      {/* Finview-style balance/oven mark */}
      <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#0B5C63] text-[#F6F3EA] shadow-xs transition-transform group-hover:scale-105">
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Bakery loaf dome */}
          <path
            d="M4 15C4 10.5 7.5 7 12 7C16.5 7 20 10.5 20 15C20 16 19 17 18 17H6C5 17 4 16 4 15Z"
            fill="#F6F3EA"
          />
          {/* Scoring lines in Copper */}
          <path
            d="M9 13V10M12 13V9M15 13V10"
            stroke="#A9501A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#A9501A] border-2 border-[#F6F3EA]"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center tracking-tight font-extrabold text-xl font-sans uppercase">
          <span className={isDark ? 'text-[#E9E4D2]' : 'text-[#0B5C63]'}>TALLY</span>
          <span className="text-[#A9501A] ml-0.5">BAKERY</span>
        </div>
        {showTagline && (
          <span
            className={`text-[9px] tracking-widest uppercase font-semibold mt-0.5 ${
              isDark ? 'text-[#E9E4D2]/60' : 'text-[#10201F]/60'
            }`}
          >
            Connected Operations
          </span>
        )}
      </div>
    </Link>
  );
}
