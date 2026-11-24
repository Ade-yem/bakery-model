/**
 * @file Read-only modal presenting detailed audit event payload and configuration diffs.
 */

import React from 'react';
import { X, Shield, ArrowRight, User, Globe, Tag } from 'lucide-react';
import type { PlatformAuditRecord } from '../../types';

export interface AuditDetailsModalProps {
  /** Target audit record, or null when closed. */
  record: PlatformAuditRecord | null;
  /** Modal close callback. */
  onClose: () => void;
}

/**
 * @description Modal dialog inspecting immutable audit metadata, admin identity, and previous/new values.
 * @param {AuditDetailsModalProps} props - Component properties.
 * @returns {React.ReactElement | null} Modal element or null.
 */
export function AuditDetailsModal({
  record,
  onClose,
}: AuditDetailsModalProps): React.ReactElement | null {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10201F]/50 backdrop-blur-xs font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#D9D3C0] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#D9D3C0] pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0B5C63]/10 text-[#0B5C63]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#0B5C63] px-2 py-0.5 rounded bg-[#0B5C63]/10">
                  {record.id}
                </span>
                <span className="text-xs font-semibold text-[#10201F]/60">
                  {new Date(record.timestamp).toLocaleString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#10201F] mt-0.5">{record.action}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-md text-[#10201F]/50 hover:text-[#10201F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[#D9D3C0] bg-[#FDFCF7] flex items-center gap-3">
            <User className="w-5 h-5 text-[#0B5C63] shrink-0" />
            <div>
              <span className="text-[#10201F]/60 block font-medium">Administrator:</span>
              <p className="font-bold text-[#10201F]">{record.adminName}</p>
              <p className="font-mono text-[11px] text-[#10201F]/70">{record.adminEmail}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#D9D3C0] bg-[#FDFCF7] flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#0B5C63] shrink-0" />
            <div>
              <span className="text-[#10201F]/60 block font-medium">Origin IP Address:</span>
              <p className="font-mono font-bold text-[#10201F]">
                {record.ipAddress || 'Not recorded'}
              </p>
              <p className="text-[11px] text-[#10201F]/70">Module: {record.module}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 rounded-xl border border-[#D9D3C0] bg-[#FDFCF7] text-xs space-y-1">
          <span className="text-[#10201F]/60 font-bold uppercase tracking-wider block">
            Activity Description
          </span>
          <p className="text-[#10201F] font-medium leading-relaxed">{record.description}</p>
          {record.relatedEntity && (
            <div className="pt-2 mt-2 border-t border-[#D9D3C0]/60 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#0B5C63]" />
              <span className="text-[#10201F]/60">Target:</span>
              <span className="font-bold text-[#10201F]">
                {record.relatedEntity.name} ({record.relatedEntity.id})
              </span>
            </div>
          )}
        </div>

        {/* Configuration Changes (Diff) */}
        {record.diff && record.diff.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B5C63]">
              Configuration Changes (Diff)
            </h4>
            <div className="rounded-xl border border-[#D9D3C0] overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F6F3EA] text-[#10201F] font-bold border-b border-[#D9D3C0]">
                    <th className="py-2.5 px-3">Field</th>
                    <th className="py-2.5 px-3">Previous Value</th>
                    <th className="py-2.5 px-3">New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D3C0]/60">
                  {record.diff.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FDFCF7]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#10201F]">
                        {item.field}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#A9501A] bg-[#A9501A]/5">
                        {item.previousValue}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#2C571D] bg-[#2C571D]/5 font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-[#2C571D]" />
                          {item.newValue}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-[#D9D3C0]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#0B5C63] text-white text-xs font-bold shadow-xs hover:bg-[#0B5C63]/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
