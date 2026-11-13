import React, { useState } from 'react';
import { TiltCard } from '../motion/TiltCard';

interface WorkingStep {
  step: string;
  title: string;
  description: string;
  icon: string;
}

const WORKING_STEPS: readonly WorkingStep[] = [
  {
    step: '01',
    title: 'Business Setup',
    description:
      'Configure your business, create departments, and define operational responsibilities.',
    icon: 'setup',
  },
  {
    step: '02',
    title: 'Department Management',
    description: 'Organize teams, assign duties, and control departmental access and permissions.',
    icon: 'departments',
  },
  {
    step: '03',
    title: 'Inventory & Procurement',
    description: 'Monitor stock levels, manage supplies, and track purchasing activities.',
    icon: 'inventory',
  },
  {
    step: '04',
    title: 'Sales & Orders',
    description: 'Record sales, manage customer orders, and track business transactions.',
    icon: 'sales',
  },
  {
    step: '05',
    title: 'Staff & Shift Management',
    description: 'Manage employees, monitor activities, and maintain accurate shift records.',
    icon: 'staff',
  },
  {
    step: '06',
    title: 'Financial Tracking',
    description: 'Track income, expenses, outstanding payments, and daily transactions.',
    icon: 'finance',
  },
  {
    step: '07',
    title: 'Reports & Analytics',
    description: 'Review business performance, monitor operational trends, and evaluate results.',
    icon: 'reports',
  },
  {
    step: '08',
    title: 'AI Business Insights',
    description:
      'Turn business data into actionable insights to support better operational decisions.',
    icon: 'insights',
  },
];

const ICONS: Record<string, React.ReactNode> = {
  setup: (
    <>
      <rect x="7" y="7" width="22" height="22" rx="4" />
      <path d="M12 14h12M12 19h8M12 24h5" />
      <circle cx="25" cy="25" r="3" fill="#A9501A" stroke="none" />
    </>
  ),
  departments: (
    <>
      <rect x="13" y="5" width="10" height="8" rx="2" />
      <rect x="4" y="23" width="10" height="8" rx="2" />
      <rect x="22" y="23" width="10" height="8" rx="2" />
      <path d="M18 13v5M9 23v-5h18v5" />
    </>
  ),
  inventory: (
    <>
      <path d="m18 4 13 7-13 7-13-7 13-7Z" />
      <path d="M5 11v14l13 7 13-7V11M18 18v14" />
      <path d="m12 8 13 7" stroke="#A9501A" />
    </>
  ),
  sales: (
    <>
      <rect x="5" y="8" width="26" height="21" rx="3" />
      <path d="M11 8V5h14v3M5 15h26M12 21h5M12 25h12" />
      <circle cx="25" cy="21" r="2" fill="#A9501A" stroke="none" />
    </>
  ),
  staff: (
    <>
      <circle cx="13" cy="12" r="5" />
      <circle cx="25" cy="14" r="4" />
      <path d="M3 30c0-6 4-9 10-9s10 3 10 9M22 23c5-1 10 2 11 7" />
    </>
  ),
  finance: (
    <>
      <rect x="5" y="7" width="26" height="22" rx="3" />
      <path d="M5 14h26M11 22h5M23 22h3" />
      <path d="M18 4v5" stroke="#A9501A" />
    </>
  ),
  reports: (
    <>
      <path d="M6 30V6M6 30h26" />
      <rect x="10" y="19" width="5" height="11" rx="1" />
      <rect x="18" y="13" width="5" height="17" rx="1" />
      <rect x="26" y="7" width="5" height="23" rx="1" />
    </>
  ),
  insights: (
    <>
      <path d="M18 4a10 10 0 0 0-6 18v4h12v-4a10 10 0 0 0-6-18Z" />
      <path d="M13 31h10M15 35h6M18 9v5M13 14l3 3M23 14l-3 3" />
      <path d="m25 5 2-2M29 11h3" stroke="#A9501A" />
    </>
  ),
};

export function HomeWorkingProcess(): React.ReactElement {
  const [activeStep, setActiveStep] = useState('01');

  return (
    <section className="relative pt-24 sm:pt-32 pb-28 sm:pb-36 bg-[#F6F3EA] border-b border-[#D9D3C0] overflow-hidden">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 sm:h-52 bg-[#EFEBDB]/50 border-t border-[#D9D3C0]/40"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-20">
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
              Our Working Process
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#10201F] tracking-tight leading-[1.18]">
            Everything Your Business Needs to Stay Organized
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#10201F]/70 leading-relaxed max-w-2xl mx-auto">
            Manage daily activities, coordinate departments, track transactions, and maintain
            complete control of your business from one connected platform.
          </p>
        </div>

        {/* Process Cards with Transmission Flow Lines */}
        <div
          data-reveal-group
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative"
        >
          {WORKING_STEPS.map((item, index) => {
            const isActive = activeStep === item.step;
            const isNotLastInRow = (index + 1) % 4 !== 0;

            return (
              <div key={item.step} className="relative flex flex-col h-full">
                {/* Horizontal Transmission Line between step nodes on desktop */}
                {isNotLastInRow && (
                  <div
                    className="hidden lg:flex items-center absolute top-[52px] -right-5 w-5 h-4 z-20 pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="w-full h-[2px] bg-gradient-to-r from-[#0B5C63]/60 via-[#A9501A]/60 to-[#0B5C63]/60 relative flex items-center justify-end">
                      {/* Pulse Node Indicator */}
                      <span className="w-2 h-2 rounded-full bg-[#A9501A] shadow-xs translate-x-1" />
                    </div>
                  </div>
                )}

                <TiltCard className="h-full">
                  <button
                    type="button"
                    onClick={() => setActiveStep(item.step)}
                    aria-pressed={isActive}
                    className={`group w-full h-full rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col items-center text-center relative shadow-sm min-h-[290px] ${
                      isActive
                        ? 'bg-[#F6F3EA] border-2 border-[#10201F] ring-1 ring-[#10201F]/10 -translate-y-1'
                        : 'bg-[#F6F3EA]/95 border border-[#D9D3C0] hover:border-[#10201F]/50 hover:bg-[#F6F3EA]'
                    }`}
                  >
                    {/* Icon */}
                    <div className="relative mb-7 mt-2">
                      <div className="w-[88px] h-[88px] rounded-full border-2 border-dashed border-[#D9D3C0] group-hover:border-[#0B5C63]/60 p-2 flex items-center justify-center bg-[#EFEBDB]/70 transition-transform duration-300 group-hover:scale-105">
                        <div className="w-16 h-16 rounded-full bg-[#F6F3EA] border border-[#D9D3C0]/60 flex items-center justify-center shadow-sm">
                          <svg
                            viewBox="0 0 36 36"
                            fill="none"
                            stroke="currentColor"
                            className="w-7 h-7 text-[#0B5C63]"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            {ICONS[item.icon as keyof typeof ICONS]}
                          </svg>
                        </div>
                      </div>

                      {/* Number */}
                      <span className="absolute top-0 right-0 w-6 h-6 rounded-full bg-[#0B5C63] text-[#F6F3EA] text-[11px] font-bold flex items-center justify-center shadow-sm">
                        {item.step}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-[#10201F] tracking-tight group-hover:text-[#0B5C63] transition-colors mb-3">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-[#10201F]/70 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Active Indicator */}
                    <span
                      className={`mt-auto pt-5 text-xs font-semibold transition-colors ${
                        isActive ? 'text-[#0B5C63]' : 'text-[#10201F]/40 group-hover:text-[#0B5C63]'
                      }`}
                    ></span>
                  </button>
                </TiltCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
