/**
 * @file Sign In page with fullscreen hero video background and centered elevated modal card.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/shared/Logo';
import { LoginForm } from '../components/auth/LoginForm';

/**
 * @description Sign In view featuring background looping video and reference card design.
 * @returns {React.ReactElement} Login page view.
 */
export function Login(): React.ReactElement {
  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center py-10 px-4 sm:px-6 overflow-hidden font-sans">
      {/* Background Video Layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src="/videos/hero-background.mp4" type="video/mp4" />
      </video>

      {/* Translucent Soft Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F6F3EA]/85 via-[#F6F3EA]/75 to-[#10201F]/80 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* Spacer to push card towards optical center */}
      <div className="w-full h-2 z-10" />

      {/* Floating Center Card (Matching Reference Layout) */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-xl shadow-2xl border border-white/60 overflow-hidden my-auto animate-fade-in">
        {/* Top Logo Badge Matching Brand Header */}
        <div className="pt-8 pb-3 px-8 text-center flex flex-col items-center">
          <Logo showTagline={true} />
        </div>

        {/* Card Content */}
        <div className="px-8 pb-8 pt-2">
          {/* Title & Amber Accent Line */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#10201F] tracking-tight">
              Login to your account
            </h1>
            <div className="w-10 h-1 bg-[#A9501A] mt-1.5 rounded-full" />
          </div>

          {/* Form */}
          <LoginForm />

          {/* Switch to Register */}
          <div className="mt-5 pt-4 border-t border-[#E5E0D0] text-center text-xs text-[#10201F]/70">
            <span>Don&apos;t have a business account yet? </span>
            <Link to="/register" className="font-semibold text-[#0B5C63] hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Ribbon Banner (Matching Reference) */}
      <div className="relative z-10 mt-6 w-full max-w-md bg-[#0B5C63] text-white/95 text-xs py-2.5 px-4 rounded-md shadow-md flex items-center justify-center gap-2 border-l-4 border-[#A9501A] font-medium tracking-wide">
        <span>2026 © TallyBakery Operations & Reconciliation Platform</span>
      </div>
    </div>
  );
}
