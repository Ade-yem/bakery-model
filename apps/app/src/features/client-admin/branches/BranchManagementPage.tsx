/**
 * @file Branch Management page adopting Platform Admin directory and table standards.
 */

import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Power, MapPin, Mail, Phone, Building2 } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { ClientBranch } from '../types';
import { SubscriptionGate } from '../components/SubscriptionGate';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { BranchModal } from './components/BranchModal';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';
import { AdminPageHeader } from '../../platform-admin/AdminPageHeader';

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
      {/* 1. Header with AdminPageHeader */}
      <AdminPageHeader
        title="Branch Locations"
        description="Directory of regional retail counters, production facilities, and distribution outlets."
        action={
          canManage ? (
            <button
              type="button"
              onClick={handleOpenCreate}
              disabled={branches.length >= subscription.maxBranches}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-verdigris hover:bg-verdigris-lift text-flour text-sm font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Add Branch</span>
            </button>
          ) : undefined
        }
      />

      {/* 2. Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search branches by name, code, or manager..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      >
        <span className="text-xs text-oven-black/60 font-semibold px-2">
          {branches.length} of {subscription.maxBranches} Branches
        </span>
      </SearchFilterBar>

      {/* 3. Table matching Platform Admin BusinessTable */}
      <div className="bg-white border border-[#D9D3C0] rounded-2xl shadow-xs overflow-hidden">
        {filteredBranches.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#10201F]">No branches found</h3>
            <p className="text-xs text-[#10201F]/60 mt-1 max-w-sm mx-auto">
              No branch locations match your current search and filter criteria. Try adjusting your query or resetting filters.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-[#E5E0D0]">
              {filteredBranches.map((b) => (
                <div key={`mobile-${b.id}`} className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#10201F]">{b.name}</h4>
                      <span className="font-mono text-xs text-[#10201F]/60">{b.code}</span>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="space-y-1 text-xs text-[#10201F]/70 border-t border-[#E5E0D0] pt-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-verdigris" />
                      <span className="truncate">{b.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-verdigris" />
                      <span className="truncate">{b.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-verdigris" />
                      <span>{b.contactPhone}</span>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E0D0]">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(b)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-verdigris hover:bg-[#F6F3EA] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBranchStatus(b.id)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-[#10201F]/70 hover:bg-[#F6F3EA] cursor-pointer"
                      >
                        {b.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Data Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D9D3C0] bg-[#F6F3EA]/60 text-xs font-bold text-[#10201F]/80 uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4 sm:px-6">Branch Name & Code</th>
                    <th scope="col" className="py-3.5 px-4">Address</th>
                    <th scope="col" className="py-3.5 px-4">Manager</th>
                    <th scope="col" className="py-3.5 px-4">Contact Info</th>
                    <th scope="col" className="py-3.5 px-4">Status</th>
                    <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D0] text-sm">
                  {filteredBranches.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F9F7F1]/60 transition-colors group">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-[#10201F] flex items-center gap-2">
                          <span>{b.name}</span>
                          {b.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-verdigris/10 text-verdigris">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#10201F]/50 font-mono mt-0.5">
                          {b.code}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-[#10201F]/70 max-w-[200px] truncate">
                        {b.address}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-semibold text-[#10201F]">
                        {b.managerName || 'Unassigned'}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-[#10201F]/70 font-mono space-y-0.5">
                        <div className="truncate max-w-[150px]">{b.contactEmail}</div>
                        <div>{b.contactPhone}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} />
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {canManage && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(b)}
                              className="p-1.5 rounded-lg text-oven-black/60 hover:text-verdigris hover:bg-flour transition-colors"
                              title="Edit branch details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleBranchStatus(b.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                b.status === 'active'
                                  ? 'text-status-open hover:bg-amber-50'
                                  : 'text-status-balanced hover:bg-emerald-50'
                              }`}
                              title={b.status === 'active' ? 'Deactivate branch' : 'Activate branch'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <BranchModal
        isOpen={isModalOpen}
        branch={editingBranch}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBranch}
      />
    </div>
  );
}
