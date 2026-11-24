/**
 * @file Unit and integration tests for the shared authenticated application layout system.
 * Enforces TDD discipline for shared sidebar, topbar, user dropdown, permission-based navigation,
 * and role-based layout integration.
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { filterNavGroupsByPermissions } from '../permission-filter';
import { UserAccountDropdown } from '../UserAccountDropdown';
import { AuthenticatedSidebar } from '../AuthenticatedSidebar';
import { AuthenticatedTopbar } from '../AuthenticatedTopbar';
import { AuthenticatedAppLayout } from '../AuthenticatedAppLayout';
import {
  PLATFORM_ADMIN_NAV_GROUPS,
  BUSINESS_OWNER_NAV_GROUPS,
} from '../role-nav-configs';
import { PLATFORM_PERMISSIONS } from '../../../features/platform-admin/permissions';
import {
  PlatformAdminLayout,
  BusinessOwnerLayout,
  ManagerLayout,
  StaffLayout,
} from '../role-layouts';
import type { AuthenticatedActor, LayoutNavGroup } from '../types';

describe('Shared Authenticated Application Layout System', () => {
  const mockSuperAdmin: AuthenticatedActor = {
    id: 'user-admin-1',
    fullName: 'Amara Okafor',
    email: 'amara.admin@tallybakery.app',
    designation: 'Platform Super Admin',
    roleBadge: 'Super Admin',
    initials: 'AO',
    permissions: Object.values(PLATFORM_PERMISSIONS),
  };

  const mockOwner: AuthenticatedActor = {
    id: 'user-owner-1',
    fullName: 'Babajide Adeleke',
    email: 'adeleke@grandflour.com',
    designation: 'Bakery Owner',
    roleBadge: 'Owner',
    initials: 'BA',
    tenantName: 'Grand Flourish Bakeries',
    permissions: [
      'owner:dashboard:view',
      'owner:branches:view',
      'owner:finances:view',
      'owner:staff:view',
      'owner:inventory:view',
      'owner:reports:view',
      'owner:settings:view',
    ],
  };

  const mockManager: AuthenticatedActor = {
    id: 'user-mgr-1',
    fullName: 'Chioma Nwosu',
    email: 'chioma.mgr@grandflour.com',
    designation: 'Branch Manager',
    roleBadge: 'Manager',
    initials: 'CN',
    tenantName: 'Grand Flourish Bakeries',
    branchName: 'Ikeja Branch',
    permissions: [
      'manager:dashboard:view',
      'manager:shifts:view',
      'manager:production:view',
      'manager:reception:view',
      'manager:inventory:view',
      'manager:staff:view',
    ],
  };

  const mockStaff: AuthenticatedActor = {
    id: 'user-staff-1',
    fullName: 'Danladi Bello',
    email: 'danladi@grandflour.com',
    designation: 'Production Supervisor',
    roleBadge: 'Staff',
    initials: 'DB',
    tenantName: 'Grand Flourish Bakeries',
    branchName: 'Ikeja Branch',
    permissions: [
      'staff:dashboard:view',
      'production:view',
      'records:view',
      'history:view',
      'schedule:view',
    ],
  };

  describe('1. Permission-Based Navigation Filter (permission-filter)', () => {
    const testGroups: LayoutNavGroup[] = [
      {
        groupTitle: 'General',
        items: [
          { label: 'Overview', path: '/overview', icon: 'LayoutDashboard' },
          {
            label: 'Financials',
            path: '/finances',
            icon: 'CreditCard',
            requiredPermissions: ['finances:view'],
          },
        ],
      },
      {
        groupTitle: 'Executive Only',
        requiredPermissions: ['executive:view'],
        items: [
          {
            label: 'Audit Trail',
            path: '/audit',
            icon: 'Shield',
            requiredPermissions: ['audit:view'],
          },
        ],
      },
      {
        groupTitle: 'Restricted Section',
        items: [
          {
            label: 'Super Secret',
            path: '/secret',
            icon: 'Lock',
            requiredPermissions: ['secret:access'],
          },
        ],
      },
    ];

    it('retains public/unrestricted items and permitted items', () => {
      const result = filterNavGroupsByPermissions(testGroups, ['finances:view']);
      expect(result).toHaveLength(1);
      expect(result[0].groupTitle).toBe('General');
      expect(result[0].items.map((i) => i.label)).toEqual(['Overview', 'Financials']);
    });

    it('filters out items whose required permissions are missing', () => {
      const result = filterNavGroupsByPermissions(testGroups, []);
      expect(result).toHaveLength(1);
      expect(result[0].groupTitle).toBe('General');
      expect(result[0].items.map((i) => i.label)).toEqual(['Overview']);
    });

    it('hides empty navigation groups completely when no items are authorized', () => {
      const result = filterNavGroupsByPermissions(testGroups, []);
      const titles = result.map((g) => g.groupTitle);
      expect(titles).not.toContain('Restricted Section');
      expect(titles).not.toContain('Executive Only');
    });

    it('hides a group if the group-level required permission is missing', () => {
      const result = filterNavGroupsByPermissions(testGroups, ['audit:view']);
      // 'Executive Only' requires ['executive:view'], so even if item has 'audit:view', group is hidden
      const titles = result.map((g) => g.groupTitle);
      expect(titles).not.toContain('Executive Only');
    });

    it('does not mutate input navigation groups or items', () => {
      const originalCount = testGroups.length;
      const copy = JSON.parse(JSON.stringify(testGroups));
      filterNavGroupsByPermissions(testGroups, ['finances:view']);
      expect(testGroups.length).toBe(originalCount);
      expect(testGroups).toEqual(copy);
    });
  });

  describe('2. User Account Dropdown (UserAccountDropdown)', () => {
    it('renders actor trigger with avatar initials, full name, and designation', () => {
      const html = renderToStaticMarkup(
        <UserAccountDropdown
          actor={mockSuperAdmin}
          onSignOut={() => {}}
        />
      );
      expect(html).toContain('Amara Okafor');
      expect(html).toContain('Platform Super Admin');
      expect(html).toContain('AO');
    });

    it('includes role badge and profile/sign-out menu attributes', () => {
      const html = renderToStaticMarkup(
        <UserAccountDropdown
          actor={mockOwner}
          onSignOut={() => {}}
          isOpen={true}
        />
      );
      expect(html).toContain('adeleke@grandflour.com');
      expect(html).toContain('Grand Flourish Bakeries');
      expect(html).toContain('Profile Details');
      expect(html).toContain('Sign Out');
    });
  });

  describe('3. Shared Collapsible Sidebar (AuthenticatedSidebar)', () => {
    it('renders brand mark, subtitle, and dynamic permitted links', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthenticatedSidebar
            actor={mockSuperAdmin}
            groups={PLATFORM_ADMIN_NAV_GROUPS}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            brandTitle="TALLYBAKERY"
            brandSubtitle="Platform Admin"
          />
        </MemoryRouter>
      );
      expect(html).toContain('TALLY');
      expect(html).toContain('BAKERY');
      expect(html).toContain('Platform Admin');
      expect(html).toContain('Dashboard');
      expect(html).toContain('Businesses');
      expect(html).toContain('Subscriptions');
    });

    it('applies collapsed rail styling and tooltips in collapsed mode', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthenticatedSidebar
            actor={mockSuperAdmin}
            groups={PLATFORM_ADMIN_NAV_GROUPS}
            isCollapsed={true}
            onToggleCollapse={() => {}}
            brandTitle="TALLYBAKERY"
          />
        </MemoryRouter>
      );
      expect(html).toContain('w-16');
      expect(html).toContain('title="Dashboard"');
    });

    it('hides unauthorized links dynamically based on actor permissions', () => {
      const restrictedActor: AuthenticatedActor = {
        ...mockOwner,
        permissions: ['owner:dashboard:view'], // missing finances, staff, settings
      };
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/owner/dashboard']}>
          <AuthenticatedSidebar
            actor={restrictedActor}
            groups={BUSINESS_OWNER_NAV_GROUPS}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </MemoryRouter>
      );
      expect(html).toContain('Dashboard');
      expect(html).not.toContain('Financials');
      expect(html).not.toContain('Staff &amp; Payroll');
    });

    it('renders dedicated mobile drawer with both icons and labels even when desktop is collapsed', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthenticatedSidebar
            actor={mockSuperAdmin}
            groups={PLATFORM_ADMIN_NAV_GROUPS}
            isCollapsed={true}
            onToggleCollapse={() => {}}
            mobileOpen={true}
            onCloseMobile={() => {}}
          />
        </MemoryRouter>
      );
      // Desktop aside is w-16
      expect(html).toContain('w-16');
      // Mobile drawer backdrop exists
      expect(html).toContain('aria-label="Close navigation"');
      // Mobile drawer explicitly displays navigation labels
      expect(html).toContain('Dashboard');
      expect(html).toContain('Businesses');
      expect(html).toContain('Subscriptions');
    });

    it('renders mobile backdrop overlay with dismissal hook', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthenticatedSidebar
            actor={mockSuperAdmin}
            groups={PLATFORM_ADMIN_NAV_GROUPS}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            mobileOpen={true}
            onCloseMobile={() => {}}
          />
        </MemoryRouter>
      );
      expect(html).toContain('fixed inset-0');
      expect(html).toContain('bg-[#10201F]/40');
    });
  });

  describe('4. Shared Topbar (AuthenticatedTopbar)', () => {
    it('renders page title, mobile toggle, and user account dropdown', () => {
      const html = renderToStaticMarkup(
        <AuthenticatedTopbar
          actor={mockManager}
          title="Shift Operations"
          onToggleMobileSidebar={() => {}}
          onSignOut={() => {}}
        />
      );
      expect(html).toContain('Shift Operations');
      expect(html).toContain('Chioma Nwosu');
      expect(html).toContain('Branch Manager');
      expect(html).toContain('aria-label="Open sidebar menu"');
    });

    it('renders optional topbar action slot', () => {
      const html = renderToStaticMarkup(
        <AuthenticatedTopbar
          actor={mockManager}
          title="Shift Operations"
          onToggleMobileSidebar={() => {}}
          onSignOut={() => {}}
          actions={<div data-testid="test-action">Live Gateway Pill</div>}
        />
      );
      expect(html).toContain('Live Gateway Pill');
    });
  });

  describe('5. Shared AuthenticatedAppLayout', () => {
    it('composes shared sidebar and topbar around content frame', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthenticatedAppLayout
            actor={mockSuperAdmin}
            navGroups={PLATFORM_ADMIN_NAV_GROUPS}
            title="Platform Dashboard"
            brandSubtitle="Platform Admin"
          >
            <div data-testid="dashboard-content">Core Admin Analytics</div>
          </AuthenticatedAppLayout>
        </MemoryRouter>
      );
      expect(html).toContain('Core Admin Analytics');
      expect(html).toContain('Platform Dashboard');
      expect(html).toContain('Amara Okafor');
      expect(html).toContain('Platform Super Admin');
    });
  });

  describe('6. Role-Based Layout Integration', () => {
    it('PlatformAdminLayout inherits shared layout with admin actor and nav', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <PlatformAdminLayout actor={mockSuperAdmin}>
            <div>Admin Module Content</div>
          </PlatformAdminLayout>
        </MemoryRouter>
      );
      expect(html).toContain('Admin Module Content');
      expect(html).toContain('Platform Admin');
      expect(html).toContain('Amara Okafor');
      expect(html).toContain('Businesses');
      expect(html).toContain('Subscriptions');
    });

    it('BusinessOwnerLayout inherits shared layout with owner actor and nav', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/owner/dashboard']}>
          <BusinessOwnerLayout actor={mockOwner}>
            <div>Owner Module Content</div>
          </BusinessOwnerLayout>
        </MemoryRouter>
      );
      expect(html).toContain('Owner Module Content');
      expect(html).toContain('Babajide Adeleke');
      expect(html).toContain('Bakery Owner');
      expect(html).toContain('Grand Flourish Bakeries');
    });

    it('ManagerLayout inherits shared layout with manager actor and nav', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/manager/dashboard']}>
          <ManagerLayout actor={mockManager}>
            <div>Manager Module Content</div>
          </ManagerLayout>
        </MemoryRouter>
      );
      expect(html).toContain('Manager Module Content');
      expect(html).toContain('Chioma Nwosu');
      expect(html).toContain('Branch Manager');
      expect(html).toContain('Ikeja Branch');
    });

    it('StaffLayout inherits shared layout with staff actor and nav', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/workspace']}>
          <StaffLayout actor={mockStaff}>
            <div>Staff Workspace Content</div>
          </StaffLayout>
        </MemoryRouter>
      );
      expect(html).toContain('Staff Workspace Content');
      expect(html).toContain('Danladi Bello');
      expect(html).toContain('Production Supervisor');
      expect(html).toContain('Department Tasks');
    });
  });
});
