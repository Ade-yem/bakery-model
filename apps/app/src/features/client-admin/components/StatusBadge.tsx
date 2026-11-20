/**
 * @file Unified status badge component for branches, departments, staff, and shifts.
 */

import React from 'react';

export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps): React.ReactElement {
  const styles = {
    active: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20',
    inactive: 'bg-[#10201F]/10 text-[#10201F]/70 border-[#10201F]/20',
    pending: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
    suspended: 'bg-[#8C1D18]/10 text-[#8C1D18] border-[#8C1D18]/20',
  }[status];

  const display = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wider border font-sans ${styles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {display}
    </span>
  );
}
