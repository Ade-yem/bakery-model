/**
 * @file Modal dialog for configuring custom roles with granular action permissions.
 */

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';
import type { ClientRole } from '../../types';
import { CLIENT_PERMISSIONS } from '../../permissions';
import { Button } from '../../../../components/shared/Button';

export interface RoleModalProps {
  isOpen: boolean;
  role: ClientRole | null;
  onClose: () => void;
  onSave: (data: Omit<ClientRole, 'id' | 'businessId' | 'staffCount' | 'createdAt'>) => { success: boolean; error?: string };
}

const PERMISSION_GROUPS = [
  {
    category: 'Workspace & Structure',
    perms: [
      { key: CLIENT_PERMISSIONS.OVERVIEW_VIEW, label: 'View Overview KPIs' },
      { key: CLIENT_PERMISSIONS.PROFILE_VIEW, label: 'View Business Profile' },
      { key: CLIENT_PERMISSIONS.PROFILE_EDIT, label: 'Edit Business Profile' },
      { key: CLIENT_PERMISSIONS.BRANCHES_VIEW, label: 'View Branches' },
      { key: CLIENT_PERMISSIONS.BRANCHES_MANAGE, label: 'Manage Branches' },
      { key: CLIENT_PERMISSIONS.DEPARTMENTS_VIEW, label: 'View Departments' },
      { key: CLIENT_PERMISSIONS.DEPARTMENTS_MANAGE, label: 'Manage Departments' },
      { key: CLIENT_PERMISSIONS.STAFF_VIEW, label: 'View Staff Directory' },
      { key: CLIENT_PERMISSIONS.STAFF_MANAGE, label: 'Manage Staff Accounts' },
      { key: CLIENT_PERMISSIONS.SHIFTS_VIEW, label: 'View Shift Schedules' },
      { key: CLIENT_PERMISSIONS.SHIFTS_MANAGE, label: 'Manage Shift Rosters' },
    ],
  },
  {
    category: 'Operations',
    perms: [
      { key: CLIENT_PERMISSIONS.INVENTORY_VIEW, label: 'View Inventory' },
      { key: CLIENT_PERMISSIONS.INVENTORY_MANAGE, label: 'Manage Inventory' },
      { key: CLIENT_PERMISSIONS.SALES_VIEW, label: 'View Sales' },
      { key: CLIENT_PERMISSIONS.SALES_MANAGE, label: 'Process Sales' },
      { key: CLIENT_PERMISSIONS.ORDERS_VIEW, label: 'View Orders' },
      { key: CLIENT_PERMISSIONS.ORDERS_MANAGE, label: 'Manage Orders' },
      { key: CLIENT_PERMISSIONS.PRODUCTION_VIEW, label: 'View Production' },
      { key: CLIENT_PERMISSIONS.PRODUCTION_MANAGE, label: 'Manage Batches' },
      { key: CLIENT_PERMISSIONS.PROCUREMENT_VIEW, label: 'View Procurement' },
      { key: CLIENT_PERMISSIONS.PROCUREMENT_MANAGE, label: 'Manage POs' },
      { key: CLIENT_PERMISSIONS.PAYMENTS_VIEW, label: 'View Payments' },
      { key: CLIENT_PERMISSIONS.CREDITS_VIEW, label: 'View Credits' },
    ],
  },
  {
    category: 'Management & Audit',
    perms: [
      { key: CLIENT_PERMISSIONS.REPORTS_VIEW, label: 'View Reports & History' },
      { key: CLIENT_PERMISSIONS.REPORTS_EXPORT, label: 'Export Reports' },
      { key: CLIENT_PERMISSIONS.SETTINGS_VIEW, label: 'View Business Settings' },
      { key: CLIENT_PERMISSIONS.SETTINGS_MANAGE, label: 'Edit Business Settings' },
    ],
  },
];

export function RoleModal({ isOpen, role, onClose, onSave }: RoleModalProps): React.ReactElement | null {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setCode(role.code);
      setDescription(role.description);
      setSelectedPermissions(role.permissions);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setSelectedPermissions([CLIENT_PERMISSIONS.OVERVIEW_VIEW]);
    }
    setError(null);
  }, [role, isOpen]);

  if (!isOpen) return null;

  const handleTogglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSelectAllGroup = (groupPerms: string[]) => {
    const allSelected = groupPerms.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !groupPerms.includes(p)));
    } else {
      const merged = Array.from(new Set([...selectedPermissions, ...groupPerms]));
      setSelectedPermissions(merged);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Role title and code are required.');
      return;
    }
    if (selectedPermissions.length === 0) {
      setError('Please assign at least one permission.');
      return;
    }

    const res = onSave({
      name,
      code,
      description,
      isSystem: role ? role.isSystem : false,
      status: 'active',
      permissions: selectedPermissions,
    });

    if (!res.success) {
      setError(res.error || 'Failed to save role.');
    } else {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl border border-[#D9D3C0] max-w-2xl w-full p-6 sm:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9D3C0]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#10201F]">
                {role ? 'Edit Role & Permissions' : 'Create Custom Role'}
              </h3>
              <p className="text-2xs text-[#10201F]/60">
                Grant granular operational and management permissions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-xl text-[#10201F]/50 hover:text-[#10201F] hover:bg-[#F6F3EA]"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-[#8C1D18]/10 text-[#8C1D18] border border-[#8C1D18]/20 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Role Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Master Baker"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Role Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. BAK"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm uppercase font-mono focus:outline-none focus:border-[#0B5C63] focus:bg-white"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                Role Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief explanation of responsibility"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              />
            </div>
          </div>

          {/* Granular Permission Checklist */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#10201F]/80">
              Assigned Permissions Matrix ({selectedPermissions.length} selected)
            </h4>

            {PERMISSION_GROUPS.map((group) => {
              const groupPermKeys = group.perms.map((p) => p.key);
              return (
                <div key={group.category} className="p-4 rounded-2xl bg-[#F6F3EA]/60 border border-[#D9D3C0]/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D9D3C0]/40 pb-2">
                    <span className="font-extrabold text-xs text-[#10201F]">{group.category}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllGroup(groupPermKeys)}
                      className="text-3xs font-bold text-[#0B5C63] hover:underline"
                    >
                      Toggle All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {group.perms.map((perm) => (
                      <label
                        key={perm.key}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/80 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.key)}
                          onChange={() => handleTogglePermission(perm.key)}
                          className="rounded text-[#0B5C63] focus:ring-[#0B5C63]"
                        />
                        <span className="text-2xs text-[#10201F]/90 font-medium">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#D9D3C0]/60">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Role & Permissions
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
