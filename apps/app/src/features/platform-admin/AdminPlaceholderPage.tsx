/**
 * @file Modular placeholder screen for upcoming Platform Admin sub-routes during iterative rollout.
 */

import React from 'react';
import { Construction, Sparkles } from 'lucide-react';
import { AdminPageHeader } from './AdminPageHeader';

export interface AdminPlaceholderPageProps {
  /** Screen title. */
  title: string;
  /** Screen description / purpose. */
  description?: string;
}

/**
 * @description Standardized placeholder page displaying active development status and breadcrumbs.
 * @param {AdminPlaceholderPageProps} props - Page properties.
 * @returns {React.ReactElement} Admin placeholder element.
 * @example
 * ```tsx
 * <AdminPlaceholderPage
 *   title="Subscriptions"
 *   description="Manage active bakery billing tiers."
 * />
 * ```
 */
export function AdminPlaceholderPage({
  title,
  description,
}: AdminPlaceholderPageProps): React.ReactElement {
  return (
    <div>
      <AdminPageHeader
        title={title}
        description={description}
      />

      <div className="rounded-xl border border-[#D9D3C0] bg-white p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto mt-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B5C63]/10 text-[#0B5C63] mb-4">
          <Construction className="h-7 w-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F6F3EA] text-[#A9501A] border border-[#D9D3C0] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Module In Development</span>
        </div>
        <h2 className="text-lg font-bold text-[#10201F] tracking-tight">
          {title} Interface Planned
        </h2>
        <p className="mt-2 text-sm text-[#10201F]/70 max-w-md mx-auto leading-relaxed">
          The {title.toLowerCase()} module is part of the Platform Admin roadmap. Tenant data models and operational workflows are currently staged for implementation.
        </p>
      </div>
    </div>
  );
}
