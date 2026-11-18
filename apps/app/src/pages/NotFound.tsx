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
    ? 'w-full py-12 px-4 flex flex-col items-center justify-center font-sans text-oven-black text-center'
    : 'min-h-screen w-full flex flex-col items-center justify-center p-6 bg-flour text-oven-black font-sans text-center';

  return (
    <div className={containerClasses} role="main" aria-labelledby="not-found-heading">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-rule shadow-sm p-8 sm:p-12 flex flex-col items-center animate-fade-in">
        {/* Subtle decorative brand icon badge */}
        <div className="w-16 h-16 rounded-2xl bg-verdigris/10 border border-verdigris/20 text-verdigris flex items-center justify-center mb-6 shadow-xs">
          <Compass className="w-8 h-8" aria-hidden="true" />
        </div>

        {/* Prominent 404 Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider bg-copper/10 text-copper border border-copper/20 mb-4">
          Error 404
        </div>

        {/* Heading */}
        <h1
          id="not-found-heading"
          className="text-3xl sm:text-4xl font-extrabold text-oven-black tracking-tight mb-3"
        >
          Page not found
        </h1>

        {/* Description */}
        <p className="text-base text-oven-black/75 max-w-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center">
          <Link
            to={homePath}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-verdigris text-flour hover:bg-verdigris-lift transition-colors cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>{homeLabel}</span>
          </Link>

          <button
            type="button"
            onClick={handleGoBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-ledger text-oven-black hover:bg-ledger/80 border border-rule transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
