/**
 * @file Custom 404 Not Found page for unmapped routes, supporting both full-page and nested admin layouts.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Compass } from 'lucide-react';

export interface NotFoundProps {
  /** Optional destination path for the primary home button (defaults to root '/'). */
  homePath?: string;
  /** Optional label for the primary home button. */
  homeLabel?: string;
  /** Whether the component is nested inside an existing layout frame (e.g. Platform Admin). */
  isNested?: boolean;
}

/**
 * @description Renders a branded 404 Not Found view following the TallyBakery design system.
 * @param {NotFoundProps} props - Page configuration options.
 * @returns {React.ReactElement} Custom 404 Not Found element.
 * @example
 * ```tsx
 * <NotFound homePath="/admin/dashboard" homeLabel="Back to Admin Dashboard" isNested />
 * ```
 */
export function NotFound({
  homePath = '/',
  homeLabel = 'Back to Home',
  isNested = false,
}: NotFoundProps): React.ReactElement {
  const navigate = useNavigate();

  const handleGoBack = (): void => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(homePath);
    }
  };

  const containerClasses = isNested
    ? 'w-full py-12 px-4 flex flex-col items-center justify-center font-sans text-oven-black text-center bg-white'
    : 'min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-white text-oven-black font-sans text-center';

  return (
    <div className={containerClasses} role="main" aria-labelledby="not-found-heading">
      <div className="w-full max-w-2xl flex flex-col items-center text-center animate-fade-in">
        {/* 404 Illustration sized to fit viewport without scrolling */}
        <div className="w-full max-w-md mb-4 flex justify-center">
          <img
            src="/images/error_page.jpg"
            alt="404 Page Not Found Illustration"
            className="w-full max-h-56 sm:max-h-72 object-contain mix-blend-multiply select-none"
            loading="eager"
          />
        </div>


        {/* Subtle decorative brand badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-verdigris/10 text-verdigris border border-verdigris/20 mb-2.5">
          <Compass className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Error 404</span>
        </div>

        {/* Heading */}
        <h1
          id="not-found-heading"
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-oven-black tracking-tight mb-2"
        >
          Page not found
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-oven-black/75 max-w-md mb-6 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            to={homePath}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-verdigris text-flour hover:bg-verdigris-lift transition-colors cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>{homeLabel}</span>
          </Link>

          <button
            type="button"
            onClick={handleGoBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-flour text-oven-black hover:bg-flour/80 border border-rule transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
