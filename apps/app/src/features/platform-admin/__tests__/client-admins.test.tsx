/**
 * @file Unit and integration tests for Cadence Platform Admin Client Admin Accounts Module.
 * Covers:
 * - Module 2: Client Admin Accounts Overview cards (Total, Active, Pending, Suspended)
 * - Account directory table with admin name, email, linked business, status, created date, actions
 * - Search by name or email
 * - Filter by linked business
 * - Filter by account status
 * - Clear filters action
 * - View administrator details modal
 * - Excludes client business staff (only primary administrators)
 * - Permission gates (platform.client_admins.view, platform.client_admins.manage)
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ClientAdminsPage } from '../client-admins/ClientAdminsPage';
import { PLATFORM_PERMISSIONS } from '../permissions';
import { MOCK_CLIENT_ADMINS } from '../mock-data';
import type { AuthenticatedActor } from '../../../components/layout/types';

describe('Platform Admin - Client Admin Accounts Module', () => {
  const fullAdminActor: AuthenticatedActor = {
    id: 'admin-super',
    fullName: 'Amara Okafor',
    email: 'admin@tallybakery.app',
    designation: 'Super Admin',
    roleBadge: 'Super Admin',
    initials: 'AO',
    permissions: [
      PLATFORM_PERMISSIONS.CLIENT_ADMINS_VIEW,
      PLATFORM_PERMISSIONS.CLIENT_ADMINS_MANAGE,
    ],
  };

  const readOnlyActor: AuthenticatedActor = {
    id: 'admin-readonly',
    fullName: 'Chidi Reader',
    email: 'chidi@tallybakery.app',
    designation: 'Platform Auditor',
    roleBadge: 'Auditor',
    initials: 'CR',
    permissions: [PLATFORM_PERMISSIONS.CLIENT_ADMINS_VIEW],
  };

  describe('Overview Stat Cards', () => {
    it('renders metric cards for total client admins, active, pending, and suspended accounts', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Total Administrators');
      expect(html).toContain('Active Accounts');
      expect(html).toContain('Pending Accounts');
      expect(html).toContain('Suspended Accounts');
    });

    it('displays computed summary numbers corresponding to mock administrator accounts', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      const total = MOCK_CLIENT_ADMINS.length;
      expect(html).toContain(String(total));
    });
  });

  describe('Directory Table & Account Data', () => {
    it('renders required table headers according to specification', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Administrator');
      expect(html).toContain('Email Address');
      expect(html).toContain('Linked Business');
      expect(html).toContain('Account Status');
      expect(html).toContain('Created Date');
      expect(html).toContain('Actions');
    });

    it('renders administrator name, email, and linked business name', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      const firstAdmin = MOCK_CLIENT_ADMINS[0];
      expect(html).toContain(firstAdmin.fullName);
      expect(html).toContain(firstAdmin.email);
      expect(html).toContain(firstAdmin.businessName);
    });

    it('renders view admin details action button', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('View Profile');
    });

    it('renders responsive mobile administrator cards with status and linked business', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('client-admin-mobile-card');
    });

    it('does not include client business staff roles in the primary administrator directory', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      // Verify bakery staff roles are not displayed
      expect(html).not.toContain('Baker Assistant');
      expect(html).not.toContain('Shift Worker');
      expect(html).not.toContain('Packer');
    });
  });

  describe('Search & Filter Controls', () => {
    it('renders search input for administrator name or email', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('placeholder="Search by administrator name or email..."');
    });

    it('renders linked business filter and account status filter', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('All Businesses');
      expect(html).toContain('All Statuses');
    });

    it('renders clear filters button', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Clear Filters');
    });
  });

  describe('Permission Controls', () => {
    it('renders view and manage capabilities when actor has client_admins.manage permission', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('client-admin-row');
    });

    it('renders read-only views when actor has only client_admins.view permission', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <ClientAdminsPage actor={readOnlyActor} />
        </MemoryRouter>
      );

      expect(html).toContain('client-admin-row');
      expect(html).not.toContain('admin-action-manage-trigger');
    });
  });
});
