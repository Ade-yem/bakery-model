/**
 * @file Standardized EmptyState component for Platform Admin and Client Admin.
 * Handles no-data, search, filter, activity, and date-range empty scenarios with contextual guidance.
 */

import React from 'react';
import { Inbox, SearchX, FilterX, Clock, CalendarX } from 'lucide-react';
import { Button } from './Button';

export type EmptyStateVariant =
  | 'no-data'
  | 'no-search-results'
  | 'no-filter-match'
  | 'no-activity'
  | 'no-period-data'
  | 'custom';

export interface EmptyStateAction {
  /** Text label displayed on the action button. */
  label: string;
  /** Optional click handler for local actions (e.g. clear filters). */
  onClick?: () => void;
  /** Optional navigation destination path. */
  to?: string;
  /** Button visual style variant. */
  variant?: 'primary' | 'secondary' | 'copper' | 'ghost' | 'dark';
  /** Optional icon rendered with the button label. */
  icon?: React.ReactNode;
}

export interface EmptyStateProps {
  /** Preconfigured scenario variant. Defaults to 'no-data'. */
  variant?: EmptyStateVariant;
  /** Optional custom illustration or icon element. Overrides variant default. */
  icon?: React.ReactNode;
  /** Primary heading for the empty state. */
  title?: string;
  /** Descriptive guidance or next-step prompt. */
  description?: string;
  /** Active search query string to interpolate in no-search-results variant. */
  searchQuery?: string;
  /** Primary action button configuration. */
  action?: EmptyStateAction;
  /** Optional secondary action button configuration. */
  secondaryAction?: EmptyStateAction;
  /** Whether the parent query is actively loading (suppresses empty state display). */
  isLoading?: boolean;
  /** Whether to render in a condensed format for cards, drawers, and widgets. */
  compact?: boolean;
  /** Additional container classes. */
  className?: string;
}

interface VariantConfig {
  icon: React.ReactNode;
  defaultTitle: string;
  defaultDescription: string;
}

/**
 * @description Renders a standardized, accessible empty state placeholder with contextual icon and actions.
 * @param {EmptyStateProps} props - Configuration options.
 * @returns {React.ReactElement | null} Empty state element, or null if loading.
 * @example
 * ```tsx
 * <EmptyState
 *   variant="no-search-results"
 *   searchQuery={query}
 *   action={{ label: "Clear Search", onClick: resetSearch }}
 * />
 * ```
 */
export function EmptyState({
  variant = 'no-data',
  icon,
  title,
  description,
  searchQuery,
  action,
  secondaryAction,
  isLoading = false,
  compact = false,
  className = '',
}: EmptyStateProps): React.ReactElement | null {
  // Never display empty state while data is actively loading
  if (isLoading) {
    return null;
  }

  const variantConfigs: Record<EmptyStateVariant, VariantConfig> = {
    'no-data': {
      icon: <Inbox className={compact ? 'w-6 h-6' : 'w-8 h-8'} aria-hidden="true" />,
      defaultTitle: 'No records available',
      defaultDescription: 'There are no items recorded in this view yet.',
    },
    'no-search-results': {
      icon: <SearchX className={compact ? 'w-6 h-6' : 'w-8 h-8'} aria-hidden="true" />,
      defaultTitle: 'No results found',
      defaultDescription: searchQuery
        ? `No records matching "${searchQuery}". Check your spelling or try searching with different keywords.`
        : 'Check your spelling or try searching with different keywords.',
    },
    'no-filter-match': {
      icon: <FilterX className={compact ? 'w-6 h-6' : 'w-8 h-8'} aria-hidden="true" />,
      defaultTitle: 'No matching filters',
      defaultDescription: 'No records matched your selected criteria. Try adjusting or clearing filters.',
    },
    'no-activity': {
      icon: <Clock className={compact ? 'w-6 h-6' : 'w-8 h-8'} aria-hidden="true" />,
      defaultTitle: 'No activity recorded',
      defaultDescription: 'Operational events and actions will appear here as they occur.',
    },
    'no-period-data': {
      icon: <CalendarX className={compact ? 'w-6 h-6' : 'w-8 h-8'} aria-hidden="true" />,
      defaultTitle: 'No data for selected period',
      defaultDescription: 'No transactions or metrics were logged within this date range.',
    },
    custom: {
      icon: <Inbox className={compact ? 'w-6 h-6' : 'w-8 h-8'} aria-hidden="true" />,
      defaultTitle: 'No records',
      defaultDescription: '',
    },
  };

  const activeConfig = variantConfigs[variant];
  const renderedIcon = icon || activeConfig.icon;
  const renderedTitle = title || activeConfig.defaultTitle;
  const renderedDescription = description || activeConfig.defaultDescription;

  const containerPadding = compact ? 'py-6 px-4' : 'py-12 sm:py-16 px-6';

  return (
    <div
      role="status"
      aria-label={renderedTitle}
      className={`w-full flex flex-col items-center justify-center text-center font-sans ${containerPadding} ${className}`}
    >
      {/* Visual Badge Icon */}
      <div
        className={`rounded-2xl bg-[#EFEBDB]/70 border border-[#D9D3C0] text-[#0B5C63] flex items-center justify-center mb-4 shadow-2xs ${
          compact ? 'w-10 h-10' : 'w-14 h-14'
        }`}
      >
        {renderedIcon}
      </div>

      {/* Heading */}
      <h3
        className={`font-extrabold text-[#10201F] tracking-tight mb-2 ${
          compact ? 'text-sm' : 'text-base sm:text-lg'
        }`}
      >
        {renderedTitle}
      </h3>

      {/* Description */}
      {renderedDescription && (
        <p
          className={`text-[#10201F]/70 max-w-sm sm:max-w-md leading-relaxed ${
            compact ? 'text-xs mb-4' : 'text-xs sm:text-sm mb-6'
          }`}
        >
          {renderedDescription}
        </p>
      )}

      {/* Action Buttons */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              size={compact ? 'sm' : 'md'}
              to={action.to}
              onClick={action.onClick}
              icon={action.icon}
              iconPosition="left"
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="secondary"
              size={compact ? 'sm' : 'md'}
              to={secondaryAction.to}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
