/**
 * @file Unit and integration test suite for Platform Admin module permissions, navigation groups, and access control.
 * Verifies exact alignment with the TallyBakery Platform Admin Architecture and Access Control Specification:
 * - 4 Navigation Groups: Overview, Platform Management, Billing Management, System
 * - 11 Platform Permissions: platform.dashboard.view, platform.businesses.view, platform.businesses.manage,
 *   platform.plans.view, platform.plans.manage, platform.subscriptions.view, platform.subscriptions.manage,
 *   platform.client_admins.view, platform.settings.view, platform.settings.manage, platform.audit.view
 * - Route access control gating unauthorized actors
 * - Strict separation of Platform Admin permissions from client business permissions
 * - Overview KPI metrics: Total businesses, Active subscriptions, Pending accounts, Expired plans, Recent platform activity
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  PLATFORM_PERMISSIONS,
  ROUTE_TITLE_MAP,
  hasPlatformPermission,
} from '../permissions';
import { filterNavGroupsByPermissions } from '../../../components/layout/permission-filter';
import { PLATFORM_ADMIN_NAV_GROUPS } from '../../../components/layout/role-nav-configs';
import { AuthenticatedSidebar } from '../../../components/layout/AuthenticatedSidebar';
import { AdminRoutes } from '../AdminRoutes';
import { AdminDashboard } from '../AdminDashboard';
import { MOCK_PLATFORM_METRICS } from '../mock-data';
import type { AuthenticatedActor } from '../../../components/layout/types';

describe('TallyBakery Platform Admin Architecture and Access Control Specification', () => {
  describe('1. Central Permission Registry & Validation', () => {
    it('declares all 11 required platform permissions in exact dot-notation', () => {
      expect(PLATFORM_PERMISSIONS.DASHBOARD_VIEW).toBe('platform.dashboard.view');
      expect(PLATFORM_PERMISSIONS.BUSINESSES_VIEW).toBe('platform.businesses.view');
      expect(PLATFORM_PERMISSIONS.BUSINESSES_MANAGE).toBe('platform.businesses.manage');
      expect(PLATFORM_PERMISSIONS.PLANS_VIEW).toBe('platform.plans.view');
      expect(PLATFORM_PERMISSIONS.PLANS_MANAGE).toBe('platform.plans.manage');
      expect(PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW).toBe('platform.subscriptions.view');
      expect(PLATFORM_PERMISSIONS.SUBSCRIPTIONS_MANAGE).toBe('platform.subscriptions.manage');
      expect(PLATFORM_PERMISSIONS.CLIENT_ADMINS_VIEW).toBe('platform.client_admins.view');
      expect(PLATFORM_PERMISSIONS.SETTINGS_VIEW).toBe('platform.settings.view');
      expect(PLATFORM_PERMISSIONS.SETTINGS_MANAGE).toBe('platform.settings.manage');
      expect(PLATFORM_PERMISSIONS.AUDIT_VIEW).toBe('platform.audit.view');
    });

    it('hasPlatformPermission helper checks actor permissions accurately', () => {
      const actor: AuthenticatedActor = {
        id: 'test-admin',
        fullName: 'Test Admin',
        email: 'test@admin.com',
        designation: 'Admin',
        permissions: [PLATFORM_PERMISSIONS.BUSINESSES_VIEW, PLATFORM_PERMISSIONS.BUSINESSES_MANAGE],
      };

      expect(hasPlatformPermission(actor, PLATFORM_PERMISSIONS.BUSINESSES_VIEW)).toBe(true);
      expect(hasPlatformPermission(actor, PLATFORM_PERMISSIONS.BUSINESSES_MANAGE)).toBe(true);
      expect(hasPlatformPermission(actor, PLATFORM_PERMISSIONS.PLANS_MANAGE)).toBe(false);
      expect(hasPlatformPermission(undefined, PLATFORM_PERMISSIONS.BUSINESSES_VIEW)).toBe(false);
    });

    it('does not grant platform access from client business permissions', () => {
      const clientBusinessOwner: AuthenticatedActor = {
        id: 'owner-1',
        fullName: 'Bakery Owner',
        email: 'owner@bakery.com',
        designation: 'Bakery Owner',
        permissions: [
          'owner:dashboard:view',
          'owner:finances:view',
          'owner:staff:view',
          'manager:production:view',
          'staff:orders:view',
        ],
      };

      for (const permission of Object.values(PLATFORM_PERMISSIONS)) {
        expect(hasPlatformPermission(clientBusinessOwner, permission)).toBe(false);
      }

      const filtered = filterNavGroupsByPermissions(PLATFORM_ADMIN_NAV_GROUPS, clientBusinessOwner.permissions);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('2. Navigation Structure Alignment', () => {
    it('structures sidebar into exact 4 groups specified', () => {
      const groupTitles = PLATFORM_ADMIN_NAV_GROUPS.map((g) => g.groupTitle);
      expect(groupTitles).toEqual([
        'Overview',
        'Platform Management',
        'Billing Management',
        'System',
      ]);
    });

    it('places exact items under each navigation group', () => {
      const overviewGroup = PLATFORM_ADMIN_NAV_GROUPS.find((g) => g.groupTitle === 'Overview');
      expect(overviewGroup?.items.map((i) => i.label)).toEqual(['Dashboard']);
      expect(overviewGroup?.items[0]?.path).toBe('/admin/dashboard');
      expect(overviewGroup?.items[0]?.requiredPermissions).toContain(PLATFORM_PERMISSIONS.DASHBOARD_VIEW);

      const platformMgmtGroup = PLATFORM_ADMIN_NAV_GROUPS.find((g) => g.groupTitle === 'Platform Management');
      expect(platformMgmtGroup?.items.map((i) => i.label)).toEqual(['Businesses', 'Client Admin Accounts']);
      expect(platformMgmtGroup?.items[0]?.path).toBe('/admin/businesses');
      expect(platformMgmtGroup?.items[0]?.requiredPermissions).toContain(PLATFORM_PERMISSIONS.BUSINESSES_VIEW);
      expect(platformMgmtGroup?.items[1]?.path).toBe('/admin/client-admins');
      expect(platformMgmtGroup?.items[1]?.requiredPermissions).toContain(PLATFORM_PERMISSIONS.CLIENT_ADMINS_VIEW);

      const billingGroup = PLATFORM_ADMIN_NAV_GROUPS.find((g) => g.groupTitle === 'Billing Management');
      expect(billingGroup?.items.map((i) => i.label)).toEqual(['Subscription Plans', 'Subscriptions']);
      expect(billingGroup?.items[0]?.path).toBe('/admin/plans');
      expect(billingGroup?.items[0]?.requiredPermissions).toContain(PLATFORM_PERMISSIONS.PLANS_VIEW);
      expect(billingGroup?.items[1]?.path).toBe('/admin/subscriptions');
      expect(billingGroup?.items[1]?.requiredPermissions).toContain(PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW);

      const systemGroup = PLATFORM_ADMIN_NAV_GROUPS.find((g) => g.groupTitle === 'System');
      expect(systemGroup?.items.map((i) => i.label)).toEqual(['Audit and Activity', 'Platform Settings']);
      expect(systemGroup?.items[0]?.path).toBe('/admin/audit');
      expect(systemGroup?.items[0]?.requiredPermissions).toContain(PLATFORM_PERMISSIONS.AUDIT_VIEW);
      expect(systemGroup?.items[1]?.path).toBe('/admin/settings');
      expect(systemGroup?.items[1]?.requiredPermissions).toContain(PLATFORM_PERMISSIONS.SETTINGS_VIEW);
    });

    it('renders all permitted navigation items in AuthenticatedSidebar for Super Admin', () => {
      const superAdminActor: AuthenticatedActor = {
        id: 'super-admin-full',
        fullName: 'Amara Okafor',
        email: 'admin@tallybakery.app',
        designation: 'Platform Super Admin',
        roleBadge: 'Super Admin',
        permissions: Object.values(PLATFORM_PERMISSIONS),
      };

      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthenticatedSidebar
            actor={superAdminActor}
            groups={PLATFORM_ADMIN_NAV_GROUPS}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </MemoryRouter>
      );

      expect(html).toContain('Overview');
      expect(html).toContain('Dashboard');
      expect(html).toContain('Platform Management');
      expect(html).toContain('Businesses');
      expect(html).toContain('Client Admin Accounts');
      expect(html).toContain('Billing Management');
      expect(html).toContain('Subscription Plans');
      expect(html).toContain('Subscriptions');
      expect(html).toContain('System');
      expect(html).toContain('Audit and Activity');
      expect(html).toContain('Platform Settings');
    });

    it('conditionally hides unauthorized groups and items based on actor permissions', () => {
      const businessOnlyAdmin: AuthenticatedActor = {
        id: 'biz-admin',
        fullName: 'Business Reviewer',
        email: 'reviewer@tallybakery.app',
        designation: 'Tenant Auditor',
        permissions: [PLATFORM_PERMISSIONS.BUSINESSES_VIEW],
      };

      const filtered = filterNavGroupsByPermissions(PLATFORM_ADMIN_NAV_GROUPS, businessOnlyAdmin.permissions);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.groupTitle).toBe('Platform Management');
      expect(filtered[0]?.items).toHaveLength(1);
      expect(filtered[0]?.items[0]?.label).toBe('Businesses');
    });
  });

  describe('3. Overview Module KPIs & Activity', () => {
    it('defines the 4 required KPI metrics for Overview', () => {
      const metricLabels = MOCK_PLATFORM_METRICS.map((m) => m.label);
      expect(metricLabels).toContain('Total businesses');
      expect(metricLabels).toContain('Active subscriptions');
      expect(metricLabels).toContain('Pending accounts');
      expect(metricLabels).toContain('Expired plans');
    });

    it('renders Overview metrics and recent platform activity on Dashboard', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminDashboard />
        </MemoryRouter>
      );

      expect(html).toContain('Total businesses');
      expect(html).toContain('Active subscriptions');
      expect(html).toContain('Pending accounts');
      expect(html).toContain('Expired plans');
      expect(html).toContain('Recent Platform Activity');
    });
  });

  describe('4. Route Access Control Gating in AdminRoutes', () => {
    it('renders requested page when actor has required route permission', () => {
      const authorizedActor: AuthenticatedActor = {
        id: 'full-admin',
        fullName: 'Platform Super Admin',
        email: 'admin@tallybakery.app',
        designation: 'Super Admin',
        permissions: [PLATFORM_PERMISSIONS.BUSINESSES_VIEW],
      };

      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/businesses']}>
          <Routes>
            <Route path="/admin/*" element={<AdminRoutes actor={authorizedActor} />} />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain('Business Management');
      expect(html).not.toContain('Access Restricted');
    });

    it('renders access restricted notice when actor lacks required route permission', () => {
      const unauthorizedActor: AuthenticatedActor = {
        id: 'no-perm-admin',
        fullName: 'Restricted Staff',
        email: 'restricted@tallybakery.app',
        designation: 'Support',
        permissions: [PLATFORM_PERMISSIONS.DASHBOARD_VIEW], // missing platform.plans.view
      };

      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/plans']}>
          <Routes>
            <Route path="/admin/*" element={<AdminRoutes actor={unauthorizedActor} />} />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain('Access Restricted');
      expect(html).toContain('platform.plans.view');
      expect(html).toContain('Back to Dashboard');
    });
  });

  describe('5. Topbar Titles', () => {
    it('maps official module titles in ROUTE_TITLE_MAP', () => {
      expect(ROUTE_TITLE_MAP['/admin/dashboard']).toBe('Dashboard');
      expect(ROUTE_TITLE_MAP['/admin/businesses']).toBe('Businesses');
      expect(ROUTE_TITLE_MAP['/admin/client-admins']).toBe('Client Admin Accounts');
      expect(ROUTE_TITLE_MAP['/admin/plans']).toBe('Subscription Plans');
      expect(ROUTE_TITLE_MAP['/admin/subscriptions']).toBe('Subscriptions');
      expect(ROUTE_TITLE_MAP['/admin/audit']).toBe('Audit and Activity');
      expect(ROUTE_TITLE_MAP['/admin/settings']).toBe('Platform Settings');
    });
  });
});
