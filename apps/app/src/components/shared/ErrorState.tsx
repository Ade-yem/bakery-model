/**
 * @file Standardized ErrorState component for Platform Admin and Client Admin.
 * Handles network, server, request-failed, unauthorized, and session-expired states
 * with safe user messaging, retry triggers, and zero stack trace exposure.
 */

import React from 'react';
import { WifiOff, ServerCrash, AlertCircle, ShieldAlert, Clock, RefreshCw, LogIn } from 'lucide-react';
import { Button } from './Button';

export type ErrorStateVariant =
  | 'network'
  | 'server'
  | 'request-failed'
  | 'unauthorized'
  | 'session-expired'
  | 'custom';

export interface ErrorStateAction {
  label: string;
  onClick?: () => void;
  to?: string;
}

export interface ErrorStateProps {
  /** Error scenario variant. Defaults to 'request-failed'. */
  variant?: ErrorStateVariant;
  /** Optional override for heading title. */
  title?: string;
  /** Optional override for description message. */
  description?: string;
  /** Optional retry callback. */
  onRetry?: () => void;
  /** Custom label for retry button. Defaults to 'Retry'. */
  retryLabel?: string;
  /** Destination for session-expired sign-in redirect. Defaults to '/login'. */
  loginPath?: string;
  /** Optional primary action link or callback. */
  action?: ErrorStateAction;
  /** Raw caught error object; safely ignored or sanitized (never rendered raw). */
  error?: unknown;
  /** Condensed styling for widgets, panels, and table cells. */
  compact?: boolean;
  /** Additional container classes. */
  className?: string;
}

interface ErrorVariantConfig {
  icon: React.ReactNode;
  defaultTitle: string;
  defaultDescription: string;
  badgeStyle: string;
}

/**
 * @description Standardized, secure error state component with user-friendly copy and recovery actions.
 * @param {ErrorStateProps} props - Configuration options.
 * @returns {React.ReactElement} Error state element.
 * @example
 * ```tsx
 * <ErrorState
 *   variant="request-failed"
 *   onRetry={refetch}
 *   retryLabel="Try Loading Again"
 * />
 * ```
 */
export function ErrorState({
  variant = 'request-failed',
  title,
  description,
  onRetry,
  retryLabel = 'Retry',
  loginPath = '/login',
  action,
  error: _ignoredError,
  compact = false,
  className = '',
}: ErrorStateProps): React.ReactElement {
  const iconSize = compact ? 'w-5 h-5' : 'w-7 h-7';

  const configs: Record<ErrorStateVariant, ErrorVariantConfig> = {
    network: {
      icon: <WifiOff className={iconSize} aria-hidden="true" />,
      defaultTitle: 'Network Connection Error',
      defaultDescription: 'Unable to reach Cadence servers. Please verify your connection.',
      badgeStyle: 'bg-[#B3261E]/10 border-[#B3261E]/20 text-[#B3261E]',
    },
    server: {
      icon: <ServerCrash className={iconSize} aria-hidden="true" />,
      defaultTitle: 'Server Encountered an Issue',
      defaultDescription: 'Our backend service encountered a temporary error. Our engineering team has been alerted.',
      badgeStyle: 'bg-[#B3261E]/10 border-[#B3261E]/20 text-[#B3261E]',
    },
    'request-failed': {
      icon: <AlertCircle className={iconSize} aria-hidden="true" />,
      defaultTitle: 'Request Failed',
      defaultDescription: 'Failed to load data from server. Please try again.',
      badgeStyle: 'bg-[#A9501A]/10 border-[#A9501A]/20 text-[#A9501A]',
    },
    unauthorized: {
      icon: <ShieldAlert className={iconSize} aria-hidden="true" />,
      defaultTitle: 'Access Restricted',
      defaultDescription: 'You do not have permission to view or manage this operational section.',
      badgeStyle: 'bg-[#10201F]/10 border-[#10201F]/20 text-[#10201F]',
    },
    'session-expired': {
      icon: <Clock className={iconSize} aria-hidden="true" />,
      defaultTitle: 'Session Expired',
      defaultDescription: 'Your session has timed out. Please sign in again.',
      badgeStyle: 'bg-[#0B5C63]/10 border-[#0B5C63]/20 text-[#0B5C63]',
    },
    custom: {
      icon: <AlertCircle className={iconSize} aria-hidden="true" />,
      defaultTitle: 'An error occurred',
      defaultDescription: 'Please refresh or try again.',
      badgeStyle: 'bg-[#B3261E]/10 border-[#B3261E]/20 text-[#B3261E]',
    },
  };

  const activeConfig = configs[variant];
  const renderedTitle = title || activeConfig.defaultTitle;
  const renderedDescription = description || activeConfig.defaultDescription;

  const containerPadding = compact ? 'py-4 px-3' : 'py-10 sm:py-14 px-6';

  return (
    <div
      role="alert"
      aria-label={renderedTitle}
      className={`w-full flex flex-col items-center justify-center text-center font-sans ${containerPadding} ${className}`}
    >
      {/* Icon Badge */}
      <div
        className={`rounded-2xl border flex items-center justify-center mb-3.5 shadow-2xs ${
          compact ? 'w-9 h-9' : 'w-12 h-12'
        } ${activeConfig.badgeStyle}`}
      >
        {activeConfig.icon}
      </div>

      {/* Heading */}
      <h3
        className={`font-extrabold text-[#10201F] tracking-tight mb-1.5 ${
          compact ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'
        }`}
      >
        {renderedTitle}
      </h3>

      {/* Safe Description (Never outputs raw stack trace or internal error strings) */}
      <p
        className={`text-[#10201F]/70 max-w-sm sm:max-w-md leading-relaxed ${
          compact ? 'text-xs mb-3' : 'text-xs sm:text-sm mb-5'
        }`}
      >
        {renderedDescription}
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {onRetry && (
          <Button
            variant="primary"
            size={compact ? 'sm' : 'md'}
            onClick={onRetry}
            icon={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
            iconPosition="left"
          >
            {retryLabel}
          </Button>
        )}

        {variant === 'session-expired' && (
          <Button
            variant="primary"
            size={compact ? 'sm' : 'md'}
            to={loginPath}
            icon={<LogIn className="w-3.5 h-3.5" aria-hidden="true" />}
            iconPosition="left"
          >
            Sign In Again
          </Button>
        )}

        {action && (
          <Button
            variant="secondary"
            size={compact ? 'sm' : 'md'}
            to={action.to}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
