/**
 * @file Reports and History section for business auditing, shift reconciliation, and data export.
 */

import React, { useState, useMemo } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';
import { PermissionGate } from '../components/PermissionGate';
import { AdminPageHeader } from '../../platform-admin/AdminPageHeader';

export function ReportsHistoryPage(): React.ReactElement {
  const { activity, currentBusiness, actor } = useTenant();

  const canExport = hasClientPermission(actor, CLIENT_PERMISSIONS.REPORTS_EXPORT);
  const canView = hasClientPermission(actor, CLIENT_PERMISSIONS.REPORTS_VIEW);

  const [activeTab, setActiveTab] = useState<'activity' | 'reconciliation' | 'staff'>('activity');
  const [search, setSearch] = useState('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  if (!canView) {
    return <PermissionGate permission={CLIENT_PERMISSIONS.REPORTS_VIEW} />;
  }

  const filteredLogs = useMemo(() => {
    return activity.filter((a) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(q);
        const matchesDesc = a.description.toLowerCase().includes(q);
        const matchesActor = a.actorName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesActor) return false;
      }
      return true;
    });
  }, [activity, search]);

  const handleExport = (format: 'CSV' | 'JSON') => {
    setExportNotice(`Exporting ${filteredLogs.length} business records as ${format}...`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Standardized Platform Admin Page Header */}
      <AdminPageHeader
        title="Reports & Activity History"
        description="Immutable operational logs, staff transaction histories, and business reports."
        action={
          canExport ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExport('CSV')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D9D3C0] bg-white hover:bg-[#F6F3EA] text-xs font-semibold text-[#10201F] shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-verdigris" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('JSON')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-verdigris hover:bg-verdigris-lift text-flour text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          ) : undefined
        }
      />

      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. Segmented Navigation Tabs */}
      <div className="inline-flex p-1 rounded-xl bg-[#F6F3EA] border border-[#D9D3C0]">
        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-[#0B5C63] text-white shadow-2xs'
              : 'text-[#10201F]/70 hover:text-[#10201F]'
          }`}
        >
          Business Activity Log
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reconciliation')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'reconciliation'
              ? 'bg-[#0B5C63] text-white shadow-2xs'
              : 'text-[#10201F]/70 hover:text-[#10201F]'
          }`}
        >
          Shift Reconciliation Reports
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-[#0B5C63] text-white shadow-2xs'
              : 'text-[#10201F]/70 hover:text-[#10201F]'
          }`}
        >
          Staff Shift Audits
        </button>
      </div>

      {/* 3. Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search audit events by title, description, or actor..."
      />

      {/* 4. Audit Log Table matching Platform Admin BusinessTable */}
      <div className="bg-white border border-[#D9D3C0] rounded-2xl shadow-xs overflow-hidden">
        {/* Mobile Stacked View */}
        <div className="md:hidden divide-y divide-[#E5E0D0]">
          {filteredLogs.map((log) => (
            <div key={`mobile-${log.id}`} className="p-4 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-[#10201F]">{log.title}</h4>
                  <p className="text-xs text-[#10201F]/70 mt-0.5">{log.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#0B5C63]/10 text-[#0B5C63] shrink-0">
                  {log.departmentName || 'All'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D0] text-xs text-[#10201F]/60">
                <span className="font-semibold text-[#10201F]">{log.actorName}</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-[#10201F]">
            <thead className="border-b border-[#D9D3C0] bg-[#F6F3EA]/60 text-xs font-bold text-[#10201F]/80 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Event & Activity</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-5 text-right">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D0]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F6F3EA]/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-sm text-[#10201F] block">{log.title}</span>
                    <p className="text-xs text-[#10201F]/70 max-w-md">{log.description}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#10201F]">
                    {log.actorName}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#10201F]/80">
                    {log.departmentName || 'Business Wide'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#10201F]/60">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0B5C63]/10 text-[#0B5C63] uppercase">
                      Tenant: {currentBusiness.id}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
