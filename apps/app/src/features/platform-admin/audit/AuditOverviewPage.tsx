/**
 * @file Main page for inspecting platform audit logs, security events, and configuration diffs.
 */

import React, { useState, useMemo } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AuditOverviewCards } from './components/AuditOverviewCards';
import { AuditFiltersBar } from './components/AuditFiltersBar';
import { AuditMobileFilters } from './components/AuditMobileFilters';
import { AuditTable } from './components/AuditTable';
import { AuditMobileCard } from './components/AuditMobileCard';
import { AuditDetailsModal } from './components/AuditDetailsModal';
import { MOCK_AUDIT_RECORDS } from '../mock-audit';
import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '../permissions';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { PlatformAuditRecord, AuditFilterState } from '../types';

export interface AuditOverviewPageProps {
  /** Optional authenticated actor. */
  actor?: AuthenticatedActor;
  /** Optional dataset override. */
  records?: PlatformAuditRecord[];
}

/**
 * @description Centralized immutable audit log directory for platform administrators.
 * @param {AuditOverviewPageProps} props - Component properties.
 * @returns {React.ReactElement} Audit overview page element.
 */
export function AuditOverviewPage({
  actor,
  records: initialRecords = MOCK_AUDIT_RECORDS,
}: AuditOverviewPageProps): React.ReactElement {
  const hasAccess = hasPlatformPermission(actor, PLATFORM_PERMISSIONS.AUDIT_VIEW);

  const [recordsList] = useState<PlatformAuditRecord[]>(initialRecords);
  const [filters, setFilters] = useState<AuditFilterState>({
    search: '',
    module: 'all',
    actionType: 'all',
    administrator: 'all',
    dateRange: 'all',
    status: 'all',
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PlatformAuditRecord | null>(null);

  const modules = useMemo(
    () => Array.from(new Set(recordsList.map((r) => r.module))),
    [recordsList]
  );

  const filteredRecords = useMemo(() => {
    return recordsList.filter((log) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesAdmin =
          log.adminName.toLowerCase().includes(q) ||
          log.adminEmail.toLowerCase().includes(q);
        const matchesDesc = log.description.toLowerCase().includes(q);
        const matchesId = log.id.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        if (!matchesAdmin && !matchesDesc && !matchesId && !matchesAction) return false;
      }
      if (filters.module !== 'all' && log.module !== filters.module) return false;
      if (filters.actionType !== 'all' && log.actionType !== filters.actionType)
        return false;
      if (filters.status !== 'all' && log.status !== filters.status) return false;
      return true;
    });
  }, [recordsList, filters]);

  if (!hasAccess) {
    return (
      <div className="p-8 text-center rounded-xl border border-[#D9D3C0] bg-white font-sans max-w-xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#A9501A]/10 text-[#A9501A] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#10201F]">Access Restricted</h2>
        <p className="text-xs text-[#10201F]/70">
          You require the <code className="font-mono bg-[#F6F3EA] px-1.5 py-0.5 rounded text-[#0B5C63]">platform.audit.view</code> permission to inspect immutable system activity trails.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#10201F] tracking-tight">
          Audit and Activity
        </h1>
        <p className="text-xs sm:text-sm text-[#10201F]/70 mt-1">
          Centralized chronological record of administrative actions and platform-level operations.
        </p>
      </div>

      {/* KPI Overview Cards */}
      <AuditOverviewCards records={recordsList} />

      {/* Search and Filter Toolbar */}
      <AuditFiltersBar
        filters={filters}
        modules={modules}
        onChange={setFilters}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
      />

      <AuditMobileFilters
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        modules={modules}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            search: '',
            module: 'all',
            actionType: 'all',
            administrator: 'all',
            dateRange: 'all',
            status: 'all',
          })
        }
      />

      {/* Table & Mobile Views */}
      {filteredRecords.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-[#D9D3C0] bg-white">
          <p className="text-sm font-semibold text-[#10201F]/70">
            No audit records found matching your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <AuditTable
              records={filteredRecords}
              onViewDetails={setSelectedRecord}
            />
          </div>

          <div className="lg:hidden space-y-3">
            {filteredRecords.map((log) => (
              <AuditMobileCard
                key={log.id}
                record={log}
                onViewDetails={setSelectedRecord}
              />
            ))}
          </div>
        </>
      )}

      {/* Activity Details Modal */}
      <AuditDetailsModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
