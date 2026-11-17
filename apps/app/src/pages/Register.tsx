/**
 * @file Registration page with fullscreen hero video background and elevated reference card design.
 */

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Logo } from '@repo/shared/component/Logo';
import { RegisterForm } from '../components/auth/RegisterForm';

/**
 * @description Bakery onboarding interface featuring video background and reference design.
 * @returns {React.ReactElement} Registration page view.
 */
export function Register(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'starter';

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center py-10 px-4 sm:px-6 overflow-hidden font-sans">

      {/* Spacer to push card towards optical center */}
      <div className="w-full h-2 z-10" />

      {/* Floating Center Card */}
      <div className="relative z-10 w-full max-w-150 bg-white rounded-xl shadow-2xl border border-white/60 overflow-hidden my-auto animate-fade-in">
        {/* Top Logo Badge Matching Brand Header */}
        <div className="pt-8 pb-3 px-8 text-center flex flex-col items-center">
          <Logo showTagline={true} />
        </div>

        {/* Card Content */}
        <div className="px-8 pb-8 pt-2">
          {/* Title & Amber Accent Line */}
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-oven-black tracking-tight">
                Create an account
              </h1>
              <div className="w-10 h-1 bg-copper mt-1.5 rounded-full" />
            </div>
            <span className="text-[11px] font-semibold text-copper uppercase tracking-wider bg-[#A9501A]/10 px-2.5 py-1 rounded-full">
              {selectedPlan} Plan
            </span>
          </div>

          {/* Form */}
          <RegisterForm selectedPlan={selectedPlan} />

          {/* Switch to Login */}
          <div className="mt-5 pt-4 border-t border-[#E5E0D0] text-center text-xs text-oven-black/70">
            <span>Already operating on Cadence? </span>
            <Link to="/login" className="font-semibold text-verdigris hover:underline">
              Sign In to workspace
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Ribbon Banner (Matching Reference) */}
      <div className="relative z-10 mt-6 w-full max-w-lg text-oven-black/95 text-xs py-2.5 px-4 flex items-center justify-center gap-2 font-medium tracking-wide">
        <span>2026 &copy; Cadence Operations & Reconciliation Platform</span>
      </div>
    </div>
  );
}
