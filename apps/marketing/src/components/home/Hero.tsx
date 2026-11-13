/**
 * @file Hero section for the public homepage (Section 2).
 * Integrates 3D Operational SaaS dashboard background video with centered Finview layout
 * and typewriter animated keyword highlight.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Ambient3DBackground } from '../motion/Ambient3DBackground';

// Official brand palette & operational highlight colors for cycling typewriter
const TYPING_COLORS = [
  '#A9501A', // Copper (Official Brand Accent)
  '#0B5C63', // Verdigris (Official Primary Brand)
  '#fcfdfd', // Verdigris Lift (Official Accent)
  '#3F7A2A', // Rye (Official Reconciled / Balanced Green)
  '#8A5A00', // Egg-wash (Official Operational Gold)
] as const;

/**
 * @description Hero component displaying centered Finview-style narrative with multi-color typewriter
 * animated "Perfect Control" text and 3D Operational SaaS dashboard background video.
 * @returns {React.ReactElement} Hero section element with video background and typing animation.
 */
export function HomeHero(): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Typing animation state for "Perfect Control"
  const targetText = 'Perfect Control';
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayedText.length < targetText.length) {
      // Typing next character
      timeout = setTimeout(() => {
        setDisplayedText(targetText.slice(0, displayedText.length + 1));
      }, 120);
    } else if (!isDeleting && displayedText.length === targetText.length) {
      // Pause before backspacing
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2500);
    } else if (isDeleting && displayedText.length > 0) {
      // Deleting character
      timeout = setTimeout(() => {
        setDisplayedText(targetText.slice(0, displayedText.length - 1));
      }, 70);
    } else if (isDeleting && displayedText.length === 0) {
      // Pause before re-typing with next color
      timeout = setTimeout(() => {
        setColorIndex((prev: number) => (prev + 1) % TYPING_COLORS.length);
        setIsDeleting(false);
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting]);

  const currentColor = TYPING_COLORS[colorIndex];

  return (
    <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-60 overflow-hidden bg-[#F6F3EA]">
      {/* Background Video Layer */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center opacity-45 mix-blend-multiply transition-opacity duration-700"
          src="/videos/hero-background.mp4"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        {/* Subtle Ambient 3D floating depth layer */}
        <Ambient3DBackground />
      </div>

      {/* Decorative floating dots matching Finview */}
      <div className="absolute top-24 left-8 text-[#A9501A] select-none pointer-events-none hidden sm:block z-10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="4" r="2" />
          <circle cx="20" cy="12" r="2" />
          <circle cx="12" cy="20" r="2" />
          <circle cx="4" cy="12" r="2" />
        </svg>
      </div>

      {/* Centered Hero Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Finview 4-dot diamond cluster + Eyebrow */}

        {/* Headline with multi-color typewriter animation on "Perfect Control" */}
        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#10201F] tracking-tight leading-[1.15] mb-6">
          Find the{' '}
          <span
            style={{ color: currentColor }}
            className="inline-block min-w-[2ch] transition-colors duration-300"
          >
            {displayedText}
            <span
              style={{ backgroundColor: currentColor }}
              className="inline-block w-[3px] h-[0.9em] align-middle ml-1 animate-pulse"
            />
          </span>{' '}
          for Your Operational Needs
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-[#10201F]/85 leading-relaxed max-w-2xl mx-auto mb-8">
          Welcome to TallyBakery, your all-in-one platform for managing business operations,
          inventory, sales, staff, and finances with better control and accountability.
        </p>

        {/* Finview Two Pill Buttons with Angled Arrow ↗ */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-7 py-3.5 rounded-full bg-[#0B5C63] text-[#F6F3EA] text-sm font-semibold hover:bg-[#0F7480] transition-colors shadow-xs"
          >
            <span>Get Started</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 px-7 py-3.5 rounded-full bg-[#F6F3EA]/80 backdrop-blur-xs border border-[#10201F]/30 text-[#10201F] text-sm font-semibold hover:bg-[#EFEBDB] transition-colors"
          >
            <span>About us</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
