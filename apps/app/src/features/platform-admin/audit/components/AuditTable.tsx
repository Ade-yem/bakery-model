/**
 * @file Data table presenting immutable platform audit logs with alternating rows and View More pagination.
 */

import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import type { PlatformAuditRecord } from '../../types';
import { EmptyState } from '../../../../components/shared';

export interface AuditTableProps {
  /** Filtered audit log entries. */
  records: PlatformAuditRecord[];
  /** Handler to open modal with complete audit payload and diffs. */
  onViewDetails: (record: PlatformAuditRecord) => void;
}

function getStatusBadge(status: PlatformAuditRecord['status']) {
  switch (status) {
    case 'success':
      return 'bg-[#2C571D]/10 text-[#2C571D] border-[#2C571D]/20';
    case 'warning':
      return 'bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/20';
    case 'failure':
    default:
      return 'bg-[#C53030]/10 text-[#C53030] border-[#C53030]/20';
  }
}

/**
 * @description Table displaying platform audit events with alternating row colors and read-only inspection.
 * @param {AuditTableProps} props - Component properties.
 * @returns {React.ReactElement} Audit table element.
 */
export function AuditTable({
  records,
  onViewDetails,
}: AuditTableProps): React.ReactElement {
  const [visibleCount, setVisibleCount] = useState<number>(10);

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#D9D3C0] shadow-xs">
        <EmptyState
          variant="no-activity"
          title="No audit records found"
          description="No activity matches your current search or filter parameters."
        />
      </div>
    );
  }

  const displayedRecords = records.slice(0, visibleCount);
  const hasMore = records.length > visibleCount;

  return (
    <div className="space-y-4 font-sans">
      <div className="overflow-x-auto rounded-xl border border-[#D9D3C0] shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#10201F] text-[#F6F3EA] text-xs font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Activity ID</th>
              <th className="py-3.5 px-4">Administrator</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Module</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Date &amp; Time</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C0]/60">
            {displayedRecords.map((log) => (
              <tr
                key={log.id}
                className="odd:bg-[#EFEBDB] even:bg-[#F6F3EA] hover:bg-[#FDFCF7] transition-colors"
              >
                {/* ID */}
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#0B5C63] whitespace-nowrap">
                  {log.id}
                </td>

                {/* Administrator */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="font-bold text-[#10201F]">{log.adminName}</div>
                  <div className="text-[11px] font-mono text-[#10201F]/60">{log.adminEmail}</div>
                </td>

                {/* Action */}
                <td className="py-3.5 px-4 font-semibold text-[#10201F] whitespace-nowrap">
                  {log.action}
                </td>

                {/* Module */}
                <td className="py-3.5 px-4 text-xs font-medium text-[#10201F]/80 whitespace-nowrap">
                  {log.module}
                </td>

                {/* Description */}
                <td className="py-3.5 px-4 text-xs text-[#10201F]/80 max-w-sm truncate">
                  {log.description}
                </td>

                {/* Date & Time */}
                <td className="py-3.5 px-4 text-xs text-[#10201F]/70 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getStatusBadge(
                      log.status
                    )}`}
                  >
                    {log.status}
                  </span>
                </td>

                {/* Actions: Strictly Read-Only */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onViewDetails(log)}
                    aria-label={`View Details for ${log.id}`}
                    className="p-1.5 rounded-md text-[#10201F]/70 hover:text-[#0B5C63] hover:bg-white transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="sr-only">View Details</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination View More */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-5 py-2 text-xs font-bold rounded-lg border border-[#D9D3C0] bg-white text-[#10201F] hover:bg-[#F6F3EA] shadow-xs transition-colors"
          >
            View More ({records.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
