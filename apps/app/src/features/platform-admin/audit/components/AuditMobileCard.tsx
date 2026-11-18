/**
 * @file Mobile responsive stacked card representing an immutable platform audit record.
 */

import React, { useState } from 'react';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';
import type { PlatformAuditRecord } from '../../types';

export interface AuditMobileCardProps {
  /** Audit record entity. */
  record: PlatformAuditRecord;
  /** Select callback to view full diffs and payload in modal. */
  onViewDetails: (record: PlatformAuditRecord) => void;
}

/**
 * @description Stacked touch card representation of an audit event for small screen viewports.
 * @param {AuditMobileCardProps} props - Component properties.
 * @returns {React.ReactElement} Mobile audit card element.
 */
export function AuditMobileCard({
  record,
  onViewDetails,
}: AuditMobileCardProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = (status: PlatformAuditRecord['status']) => {
    switch (status) {
      case 'success':
        return 'bg-[#2C571D]/10 text-[#2C571D] border-[#2C571D]/20';
      case 'warning':
        return 'bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/20';
      case 'failure':
      default:
        return 'bg-[#C53030]/10 text-[#C53030] border-[#C53030]/20';
    }
  };

  return (
    <div className="audit-mobile-card p-4 rounded-xl border border-[#D9D3C0] bg-white shadow-xs space-y-3 font-sans">
      {/* Header: Action & Status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-[11px] font-bold text-[#0B5C63]">
            {record.id}
          </span>
          <h4 className="text-sm font-bold text-[#10201F] mt-0.5">{record.action}</h4>
          <p className="text-xs text-[#10201F]/60">Module: {record.module}</p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
            record.status
          )}`}
        >
          {record.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-[#10201F]/80 line-clamp-2">{record.description}</p>

      {/* Expandable secondary details */}
      {isExpanded && (
        <div className="p-3 rounded-lg bg-[#FDFCF7] border border-[#D9D3C0]/60 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-[#10201F]/60">Administrator:</span>
            <span className="font-semibold text-[#10201F]">{record.adminName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#10201F]/60">Email:</span>
            <span className="font-mono text-[11px] text-[#10201F]/80">{record.adminEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#10201F]/60">IP Address:</span>
            <span className="font-mono text-[11px] text-[#10201F]">
              {record.ipAddress || 'Not recorded'}
            </span>
          </div>
          {record.relatedEntity && (
            <div className="flex justify-between">
              <span className="text-[#10201F]/60">Target Entity:</span>
              <span className="font-semibold text-[#0B5C63]">
                {record.relatedEntity.name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer: Date & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[#D9D3C0] text-xs">
        <span className="text-[#10201F]/60">
          {new Date(record.timestamp).toLocaleString()}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 text-[#10201F]/60 hover:text-[#10201F] rounded"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onViewDetails(record)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#D9D3C0] text-xs font-semibold text-[#0B5C63] hover:bg-[#0B5C63]/10"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
