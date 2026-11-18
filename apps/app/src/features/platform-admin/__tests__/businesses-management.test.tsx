/**
 * @file Unit and integration tests for Cadence Platform Admin Businesses Management.
 * Covers:
 * - Module 1: Businesses Overview metric cards (Total, Active, Pending, Suspended)
 * - Business Directory data table and columns
 * - Search by business name, email, or ID
 * - Filters by account status, subscription plan, and registration date
 * - Clear filters action
 * - Business account status change (Activate / Suspend) with confirmation dialog
 * - Business Details page with profile, contact, subscription, admin, and platform activity
 * - Permission gates (platform.businesses.view, platform.businesses.manage)
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BusinessesManagementPage } from '../businesses/BusinessesManagementPage';
import { BusinessDetailsPage } from '../businesses/BusinessDetailsPage';
import { PLATFORM_PERMISSIONS } from '../permissions';
import { MOCK_PLATFORM_BUSINESSES } from '../mock-data';
import type { AuthenticatedActor } from '../../../components/layout/types';

describe('Platform Admin - Businesses Management Module', () => {
  const fullAdminActor: AuthenticatedActor = {
    id: 'admin-full',
    fullName: 'Amara Okafor',
    email: 'admin@tallybakery.app',
    designation: 'Super Admin',
    roleBadge: 'Super Admin',
    initials: 'AO',
    permissions: [
      PLATFORM_PERMISSIONS.BUSINESSES_VIEW,
      PLATFORM_PERMISSIONS.BUSINESSES_MANAGE,
    ],
  };

  const readOnlyActor: AuthenticatedActor = {
    id: 'admin-readonly',
    fullName: 'Chidi Reader',
    email: 'chidi@tallybakery.app',
    designation: 'Platform Auditor',
    roleBadge: 'Auditor',
    initials: 'CR',
    permissions: [PLATFORM_PERMISSIONS.BUSINESSES_VIEW],
  };

  describe('Businesses Directory Overview Cards', () => {
    it('renders metric cards for total, active, pending, and suspended businesses', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BusinessesManagementPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Total Businesses');
      expect(html).toContain('Active Businesses');
      expect(html).toContain('Pending Accounts');
      expect(html).toContain('Suspended Accounts');
    });

    it('displays computed summary numbers corresponding to mock businesses', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BusinessesManagementPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      // Should display accurate counts
      const total = MOCK_PLATFORM_BUSINESSES.length;
      expect(html).toContain(String(total));
    });
  });

  describe('Business Directory Table & Data Presentation', () => {
    it('renders required table headers according to specification', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BusinessesManagementPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Business Name');
      expect(html).toContain('Business Email');
      expect(html).toContain('Primary Admin');
      expect(html).toContain('Plan');
      expect(html).toContain('Registration Date');
      expect(html).toContain('Account Status');
      expect(html).toContain('Actions');
    });

    it('renders business row details including name, email, plan, and status badges', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BusinessesManagementPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      const firstBiz = MOCK_PLATFORM_BUSINESSES[0];
      expect(html).toContain(firstBiz.name);
      expect(html).toContain(firstBiz.email);
      expect(html).toContain(firstBiz.primaryAdminName);
      expect(html).toContain(firstBiz.plan);
    });

    it('provides links or buttons to view business details', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BusinessesManagementPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('View Details');
      expect(html).toContain(`/admin/businesses/${MOCK_PLATFORM_BUSINESSES[0].id}`);
    });

    it('renders responsive mobile business cards with actions and details', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BusinessesManagementPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      // Verify mobile business card elements exist
      expect(html).toContain('business-mobile-card');
      expect(html).toContain('View Details');
    });
  });

  describe('Search & Filter Controls', () => {
    it('renders search input for business name, email, or ID', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BusinessesManagementPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('placeholder="Search by name, email, or ID..."');
    });

    it('renders status, plan, and registration date filter dropdowns', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BusinessesManagementPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('All Statuses');
      expect(html).toContain('All Plans');
      expect(html).toContain('All Time');
    });

    it('renders clear filters button', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BusinessesManagementPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Clear Filters');
    });
  });

  describe('Business Actions & Permission Gates', () => {
    it('shows status action triggers (Activate / Suspend) when actor has manage permission', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BusinessesManagementPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toMatch(/Suspend|Activate/);
    });

    it('hides or disables status changing actions when actor has only view permission', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BusinessesManagementPage actor={readOnlyActor} />
        </MemoryRouter>
      );

      // View details must still exist
      expect(html).toContain('View Details');
      // Status alteration controls should not be clickable or present for read-only actors
      expect(html).not.toContain('action-status-trigger');
    });
  });

  describe('Business Details Page', () => {
    it('renders complete business profile, contact, and registration details', () => {
      const targetBiz = MOCK_PLATFORM_BUSINESSES[0];
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/admin/businesses/${targetBiz.id}`]}>
          <Routes>
            <Route
              path="/admin/businesses/:id"
              element={<BusinessDetailsPage actor={fullAdminActor} />}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain(targetBiz.name);
      expect(html).toContain(targetBiz.id);
      expect(html).toContain(targetBiz.email);
      expect(html).toContain(targetBiz.phone);
      expect(html).toContain('Registration Details');
      expect(html).toContain('Primary Administrator');
      expect(html).toContain(targetBiz.primaryAdminName);
      expect(html).toContain(targetBiz.primaryAdminEmail);
    });

    it('renders subscription information, dates, and status', () => {
      const targetBiz = MOCK_PLATFORM_BUSINESSES[0];
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/admin/businesses/${targetBiz.id}`]}>
          <Routes>
            <Route
              path="/admin/businesses/:id"
              element={<BusinessDetailsPage actor={fullAdminActor} />}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain('Subscription Details');
      expect(html).toContain(targetBiz.plan);
      expect(html).toContain(targetBiz.subscriptionStartDate);
      expect(html).toContain(targetBiz.subscriptionExpiryDate);
    });

    it('renders relevant platform activity log for the business', () => {
      const targetBiz = MOCK_PLATFORM_BUSINESSES[0];
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/admin/businesses/${targetBiz.id}`]}>
          <Routes>
            <Route
              path="/admin/businesses/:id"
              element={<BusinessDetailsPage actor={fullAdminActor} />}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain('Platform Activity History');
    });

    it('renders breadcrumb link back to businesses directory', () => {
      const targetBiz = MOCK_PLATFORM_BUSINESSES[0];
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/admin/businesses/${targetBiz.id}`]}>
          <Routes>
            <Route
              path="/admin/businesses/:id"
              element={<BusinessDetailsPage actor={fullAdminActor} />}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain('Back to Businesses');
      expect(html).toContain('/admin/businesses');
    });

    it('renders not found state when an invalid business ID is requested', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/businesses/NON-EXISTENT-ID']}>
          <Routes>
            <Route
              path="/admin/businesses/:id"
              element={<BusinessDetailsPage actor={fullAdminActor} />}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain('Business Not Found');
    });
  });
});
