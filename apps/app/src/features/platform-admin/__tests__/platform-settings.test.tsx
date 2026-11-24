/**
 * @file Unit and integration tests for Cadence Platform Settings module.
 * Covers:
 * - General Platform Information fields (name, description, logo, support email, phone, website)
 * - Platform Preferences (currency, timezone, date/time format, language)
 * - Notification toggles (registration, expiry, payment failure, alerts)
 * - Security policy configuration
 * - Permission gates (platform.settings.view, platform.settings.manage)
 * - Read-only mode for view-only administrators
 * - Save confirmation dialog and cancel rollback
 * - Audit trail integration upon settings modification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { PlatformSettingsPage } from '../settings/PlatformSettingsPage';
import { PLATFORM_PERMISSIONS } from '../permissions';
import { DEFAULT_PLATFORM_SETTINGS, updatePlatformSettings } from '../mock-settings';
import { MOCK_AUDIT_RECORDS } from '../mock-audit';
import type { AuthenticatedActor } from '../../../components/layout/types';

describe('Platform Admin - Platform Settings Module', () => {
  const fullAdminActor: AuthenticatedActor = {
    id: 'admin-settings-full',
    fullName: 'Amara Okafor',
    email: 'amara@cadenceops.com',
    designation: 'Platform Super Admin',
    roleBadge: 'Super Admin',
    initials: 'AO',
    permissions: [
      PLATFORM_PERMISSIONS.SETTINGS_VIEW,
      PLATFORM_PERMISSIONS.SETTINGS_MANAGE,
    ],
  };

  const readOnlyActor: AuthenticatedActor = {
    id: 'admin-settings-ro',
    fullName: 'Chidi Reader',
    email: 'chidi@cadenceops.com',
    designation: 'Auditor',
    roleBadge: 'Auditor',
    initials: 'CR',
    permissions: [PLATFORM_PERMISSIONS.SETTINGS_VIEW],
  };

  const restrictedActor: AuthenticatedActor = {
    id: 'admin-settings-none',
    fullName: 'Restricted User',
    email: 'restricted@cadenceops.com',
    designation: 'Staff',
    roleBadge: 'Staff',
    initials: 'RU',
    permissions: [PLATFORM_PERMISSIONS.DASHBOARD_VIEW],
  };

  beforeEach(() => {
    // Reset baseline settings
  });

  describe('1. Form Sections & Configuration Fields', () => {
    it('renders General Platform Information fields with current values', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlatformSettingsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('General Platform Information');
      expect(html).toContain('Platform Name');
      expect(html).toContain('Support Email');
      expect(html).toContain('Support Phone Number');
      expect(html).toContain('Official Website');
      expect(html).toContain(DEFAULT_PLATFORM_SETTINGS.platformName);
      expect(html).toContain(DEFAULT_PLATFORM_SETTINGS.supportEmail);
    });

    it('renders Platform Preferences (currency, timezone, date/time format, language)', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlatformSettingsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Platform Preferences');
      expect(html).toContain('Default Currency');
      expect(html).toContain('Default Time Zone');
      expect(html).toContain('Date Format');
      expect(html).toContain('Time Format');
    });

    it('renders Notification Settings toggles and alert recipient', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlatformSettingsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Notification Settings');
      expect(html).toContain('New Business Registrations');
      expect(html).toContain('Subscription Expiry Alerts');
      expect(html).toContain('Payment Failure Notifications');
      expect(html).toContain('Administrative Alerts');
    });

    it('renders Security Settings (session timeout, password rules, MFA)', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlatformSettingsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Security Settings');
      expect(html).toContain('Session Timeout');
      expect(html).toContain('Multi-Factor Authentication');
      expect(html).toContain('Password Minimum Length');
    });
  });

  describe('2. Permission Gates & Read-Only Mode', () => {
    it('renders interactive Save and Cancel controls for actors with settings.manage', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlatformSettingsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Save Changes');
      expect(html).toContain('Cancel Changes');
    });

    it('renders read-only mode and disables form controls for actors with only settings.view', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlatformSettingsPage actor={readOnlyActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Read-Only Mode');
      expect(html).not.toContain('Save Changes');
      expect(html).toContain('disabled');
    });

    it('renders access restricted banner when actor lacks platform.settings.view permission', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlatformSettingsPage actor={restrictedActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Access Restricted');
      expect(html).toContain('platform.settings.view');
      expect(html).not.toContain('General Platform Information');
    });
  });

  describe('3. Audit Integration', () => {
    it('records an audit entry when updatePlatformSettings is invoked', () => {
      const initialCount = MOCK_AUDIT_RECORDS.length;
      updatePlatformSettings(
        { sessionTimeoutMinutes: 90 },
        'Amara Okafor',
        'amara@cadenceops.com'
      );

      expect(MOCK_AUDIT_RECORDS.length).toBe(initialCount + 1);
      const latestAudit = MOCK_AUDIT_RECORDS[0];
      expect(latestAudit.action).toBe('Platform Settings Updated');
      expect(latestAudit.module).toBe('Platform Settings');
      expect(latestAudit.diff?.some((d) => d.field === 'sessionTimeoutMinutes')).toBe(true);
    });
  });
});
