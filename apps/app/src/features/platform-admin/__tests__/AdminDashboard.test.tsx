/**
 * @file Unit and integration test suite for the Cadence Platform Admin Dashboard.
 * Enforces TDD verification for:
 * 1. Platform Overview Cards (Total Businesses, Active Subscriptions, Pending Accounts, Expired Plans)
 * 2. Revenue Overview (MRR, total revenue, trend charts, date range filtering, empty state)
 * 3. Business Growth Analytics (registration trends, weekly/monthly filter)
 * 4. Subscription Overview (distribution breakdown: active, pending, expired, cancelled)
 * 5. Recent Businesses Table (columns, links, empty state)
 * 6. Recent Platform Activity Feed (events, actors, related entities, timestamps)
 * 7. Quick Actions Panel (permission-based action gating)
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboard } from '../AdminDashboard';
import { PLATFORM_PERMISSIONS } from '../permissions';
import {
  MOCK_REVENUE_ANALYTICS,
  MOCK_SUBSCRIPTION_DISTRIBUTION,
  MOCK_TENANT_BUSINESSES,
  MOCK_PLATFORM_ACTIVITIES,
} from '../mock-data';
import type { AuthenticatedActor } from '../../../components/layout/types';

describe('Cadence Platform Admin Dashboard', () => {
  const fullSuperAdmin: AuthenticatedActor = {
    id: 'super-admin-full',
    fullName: 'Amara Okafor',
    email: 'admin@tallybakery.app',
    designation: 'Platform Super Admin',
    roleBadge: 'Super Admin',
    permissions: Object.values(PLATFORM_PERMISSIONS),
  };

  const restrictedAdmin: AuthenticatedActor = {
    id: 'restricted-admin',
    fullName: 'Support Rep',
    email: 'support@tallybakery.app',
    designation: 'Operations Support',
    permissions: [PLATFORM_PERMISSIONS.DASHBOARD_VIEW],
  };

  describe('1. Platform Overview Cards', () => {
    it('renders all four primary metric cards with values and labels', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={fullSuperAdmin} />
        </MemoryRouter>
      );

      expect(html).toContain('Total businesses');
      expect(html).toContain('Active subscriptions');
      expect(html).toContain('Pending accounts');
      expect(html).toContain('Expired plans');
      expect(html).toContain('48');
      expect(html).toContain('42');
    });

    it('renders links to management pages for authorized actors', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={fullSuperAdmin} />
        </MemoryRouter>
      );

      expect(html).toContain('href="/admin/businesses"');
      expect(html).toContain('href="/admin/subscriptions"');
    });

    it('does not render navigation links on metric cards for unauthorized actors', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={restrictedAdmin} />
        </MemoryRouter>
      );

      // restrictedAdmin lacks platform.businesses.view and platform.subscriptions.view
      expect(html).not.toContain('href="/admin/businesses"');
      expect(html).not.toContain('href="/admin/subscriptions"');
    });
  });

  describe('2. Revenue Overview Section', () => {
    it('displays total subscription revenue, MRR, and comparative change', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={fullSuperAdmin} />
        </MemoryRouter>
      );

      expect(html).toContain('Revenue Overview');
      expect(html).toContain(MOCK_REVENUE_ANALYTICS.totalRevenueFormatted);
      expect(html).toContain(MOCK_REVENUE_ANALYTICS.mrrFormatted);
      expect(html).toContain(MOCK_REVENUE_ANALYTICS.changePercentage);
    });

    it('renders date range filter selectors', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={fullSuperAdmin} />
        </MemoryRouter>
      );

      expect(html).toContain('30 Days');
      expect(html).toContain('90 Days');
      expect(html).toContain('12 Months');
      expect(html).toContain('YTD');
    });

    it('renders empty state when payment revenue records are absent', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard
            actor={fullSuperAdmin}
            revenueData={{
              totalRevenueFormatted: '₦0',
              mrrFormatted: '₦0',
              changePercentage: '0%',
              periodLabel: 'Last 30 days',
              trendPoints: [],
            }}
          />
        </MemoryRouter>
      );

      expect(html).toContain('No payment transactions recorded');
    });
  });

  describe('3. Business Growth Analytics', () => {
    it('renders growth chart header and weekly/monthly filtering controls', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={fullSuperAdmin} />
        </MemoryRouter>
      );

      expect(html).toContain('Business Growth');
      expect(html).toContain('Monthly');
      expect(html).toContain('Weekly');
      expect(html).toContain('New Registrations');
    });
  });

  describe('4. Subscription Overview & Distribution', () => {
    it('renders subscription distribution categories with counts and status tokens', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={fullSuperAdmin} />
        </MemoryRouter>
      );

      expect(html).toContain('Subscription Distribution');
      expect(html).toContain('Active');
      expect(html).toContain('Pending');
      expect(html).toContain('Expired');
      expect(html).toContain('Cancelled');
      expect(html).toContain(String(MOCK_SUBSCRIPTION_DISTRIBUTION.active));
      expect(html).toContain(String(MOCK_SUBSCRIPTION_DISTRIBUTION.pending));
    });

    it('links to subscriptions management page when actor has view permission', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={fullSuperAdmin} />
        </MemoryRouter>
      );

      expect(html).toContain('href="/admin/subscriptions"');
    });
  });

  describe('5. Recent Businesses Table', () => {
    it('renders business table headers and recent records', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={fullSuperAdmin} />
        </MemoryRouter>
      );

      expect(html).toContain('Recent Businesses');
      expect(html).toContain('Business');
      expect(html).toContain('Primary Admin');
      expect(html).toContain('Registered');
      expect(html).toContain('Plan');
      expect(html).toContain('Status');

      const firstBiz = MOCK_TENANT_BUSINESSES[0];
      if (firstBiz) {
        expect(html).toContain(firstBiz.name);
        expect(html).toContain(firstBiz.ownerName);
      }
    });

    it('displays empty state when no registered businesses exist', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={fullSuperAdmin} businesses={[]} />
        </MemoryRouter>
      );

      expect(html).toContain('No businesses registered yet');
    });
  });

  describe('6. Recent Platform Activity Feed', () => {
    it('renders activity items with description, actor, related entity, and timestamp', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={fullSuperAdmin} />
        </MemoryRouter>
      );

      expect(html).toContain('Recent Platform Activity');
      const firstActivity = MOCK_PLATFORM_ACTIVITIES[0];
      if (firstActivity) {
        expect(html).toContain(firstActivity.title);
        expect(html).toContain(firstActivity.timestamp);
      }
    });
  });

  describe('7. Quick Actions Panel', () => {
    it('renders permitted quick action buttons for Super Admin', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={fullSuperAdmin} />
        </MemoryRouter>
      );

      expect(html).toContain('Quick Actions');
      expect(html).toContain('View Businesses');
      expect(html).toContain('Manage Subscription Plans');
      expect(html).toContain('View Subscriptions');
      expect(html).toContain('Review Platform Activity');
    });

    it('omits unauthorized quick actions for restricted actors', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <AdminDashboard actor={restrictedAdmin} />
        </MemoryRouter>
      );

      // restrictedAdmin lacks platform.businesses.view, plans.manage, subscriptions.view, audit.view
      expect(html).not.toContain('Manage Subscription Plans');
      expect(html).not.toContain('Review Platform Activity');
    });
  });
});
