/**
 * @file Unit and integration tests for Cadence Platform Admin Audit and Activity module.
 * Covers:
 * - Summary KPI cards (Total Activities, Today's Activities, Administrative Actions, Recent Security Events)
 * - Activity directory table with alternating row background colors and View More pagination
 * - Search by admin, description, or activity ID
 * - Multi-criteria filters by module, action type, administrator, date range, and status
 * - Responsive stacked mobile cards
 * - Read-only Activity Details view showing diffs, related entities, and IP addresses
 * - Permission gates (platform.audit.view)
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AuditOverviewPage } from '../audit/AuditOverviewPage';
import { AuditDetailsModal } from '../audit/components/AuditDetailsModal';
import { PLATFORM_PERMISSIONS } from '../permissions';
import { MOCK_AUDIT_RECORDS } from '../mock-audit';
import type { AuthenticatedActor } from '../../../components/layout/types';

describe('Platform Admin - Audit and Activity Module', () => {
  const fullAdminActor: AuthenticatedActor = {
    id: 'admin-audit-full',
    fullName: 'Amara Okafor',
    email: 'amara@cadenceops.com',
    designation: 'Platform Super Admin',
    roleBadge: 'Super Admin',
    initials: 'AO',
    permissions: [PLATFORM_PERMISSIONS.AUDIT_VIEW],
  };

  const restrictedActor: AuthenticatedActor = {
    id: 'admin-audit-none',
    fullName: 'Restricted User',
    email: 'restricted@cadenceops.com',
    designation: 'Staff',
    roleBadge: 'Staff',
    initials: 'RU',
    permissions: [PLATFORM_PERMISSIONS.DASHBOARD_VIEW],
  };

  describe('1. Audit Overview & Summary Cards', () => {
    it('renders overview KPI cards for Total, Today, Administrative, and Security Events', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AuditOverviewPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Total Activities');
      expect(html).toContain('Activities');
      expect(html).toContain('Administrative Actions');
      expect(html).toContain('Security Events');
      expect(html).toContain(String(MOCK_AUDIT_RECORDS.length));
    });

    it('renders table columns with Activity ID, Administrator, Action, Module, Description, Date, and Status', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AuditOverviewPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Activity ID');
      expect(html).toContain('Administrator');
      expect(html).toContain('Action');
      expect(html).toContain('Module');
      expect(html).toContain('Description');
      expect(html).toContain('Date &amp; Time');
      expect(html).toContain('Status');

      const firstLog = MOCK_AUDIT_RECORDS[0];
      expect(html).toContain(firstLog.id);
      expect(html).toContain(firstLog.adminName);
      expect(html).toContain(firstLog.action);
    });

    it('renders search input and multi-criteria filters', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AuditOverviewPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('placeholder="Search by administrator, description, or activity ID..."');
      expect(html).toContain('All Modules');
      expect(html).toContain('All Actions');
      expect(html).toContain('All Statuses');
      expect(html).toContain('Clear Filters');
    });

    it('renders mobile cards alongside desktop table', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AuditOverviewPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('audit-mobile-card');
    });

    it('enforces read-only behavior with no edit or delete controls', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AuditOverviewPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).not.toContain('Edit Activity');
      expect(html).not.toContain('Delete Activity');
      expect(html).not.toContain('Purge Logs');
      expect(html).toContain('View Details');
    });
  });

  describe('2. Activity Details View & Diffs', () => {
    it('renders complete activity information, diffs, IP address, and related entity', () => {
      const log = MOCK_AUDIT_RECORDS[0];
      const html = renderToStaticMarkup(
        <AuditDetailsModal
          record={log}
          onClose={() => {}}
        />
      );

      expect(html).toContain(log.id);
      expect(html).toContain(log.adminName);
      expect(html).toContain(log.adminEmail);
      expect(html).toContain(log.action);
      expect(html).toContain(log.module);
      expect(html).toContain(log.description);
      expect(html).toContain(log.ipAddress!);
      expect(html).toContain('Configuration Changes (Diff)');
      expect(html).toContain(log.diff![0].field);
      expect(html).toContain(log.diff![0].previousValue);
      expect(html).toContain(log.diff![0].newValue);
    });

    it('renders gracefully when diff or IP address is not recorded', () => {
      const logWithoutDiff = MOCK_AUDIT_RECORDS[2];
      const html = renderToStaticMarkup(
        <AuditDetailsModal
          record={logWithoutDiff}
          onClose={() => {}}
        />
      );

      expect(html).toContain(logWithoutDiff.id);
      expect(html).not.toContain('Configuration Changes (Diff)');
    });
  });

  describe('3. Permission Gates', () => {
    it('renders access denied warning when actor lacks platform.audit.view permission', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AuditOverviewPage actor={restrictedActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Access Restricted');
      expect(html).toContain('platform.audit.view');
      expect(html).not.toContain('Total Activities');
    });
  });
});
