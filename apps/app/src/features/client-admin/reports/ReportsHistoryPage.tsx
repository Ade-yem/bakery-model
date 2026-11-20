/**
 * @file Reports and History section for business auditing, shift reconciliation, and data export.
 */

import React, { useState, useMemo } from 'react';
import { FileBarChart, Download, Search, Filter, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import { Button } from '../../../components/shared/Button';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';
import { PermissionGate } from '../components/PermissionGate';

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
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#D9D3C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-3xs font-extrabold uppercase tracking-wider text-[#0B5C63]">
            Audit & Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10201F] tracking-tight">
            Reports & Activity History
          </h1>
          <p className="text-xs sm:text-sm text-[#10201F]/70 mt-0.5">
            Immutable operational logs, staff transaction histories, and business reports.
          </p>
        </div>

        {canExport && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={14} />}
              iconPosition="left"
              onClick={() => handleExport('CSV')}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Download size={14} />}
              iconPosition="left"
              onClick={() => handleExport('JSON')}
            >
              Export JSON
            </Button>
          </div>
        )}
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9D3C0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-[#0B5C63] text-white shadow-2xs'
              : 'text-[#10201F]/70 hover:bg-[#F6F3EA]'
          }`}
        >
          Business Activity Log
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reconciliation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'reconciliation'
              ? 'bg-[#0B5C63] text-white shadow-2xs'
              : 'text-[#10201F]/70 hover:bg-[#F6F3EA]'
          }`}
        >
          Shift Reconciliation Reports
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-[#0B5C63] text-white shadow-2xs'
              : 'text-[#10201F]/70 hover:bg-[#F6F3EA]'
          }`}
        >
          Staff Shift Audits
        </button>
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search audit events by title, description, or actor..."
      />

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-[#D9D3C0] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-[#10201F]">
          <thead className="bg-[#F6F3EA] border-b border-[#D9D3C0] text-3xs font-extrabold uppercase tracking-wider text-[#10201F]/70">
            <tr>
              <th className="py-3.5 px-5">Event & Activity</th>
              <th className="py-3.5 px-4">Actor</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-5 text-right">Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C0]/40">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F6F3EA]/40 transition-colors">
                <td className="py-3.5 px-5">
                  <span className="font-bold text-sm text-[#10201F] block">{log.title}</span>
                  <p className="text-2xs text-[#10201F]/70 max-w-md">{log.description}</p>
                </td>
                <td className="py-3.5 px-4 font-bold text-[#10201F]">
                  {log.actorName}
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#10201F]/80">
                  {log.departmentName || 'Business Wide'}
                </td>
                <td className="py-3.5 px-4 text-2xs text-[#10201F]/60">
                  {log.timestamp}
                </td>
                <td className="py-3.5 px-5 text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full text-3xs font-extrabold bg-[#0B5C63]/10 text-[#0B5C63] uppercase">
                    Tenant: {currentBusiness.id}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
