/**
 * @file Department Configuration interface enabling deep configuration of duties,
 * subscribed operational modules, available actions, and record types.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sliders,
  CheckSquare,
  Plus,
  Save,
  Trash2,
  Lock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import type { ClientDepartmentConfig, DepartmentDuty, OperationalModuleKey } from '../types';
import { Button } from '../../../components/shared/Button';
import { DutyEditorModal } from './components/DutyEditorModal';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';
import { AdminPageHeader } from '../../platform-admin/AdminPageHeader';

const ALL_POSSIBLE_ACTIONS: Array<'view' | 'create' | 'edit' | 'approve' | 'delete'> = [
  'view',
  'create',
  'edit',
  'approve',
  'delete',
];

const RECORD_OPTIONS = [
  'ProductionBatch',
  'MaterialRequisition',
  'OvenLog',
  'WasteReport',
  'SalesReceipt',
  'CashDrawerCount',
  'CustomerCredit',
  'TransferManifest',
  'GoodsReceivedNote',
];

export function DepartmentConfigPage(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const { departments, subscription, actor, getDepartmentConfig, saveDepartmentConfig } = useTenant();

  const canManage = hasClientPermission(actor, CLIENT_PERMISSIONS.DEPARTMENTS_CONFIG_MANAGE);

  const selectedDeptId = searchParams.get('dept') || (departments[0]?.id ?? '');
  const activeDepartment = departments.find((d) => d.id === selectedDeptId) || departments[0];

  const [config, setConfig] = useState<ClientDepartmentConfig | null>(null);
  const [dutyModalOpen, setDutyModalOpen] = useState(false);
  const [editingDuty, setEditingDuty] = useState<DepartmentDuty | null>(null);
  const [saveFeedback, setSaveFeedback] = useState(false);

  useEffect(() => {
    if (activeDepartment) {
      const existing = getDepartmentConfig(activeDepartment.id);
      if (existing) {
        setConfig(existing);
      }
    }
  }, [activeDepartment, getDepartmentConfig]);

  if (!activeDepartment || !config) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-[#D9D3C0] font-sans">
        <p className="text-sm text-[#10201F]/60">No department selected or created yet.</p>
        <Link to="/business/departments" className="mt-3 inline-block font-bold text-xs text-[#0B5C63]">
          Go to Department Builder
        </Link>
      </div>
    );
  }

  const handleModuleToggle = (moduleKey: OperationalModuleKey) => {
    // Only allow toggling if included in subscription!
    if (!subscription.enabledModules.includes(moduleKey)) return;

    setConfig((prev) => {
      if (!prev) return prev;
      const exists = prev.enabledModules.includes(moduleKey);
      return {
        ...prev,
        enabledModules: exists
          ? prev.enabledModules.filter((m) => m !== moduleKey)
          : [...prev.enabledModules, moduleKey],
      };
    });
  };

  const handleActionToggle = (action: 'view' | 'create' | 'edit' | 'approve' | 'delete') => {
    setConfig((prev) => {
      if (!prev) return prev;
      const exists = prev.availableActions.includes(action);
      return {
        ...prev,
        availableActions: exists
          ? prev.availableActions.filter((a) => a !== action)
          : [...prev.availableActions, action],
      };
    });
  };

  const handleRecordTypeToggle = (recordType: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const exists = prev.recordTypes.includes(recordType);
      return {
        ...prev,
        recordTypes: exists
          ? prev.recordTypes.filter((r) => r !== recordType)
          : [...prev.recordTypes, recordType],
      };
    });
  };

  const handleSaveDuty = (duty: DepartmentDuty) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const existingIndex = prev.duties.findIndex((d) => d.id === duty.id);
      let newDuties = [...prev.duties];
      if (existingIndex >= 0) {
        newDuties[existingIndex] = duty;
      } else {
        newDuties.push(duty);
      }
      return { ...prev, duties: newDuties };
    });
  };

  const handleDeleteDuty = (dutyId: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return { ...prev, duties: prev.duties.filter((d) => d.id !== dutyId) };
    });
  };

  const handleSaveAll = () => {
    if (config) {
      saveDepartmentConfig(config);
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 3000);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      {/* 1. Standardized Platform Admin Page Header */}
      <AdminPageHeader
        title="Department Configuration"
        description={`Configure duties, module access, record types, and action boundaries for ${activeDepartment.name}.`}
        action={
          <div className="flex items-center gap-3">
            <select
              value={activeDepartment.id}
              onChange={(e) => setSearchParams({ dept: e.target.value })}
              className="px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs font-bold text-[#10201F] focus:outline-none focus:border-[#0B5C63] cursor-pointer"
              aria-label="Select department to configure"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {canManage && (
              <button
                type="button"
                onClick={handleSaveAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-verdigris hover:bg-verdigris-lift text-flour text-sm font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            )}
          </div>
        }
      />

      {saveFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Department configuration saved successfully.</span>
        </div>
      )}

      {/* 1. Department Duties Section */}
      <div className="bg-white p-6 rounded-2xl border border-[#D9D3C0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center">
              <CheckSquare size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#10201F]">
                Department Duties & Checklist
              </h2>
              <p className="text-xs text-[#10201F]/60">
                Operational tasks assigned to staff working in this department
              </p>
            </div>
          </div>

          {canManage && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              iconPosition="left"
              onClick={() => {
                setEditingDuty(null);
                setDutyModalOpen(true);
              }}
            >
              Add Duty
            </Button>
          )}
        </div>

        <div className="space-y-2.5 pt-2">
          {config.duties.length === 0 ? (
            <p className="text-xs text-[#10201F]/50 py-4 text-center">
              No specific duties registered yet. Click &quot;Add Duty&quot; to define department procedures.
            </p>
          ) : (
            config.duties.map((duty) => (
              <div
                key={duty.id}
                className="p-3.5 rounded-2xl bg-[#F6F3EA] border border-[#D9D3C0]/60 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#10201F]">{duty.title}</h4>
                  <p className="text-2xs text-[#10201F]/70">{duty.description}</p>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDuty(duty);
                        setDutyModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-[#10201F]/60 hover:text-[#0B5C63]"
                      title="Edit duty"
                    >
                      <Sliders size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDuty(duty.id)}
                      className="p-1 rounded-lg text-[#10201F]/60 hover:text-[#8C1D18]"
                      title="Delete duty"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Enabled Operational Modules (Subscription-bounded) */}
      <div className="bg-white p-6 rounded-2xl border border-[#D9D3C0] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0B5C63]/10 text-[#0B5C63] flex items-center justify-center">
            <Layers size={16} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#10201F]">
              Enabled Operational Modules
            </h2>
            <p className="text-2xs text-[#10201F]/60">
              Only operational modules included in your business plan can be enabled
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {(['inventory', 'sales', 'orders', 'procurement', 'production', 'payments', 'credits'] as OperationalModuleKey[]).map((mod) => {
            const isSubscribed = subscription.enabledModules.includes(mod);
            const isEnabled = config.enabledModules.includes(mod);

            return (
              <button
                key={mod}
                type="button"
                disabled={!isSubscribed || !canManage}
                onClick={() => handleModuleToggle(mod)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  !isSubscribed
                    ? 'bg-[#10201F]/5 border-[#D9D3C0]/40 opacity-50 cursor-not-allowed'
                    : isEnabled
                    ? 'bg-[#0B5C63]/10 border-[#0B5C63] text-[#0B5C63]'
                    : 'bg-white border-[#D9D3C0] text-[#10201F] hover:bg-[#F6F3EA]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs capitalize">{mod}</span>
                  {!isSubscribed ? (
                    <span title="Upgrade required">
                      <Lock size={12} className="text-[#10201F]/40" />
                    </span>
                  ) : (
                    <div
                      className={`w-3.5 h-3.5 rounded-full border ${
                        isEnabled ? 'bg-[#0B5C63] border-[#0B5C63]' : 'border-[#D9D3C0]'
                      }`}
                    />
                  )}
                </div>
                <span className="text-3xs text-[#10201F]/60">
                  {!isSubscribed ? 'Not in plan tier' : isEnabled ? 'Active in department' : 'Disabled'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Available Actions & Record Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actions */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9D3C0] shadow-xs space-y-3">
          <h2 className="text-base font-extrabold text-[#10201F]">
            Allowed Actions
          </h2>
          <p className="text-xs text-[#10201F]/60">
            Define permissions granted to department workers
          </p>

          <div className="space-y-2 pt-2">
            {ALL_POSSIBLE_ACTIONS.map((action) => {
              const active = config.availableActions.includes(action);
              return (
                <label
                  key={action}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#D9D3C0]/60 hover:bg-[#F6F3EA] cursor-pointer text-xs"
                >
                  <span className="font-bold capitalize text-[#10201F]">{action} Records</span>
                  <input
                    type="checkbox"
                    checked={active}
                    disabled={!canManage}
                    onChange={() => handleActionToggle(action)}
                    className="rounded text-[#0B5C63] focus:ring-[#0B5C63]"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Record Types */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9D3C0] shadow-xs space-y-3">
          <h2 className="text-base font-extrabold text-[#10201F]">
            Handled Record Types
          </h2>
          <p className="text-2xs text-[#10201F]/60">
            Types of transactional operational records handled
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {RECORD_OPTIONS.map((rec) => {
              const active = config.recordTypes.includes(rec);
              return (
                <label
                  key={rec}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer ${
                    active
                      ? 'bg-[#0B5C63]/5 border-[#0B5C63] text-[#0B5C63] font-bold'
                      : 'border-[#D9D3C0]/60 text-[#10201F] hover:bg-[#F6F3EA]'
                  }`}
                >
                  <span className="truncate">{rec}</span>
                  <input
                    type="checkbox"
                    checked={active}
                    disabled={!canManage}
                    onChange={() => handleRecordTypeToggle(rec)}
                    className="rounded text-[#0B5C63] focus:ring-[#0B5C63]"
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Duty Modal */}
      <DutyEditorModal
        isOpen={dutyModalOpen}
        duty={editingDuty}
        onClose={() => setDutyModalOpen(false)}
        onSave={handleSaveDuty}
      />
    </div>
  );
}
