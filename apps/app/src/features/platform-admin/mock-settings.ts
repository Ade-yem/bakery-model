/**
 * @file Default mock configuration and repository for Cadence Platform Settings.
 */

import type { PlatformSettings } from './types';
import { recordPlatformAudit } from './mock-audit';

/**
 * Initial baseline platform settings.
 */
export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'Cadence Operations Platform',
  platformDescription:
    'Multi-tenant operations and reconciliation platform for shift-based businesses.',
  platformLogoUrl: '/logo.svg',
  supportEmail: 'support@cadenceops.com',
  supportPhone: '+234 800 223 3623',
  websiteUrl: 'https://cadenceops.com',

  defaultCurrency: 'NGN',
  defaultTimeZone: 'Africa/Lagos',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24-hour',
  defaultLanguage: 'English (en-NG)',

  notifyNewRegistration: true,
  notifySubscriptionExpiry: true,
  notifyPaymentFailure: true,
  notifyAdminAlerts: true,
  alertEmail: 'alerts@cadenceops.com',

  sessionTimeoutMinutes: 60,
  requireMfaForAdmins: true,
  passwordMinLength: 10,
  requireSpecialChar: true,

  lastUpdated: '2026-02-18T14:22:10Z',
  updatedBy: 'Amara Okafor',
};

// In-memory active platform settings
let currentPlatformSettings: PlatformSettings = { ...DEFAULT_PLATFORM_SETTINGS };

/**
 * Retrieves the current platform settings.
 * @returns {PlatformSettings} The current platform settings clone.
 */
export function getPlatformSettings(): PlatformSettings {
  return { ...currentPlatformSettings };
}

/**
 * Updates platform settings and records an audit log entry.
 * @param {Partial<PlatformSettings>} updates - Changed settings fields.
 * @param {string} actorName - Administrator committing the changes.
 * @param {string} actorEmail - Administrator email.
 * @returns {PlatformSettings} Updated settings object.
 */
export function updatePlatformSettings(
  updates: Partial<PlatformSettings>,
  actorName: string = 'Amara Okafor',
  actorEmail: string = 'amara@cadenceops.com'
): PlatformSettings {
  const diffs: { field: string; previousValue: string; newValue: string }[] = [];

  (Object.keys(updates) as (keyof PlatformSettings)[]).forEach((key) => {
    if (
      updates[key] !== undefined &&
      String(currentPlatformSettings[key]) !== String(updates[key])
    ) {
      diffs.push({
        field: String(key),
        previousValue: String(currentPlatformSettings[key]),
        newValue: String(updates[key]),
      });
    }
  });

  currentPlatformSettings = {
    ...currentPlatformSettings,
    ...updates,
    lastUpdated: new Date().toISOString(),
    updatedBy: actorName,
  };

  if (diffs.length > 0) {
    recordPlatformAudit({
      adminId: 'admin-super-01',
      adminName: actorName,
      adminEmail: actorEmail,
      action: 'Platform Settings Updated',
      actionType: 'settings_updated',
      module: 'Platform Settings',
      description: `Updated platform configuration: ${diffs.map((d) => d.field).join(', ')}.`,
      status: 'success',
      relatedEntity: {
        type: 'settings',
        id: 'platform-global-settings',
        name: 'Global Platform Settings',
      },
      diff: diffs,
    });
  }

  return { ...currentPlatformSettings };
}
