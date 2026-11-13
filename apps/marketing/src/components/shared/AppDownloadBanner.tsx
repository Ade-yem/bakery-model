/**
 * @file Finview-styled "Download Our Apps / Mobile Operations" banner section.
 * Features 2 smartphone terminal mockups on left, and app capabilities & store badges on right.
 */

import React from 'react';
import { Check } from 'lucide-react';

const APP_FEATURES = [
  'Touch-Screen Till Terminal',
  'Real-Time Department Sync',
  'Offline-First Data Storage',
  'Instant Register Print & Close',
] as const;

/**
 * @description Finview-styled mobile applications section for business workstations.
 * @returns {React.ReactElement} Apps section component.
 */
export function AppDownloadBanner(): React.ReactElement {
  return (
    <section className="relative py-20 sm:py-28 bg-[#F6F3EA] border-b border-[#D9D3C0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Device illustration (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <svg
              viewBox="0 0 320 280"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-sm select-none"
            >
              {/* Back Phone (Angled) */}
              <g transform="translate(40, 20) rotate(-15)">
                <rect x="0" y="0" width="110" height="210" rx="18" fill="#10201F" stroke="#D9D3C0" strokeWidth="2" />
                <rect x="8" y="12" width="94" height="186" rx="12" fill="#0B5C63" />
                <circle cx="55" cy="18" r="3" fill="#10201F" />
                {/* Bakery card inside phone */}
                <rect x="18" y="40" width="74" height="40" rx="6" fill="#F6F3EA" />
                <line x1="26" y1="52" x2="60" y2="52" stroke="#0B5C63" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="26" y1="62" x2="78" y2="62" stroke="#A9501A" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Front Phone */}
              <g transform="translate(140, 50) rotate(12)">
                <rect x="0" y="0" width="115" height="220" rx="20" fill="#F6F3EA" stroke="#10201F" strokeWidth="3" />
                <rect x="8" y="12" width="99" height="196" rx="14" fill="#EFEBDB" />
                <circle cx="57" cy="18" r="3.5" fill="#10201F" />
                {/* Active register order screen */}
                <rect x="16" y="38" width="83" height="50" rx="8" fill="#F6F3EA" stroke="#D9D3C0" />
                <text x="24" y="55" fill="#10201F" fontSize="9" fontWeight="bold" fontFamily="Figtree">
                  Operations Terminal
                </text>
                <text x="24" y="70" fill="#0B5C63" fontSize="8" fontWeight="bold" fontFamily="Figtree">
                  Batch #104 Active
                </text>
                {/* Button pill */}
                <rect x="16" y="96" width="83" height="22" rx="11" fill="#0B5C63" />
                <text x="57" y="110" fill="#F6F3EA" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="Figtree">
                  Confirm Shift Handover
                </text>
              </g>
            </svg>
          </div>

          {/* Right: Content block (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 text-[#A9501A]" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="2" r="1.5" fill="#A9501A" />
                <circle cx="14" cy="8" r="1.5" fill="#0B5C63" />
                <circle cx="8" cy="14" r="1.5" fill="#A9501A" />
                <circle cx="2" cy="8" r="1.5" fill="#0B5C63" />
              </svg>
              <span className="text-sm font-semibold text-[#0B5C63] tracking-wide">
                Terminal & Handheld Apps
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#10201F] tracking-tight leading-[1.2]">
              Get Our Apps for Rapid Shift & Operations Management
            </h2>

            <p className="text-base sm:text-lg text-[#10201F]/75 leading-relaxed font-normal max-w-2xl">
              Turn any tablet or smartphone into an offline-first workstation. Operational crews track production runs while sales teams process customer orders without missing a beat.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 pt-2">
              {APP_FEATURES.map((feat) => (
                <div key={feat} className="flex items-center gap-2.5">
                  <span className="inline-flex items-center text-[#0B5C63]">
                    <Check className="w-4 h-4 -mr-2" strokeWidth={2.5} />
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm font-semibold text-[#10201F]/90">{feat}</span>
                </div>
              ))}
            </div>

            {/* App download pills matching Finview */}
            <div className="pt-4 flex flex-wrap gap-4">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#10201F] text-[#F6F3EA] text-xs font-semibold hover:bg-[#10201F]/90 transition-colors cursor-pointer">
                <span>Google Play</span>
              </div>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#0B5C63] text-[#F6F3EA] text-xs font-semibold hover:bg-[#0F7480] transition-colors cursor-pointer">
                <span>App Store</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
