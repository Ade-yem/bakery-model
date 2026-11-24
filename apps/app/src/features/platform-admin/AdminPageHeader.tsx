/**
 * @file Reusable page header component for Platform Admin views.
 */

import React from 'react';

export interface AdminPageHeaderProps {
  /** Primary page title. */
  title: string;
  /** Explanatory subtitle or operational scope. */
  description?: string;
  /** Optional breadcrumbs path items (retained for backward compatibility). */
  breadcrumbs?: Array<{ label: string; to?: string }>;
  /** Optional right-hand action controls slot. */
  action?: React.ReactNode;
  /** Optional custom class name. */
  className?: string;
}

/**
 * @description Standardized title hierarchy and primary actions for admin views.
 * @param {AdminPageHeaderProps} props - Header properties.
 * @returns {React.ReactElement} Admin page header element.
 * @example
 * ```tsx
 * <AdminPageHeader
 *   title="Businesses"
 *   description="Directory of all registered bakery tenants."
 *   action={<Button size="sm">Add Business</Button>}
 * />
 * ```
 */
export function AdminPageHeader({
  title,
  description,
  action,
  className = '',
}: AdminPageHeaderProps): React.ReactElement {
  return (
    <header className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-oven-black font-sans">{title}</h1>
        {description && <p className="text-sm text-oven-black/75 mt-1">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">{action}</div>}
    </header>
  );
}
