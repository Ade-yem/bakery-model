/**
 * @file Master configuration management view for Cadence platform-wide operational settings.
 */

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, RotateCcw, Save } from 'lucide-react';
import { GeneralInfoSection } from './components/GeneralInfoSection';
import { PreferencesSection } from './components/PreferencesSection';
import { NotificationsSection } from './components/NotificationsSection';
import { SecuritySection } from './components/SecuritySection';
import { SettingsConfirmModal } from './components/SettingsConfirmModal';
import { getPlatformSettings, updatePlatformSettings } from '../mock-settings';
import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '../permissions';
import type { AuthenticatedActor } from '../../../components/layout/types';
import type { PlatformSettings } from '../types';

export interface PlatformSettingsPageProps {
  /** Optional authenticated actor. */
  actor?: AuthenticatedActor;
}

/**
 * @description Platform settings view managing platform metadata, preferences, notifications, and security.
 * @param {PlatformSettingsPageProps} props - Component properties.
 * @returns {React.ReactElement} Settings page element.
 */
export function PlatformSettingsPage({ actor }: PlatformSettingsPageProps): React.ReactElement {
  const hasView = hasPlatformPermission(actor, PLATFORM_PERMISSIONS.SETTINGS_VIEW);
  const canManage = hasPlatformPermission(actor, PLATFORM_PERMISSIONS.SETTINGS_MANAGE);

  const [savedSettings, setSavedSettings] = useState<PlatformSettings>(() => getPlatformSettings());
  const [formState, setFormState] = useState<PlatformSettings>(() => getPlatformSettings());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  const isDirty = JSON.stringify(savedSettings) !== JSON.stringify(formState);

  const handleFieldChange = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setFormState({ ...savedSettings });
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const updated = updatePlatformSettings(
        formState,
        actor?.fullName || 'Amara Okafor',
        actor?.email || 'amara@cadenceops.com'
      );
      setSavedSettings({ ...updated });
      setFormState({ ...updated });
      setIsConfirmOpen(false);
      setSuccessBanner(true);
      setTimeout(() => setSuccessBanner(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasView) {
    return (
      <div className="p-8 text-center rounded-xl border border-[#D9D3C0] bg-white font-sans max-w-xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#A9501A]/10 text-[#A9501A] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#10201F]">Access Restricted</h2>
        <p className="text-xs text-[#10201F]/70">
          You require the <code className="font-mono bg-[#F6F3EA] px-1.5 py-0.5 rounded text-[#0B5C63]">platform.settings.view</code> permission to inspect platform configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#10201F] tracking-tight">
            Platform Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#10201F]/70 mt-1">
            Global configuration, operational preferences, notification triggers, and security policies.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={!isDirty || isSaving}
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D9D3C0] bg-white text-xs font-semibold text-[#10201F]/80 hover:bg-[#F6F3EA] disabled:opacity-40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel Changes</span>
            </button>

            <button
              type="button"
              disabled={!isDirty || isSaving}
              onClick={() => setIsConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B5C63] text-white text-xs font-bold shadow-xs hover:bg-[#0B5C63]/90 disabled:opacity-40 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Read-Only Notice */}
      {!canManage && (
        <div className="p-3.5 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA] text-xs flex items-center justify-between">
          <span className="font-bold text-[#10201F]">
            Read-Only Mode: You possess view-only permissions. Contact a Super Admin to update platform settings.
          </span>
          <span className="text-[11px] font-mono text-[#10201F]/60">settings.view</span>
        </div>
      )}

      {/* Unsaved Changes Indicator */}
      {canManage && isDirty && (
        <div className="p-3 rounded-xl border border-[#D9822B]/40 bg-[#D9822B]/10 text-xs font-semibold text-[#A9501A] flex items-center justify-between">
          <span>You have unsaved changes in your platform configuration.</span>
          <span className="text-[11px] font-bold uppercase">Unsaved Draft</span>
        </div>
      )}

      {/* Success Notification */}
      {successBanner && (
        <div className="p-3.5 rounded-xl border border-[#2C571D]/30 bg-[#2C571D]/10 text-xs font-bold text-[#2C571D] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2C571D]" />
          <span>Platform settings updated successfully and logged in Audit and Activity.</span>
        </div>
      )}

      {/* Form Sections */}
      <GeneralInfoSection
        settings={formState}
        onChange={handleFieldChange}
        disabled={!canManage}
      />

      <PreferencesSection
        settings={formState}
        onChange={handleFieldChange}
        disabled={!canManage}
      />

      <NotificationsSection
        settings={formState}
        onChange={handleFieldChange}
        disabled={!canManage}
      />

      <SecuritySection
        settings={formState}
        onChange={handleFieldChange}
        disabled={!canManage}
      />

      {/* Confirmation Dialog */}
      <SettingsConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        isSaving={isSaving}
      />
    </div>
  );
}
