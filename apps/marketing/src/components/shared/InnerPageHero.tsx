/**
 * @file Reusable cinematic full-width photographic hero for inner pages.
 * Inspired by the reference design with dark gradient overlays, left-aligned bold typography,
 * breadcrumbs, concise descriptions, and conversion-focused CTA buttons.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export interface InnerPageHeroProps {
  /** Page category or parent label for breadcrumbs (defaults to "Pages") */
  category?: string;
  /** Primary page title / breadcrumb text */
  breadcrumbCurrent?: string;
  /** Large bold left-aligned headline */
  heading: string;
  /** Supporting short description */
  description: string;
  /** Full-width high-resolution photographic background URL */
  backgroundImage: string;
  /** Primary Call-to-Action button config */
  primaryCta?: {
    text: string;
    href: string;
  };
  /** Secondary Call-to-Action button config */
  secondaryCta?: {
    text: string;
    href: string;
  };
  /** Additional custom classNames */
  className?: string;
}

/**
 * @description Master cinematic inner page hero component.
 * @param {InnerPageHeroProps} props Component configuration.
 * @returns {React.ReactElement} Scalable, responsive photographic hero.
 */
export function InnerPageHero({
  heading,
  description,
  backgroundImage,
  primaryCta,
  secondaryCta,
  className = '',
}: InnerPageHeroProps): React.ReactElement {
  return (
    <section
      className={`relative w-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center bg-[#0C1716] overflow-hidden ${className}`}
    >
      {/* 1. Full-width Photographic Background Image */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <img
          src={backgroundImage}
          alt={heading}
          className="w-full h-full object-cover object-center scale-105 animate-fade-in"
          loading="eager"
        />
        {/* 2. Cinematic Dark Gradient Overlays (Inspired by Reference) */}
        {/* Heavy left-to-right vignette so text remains crisp and readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C1716]/95 via-[#0C1716]/80 to-[#0C1716]/40" />
        {/* Top-to-bottom shading for seamless navbar and bottom border blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C1716]/75 via-transparent to-[#0C1716]/90" />
      </div>

      {/* 3. Hero Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl lg:max-w-3xl space-y-6">
          {/* Breadcrumb Navigation */}

          {/* Large Bold Left-Aligned Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-[#F6F3EA] tracking-tight leading-[1.12]">
            {heading}
          </h1>

          {/* Short Supporting Description */}
          <p className="text-base sm:text-lg lg:text-xl text-[#E9E4D2]/85 leading-relaxed font-normal max-w-2xl">
            {description}
          </p>

          {/* Call to Action Buttons */}
          {(primaryCta || secondaryCta) && (
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {primaryCta && (
                <Link
                  to={primaryCta.href}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#10201F] text-sm font-semibold hover:bg-[#F6F3EA] hover:shadow-lg transition-all shadow-md group"
                >
                  <span>{primaryCta.text}</span>
                  <ArrowRight className="w-4 h-4 text-[#10201F] transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
              {secondaryCta && (
                <Link
                  to={secondaryCta.href}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#10201F]/60 hover:bg-[#10201F]/80 text-[#F6F3EA] border border-white/20 text-sm font-semibold backdrop-blur-md transition-all shadow-sm"
                >
                  <span>{secondaryCta.text}</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
