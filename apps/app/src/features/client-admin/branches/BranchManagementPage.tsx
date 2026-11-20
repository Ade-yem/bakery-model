/**
 * @file Branch Management page for managing bakery locations within subscription limits.
 */

import React, { useState, useMemo } from 'react';
import { Store, Plus, Edit2, Power, MapPin, Mail, Phone } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { ClientBranch } from '../types';
import { Button } from '../../../components/shared/Button';
import { SubscriptionGate } from '../components/SubscriptionGate';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { BranchModal } from './components/BranchModal';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';

export function BranchManagementPage(): React.ReactElement {
  const { branches, subscription, actor, createBranch, updateBranch, toggleBranchStatus } = useTenant();

  const canManage = hasClientPermission(actor, CLIENT_PERMISSIONS.BRANCHES_MANAGE);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<ClientBranch | null>(null);

  // Gated access check for multi-branch support
  if (!subscription.isMultiBranchSupported || subscription.maxBranches <= 1) {
    return (
      <SubscriptionGate
        featureName="Multi-Branch Management"
        requiredTier="Growth or Business"
        description="Your current subscription tier is restricted to a single primary bakery branch. Upgrade to a Growth or Business plan to add multiple branch outlets, manufacturing hubs, and cross-branch logistics."
      />
    );
  }

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesCode = b.code.toLowerCase().includes(q);
        const matchesManager = b.managerName?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesManager) return false;
      }
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      return true;
    });
  }, [branches, search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: ClientBranch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleSaveBranch = (data: Omit<ClientBranch, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => {
    if (editingBranch) {
      updateBranch(editingBranch.id, data);
      return { success: true };
    }
    return createBranch(data);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#D9D3C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xs font-extrabold uppercase tracking-wider text-[#0B5C63]">
              Location Hierarchy
            </span>
            <span className="text-2xs text-[#10201F]/60">
              Usage: {branches.length} of {subscription.maxBranches} branches
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10201F] tracking-tight">
            Branch Management
          </h1>
          <p className="text-xs sm:text-sm text-[#10201F]/70 mt-0.5">
            Manage your retail counters, production facilities, and regional distribution outlets.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            iconPosition="left"
            onClick={handleOpenCreate}
            disabled={branches.length >= subscription.maxBranches}
          >
            Add Branch
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search branches by name, code, or manager..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl border border-[#D9D3C0] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-[#10201F]">
          <thead className="bg-[#F6F3EA] border-b border-[#D9D3C0] text-3xs font-extrabold uppercase tracking-wider text-[#10201F]/70">
            <tr>
              <th className="py-3.5 px-5">Branch Name & Code</th>
              <th className="py-3.5 px-4">Address</th>
              <th className="py-3.5 px-4">Branch Manager</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C0]/40">
            {filteredBranches.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#10201F]/50">
                  No branch locations found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredBranches.map((b) => (
                <tr key={b.id} className="hover:bg-[#F6F3EA]/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center font-bold shrink-0">
                        <Store size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#10201F]">{b.name}</span>
                          {b.isPrimary && (
                            <span className="px-1.5 py-0.2 rounded-full text-3xs font-extrabold bg-[#0B5C63]/10 text-[#0B5C63]">
                              Primary
                            </span>
                          )}
                        </div>
                        <code className="text-2xs font-mono text-[#10201F]/60">{b.code}</code>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-[220px] truncate text-[#10201F]/70">
                    {b.address}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#10201F]">
                    {b.managerName || 'Unassigned'}
                  </td>
                  <td className="py-3.5 px-4 text-2xs space-y-0.5 text-[#10201F]/70">
                    <div>{b.contactEmail}</div>
                    <div>{b.contactPhone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded-lg text-[#10201F]/70 hover:text-[#0B5C63] hover:bg-[#F6F3EA] transition-colors"
                            title="Edit branch"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleBranchStatus(b.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              b.status === 'active'
                                ? 'text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={b.status === 'active' ? 'Deactivate branch' : 'Activate branch'}
                          >
                            <Power size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="md:hidden space-y-3">
        {filteredBranches.map((b) => (
          <div key={b.id} className="bg-white p-4 rounded-2xl border border-[#D9D3C0] shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#10201F]">{b.name}</h3>
                <span className="font-mono text-2xs text-[#10201F]/60">{b.code}</span>
              </div>
              <StatusBadge status={b.status} />
            </div>

            <div className="space-y-1 text-2xs text-[#10201F]/70 border-t border-[#D9D3C0]/40 pt-2">
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[#0B5C63]" />
                <span className="truncate">{b.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={12} className="text-[#0B5C63]" />
                <span className="truncate">{b.contactEmail}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={12} className="text-[#0B5C63]" />
                <span>{b.contactPhone}</span>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D9D3C0]/40">
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(b)}>
                  Edit
                </Button>
                <Button variant="secondary" size="sm" onClick={() => toggleBranchStatus(b.id)}>
                  {b.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <BranchModal
        isOpen={isModalOpen}
        branch={editingBranch}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBranch}
      />
    </div>
  );
}
