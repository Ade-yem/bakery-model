/**
 * @file Unified status badge component matching Platform Admin status pill design.
 */

import React from 'react';
import { CheckCircle2, AlertOctagon, Clock } from 'lucide-react';

export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps): React.ReactElement {
  const display = label || status.charAt(0).toUpperCase() + status.slice(1);

  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF3E8] text-[#3F7A2A] border border-[#CBE2C4]">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7A2A]" />
        <span>{display}</span>
      </span>
    );
  }

  if (status === 'suspended' || status === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FDECEC] text-[#DF1B22] border border-[#F8C8C8]">
        <AlertOctagon className="w-3.5 h-3.5 text-[#DF1B22]" />
        <span>{display}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF6E7] text-[#D97706] border border-[#FDE68A]">
      <Clock className="w-3.5 h-3.5 text-[#D97706]" />
      <span>{display}</span>
    </span>
  );
}
