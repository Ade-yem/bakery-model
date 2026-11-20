/**
 * @file Business Settings page organizing General, Localization, Workspace,
 * Notifications, and Security settings scoped strictly to the client business.
 */

import React, { useState } from 'react';
import { Settings, Save, Globe, Shield, Bell, Building, CheckCircle2 } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import { Button } from '../../../components/shared/Button';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';
import { PermissionGate } from '../components/PermissionGate';

export function BusinessSettingsPage(): React.ReactElement {
  const { settings, updateSettings, actor, currentBusiness } = useTenant();

  const canManage = hasClientPermission(actor, CLIENT_PERMISSIONS.SETTINGS_MANAGE);
  const canView = hasClientPermission(actor, CLIENT_PERMISSIONS.SETTINGS_VIEW);

  const [activeTab, setActiveTab] = useState<'general' | 'localization' | 'workspace' | 'notifications' | 'security'>('general');
  const [formData, setFormData] = useState(settings);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!canView) {
    return <PermissionGate permission={CLIENT_PERMISSIONS.SETTINGS_VIEW} />;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setFeedback('Business preferences updated successfully.');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#D9D3C0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-3xs font-extrabold uppercase tracking-wider text-[#0B5C63]">
            Configuration Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10201F] tracking-tight">
            Business Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#10201F]/70 mt-0.5">
            Configure localization, operating hours, notification thresholds, and security policies for {currentBusiness.name}.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            icon={<Save size={14} />}
            iconPosition="left"
            onClick={handleSave}
          >
            Save All Settings
          </Button>
        )}
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#D9D3C0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'general' ? 'bg-[#0B5C63] text-white shadow-2xs' : 'text-[#10201F]/70 hover:bg-[#F6F3EA]'
          }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('localization')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'localization' ? 'bg-[#0B5C63] text-white shadow-2xs' : 'text-[#10201F]/70 hover:bg-[#F6F3EA]'
          }`}
        >
          Localization
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'workspace' ? 'bg-[#0B5C63] text-white shadow-2xs' : 'text-[#10201F]/70 hover:bg-[#F6F3EA]'
          }`}
        >
          Workspace
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'notifications' ? 'bg-[#0B5C63] text-white shadow-2xs' : 'text-[#10201F]/70 hover:bg-[#F6F3EA]'
          }`}
        >
          Notifications
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'security' ? 'bg-[#0B5C63] text-white shadow-2xs' : 'text-[#10201F]/70 hover:bg-[#F6F3EA]'
          }`}
        >
          Security
        </button>
      </div>

      {/* Settings Sections */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9D3C0] shadow-xs space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-[#10201F]">General Operational Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                  Operating Hours Start
                </label>
                <input
                  type="time"
                  disabled={!canManage}
                  value={formData.general.operatingHoursStart}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: { ...formData.general, operatingHoursStart: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                  Operating Hours End
                </label>
                <input
                  type="time"
                  disabled={!canManage}
                  value={formData.general.operatingHoursEnd}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: { ...formData.general, operatingHoursEnd: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm font-mono"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#F6F3EA] border border-[#D9D3C0]/60 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canManage}
                    checked={formData.general.autoSealShifts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        general: { ...formData.general, autoSealShifts: e.target.checked },
                      })
                    }
                    className="rounded text-[#0B5C63] focus:ring-[#0B5C63]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#10201F] block">
                      Auto-seal shifts at shift end time
                    </span>
                    <span className="text-2xs text-[#10201F]/60">
                      When enabled, registers are locked and unsealed tallies require manager unlock code.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'localization' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-[#10201F]">Regional & Localization Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                  Base Operating Currency
                </label>
                <select
                  disabled={!canManage}
                  value={formData.localization.currency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      localization: { ...formData.localization, currency: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs sm:text-sm font-bold"
                >
                  <option value="NGN">NGN (₦ - Nigerian Naira)</option>
                  <option value="GHS">GHS (GH₵ - Ghanaian Cedi)</option>
                  <option value="KES">KES (KSh - Kenyan Shilling)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                  Time Zone
                </label>
                <select
                  disabled={!canManage}
                  value={formData.localization.timeZone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      localization: { ...formData.localization, timeZone: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs sm:text-sm font-bold"
                >
                  <option value="Africa/Lagos (GMT+1)">Africa/Lagos (West Africa Time, GMT+1)</option>
                  <option value="Africa/Accra (GMT)">Africa/Accra (Greenwich Mean Time, GMT)</option>
                  <option value="Africa/Nairobi (GMT+3)">Africa/Nairobi (East Africa Time, GMT+3)</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                  Date Format
                </label>
                <select
                  disabled={!canManage}
                  value={formData.localization.dateFormat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      localization: { ...formData.localization, dateFormat: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs sm:text-sm font-bold"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 19/11/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-[#10201F]">Workspace & Logistics Boundaries</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F6F3EA] border border-[#D9D3C0]/60 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!canManage}
                  checked={formData.workspace.requireBranchSelection}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workspace: { ...formData.workspace, requireBranchSelection: e.target.checked },
                    })
                  }
                  className="rounded text-[#0B5C63] focus:ring-[#0B5C63]"
                />
                <div>
                  <span className="font-bold text-xs text-[#10201F] block">
                    Enforce explicit branch selection on login
                  </span>
                  <span className="text-2xs text-[#10201F]/60">
                    Staff must verify their branch location before starting a shift or opening a POS register.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F6F3EA] border border-[#D9D3C0]/60 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!canManage}
                  checked={formData.workspace.allowCrossBranchTransfers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workspace: { ...formData.workspace, allowCrossBranchTransfers: e.target.checked },
                    })
                  }
                  className="rounded text-[#0B5C63] focus:ring-[#0B5C63]"
                />
                <div>
                  <span className="font-bold text-xs text-[#10201F] block">
                    Allow inter-branch stock requisitions
                  </span>
                  <span className="text-2xs text-[#10201F]/60">
                    Permits outlets to transfer flour bags or finished bread batches between locations.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-[#10201F]">Alert Channels & Stock Thresholds</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                  Daily Digest Email
                </label>
                <input
                  type="email"
                  disabled={!canManage}
                  value={formData.notifications.dailyDigestEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: { ...formData.notifications, dailyDigestEmail: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                  Low Stock Threshold (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  disabled={!canManage}
                  value={formData.notifications.lowStockThresholdPercent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        lowStockThresholdPercent: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-[#10201F]">Workspace Access & Security Controls</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1">
                  Inactivity Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  disabled={!canManage}
                  value={formData.security.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      security: {
                        ...formData.security,
                        sessionTimeoutMinutes: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/30 text-xs sm:text-sm font-mono"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F6F3EA] border border-[#D9D3C0]/60 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canManage}
                    checked={formData.security.enforceTwoFactor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        security: { ...formData.security, enforceTwoFactor: e.target.checked },
                      })
                    }
                    className="rounded text-[#0B5C63] focus:ring-[#0B5C63]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#10201F] block">
                      Enforce Multi-Factor Authentication (MFA) for All Managers
                    </span>
                    <span className="text-2xs text-[#10201F]/60">
                      Requires two-step verification code before signing shift seal sheets or disbursing payments.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {canManage && (
          <div className="flex items-center justify-end pt-4 border-t border-[#D9D3C0]/40">
            <Button variant="primary" size="sm" type="submit">
              Save Settings
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
