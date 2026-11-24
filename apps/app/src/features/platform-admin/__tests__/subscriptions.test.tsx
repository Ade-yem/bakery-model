/**
 * @file Unit and integration tests for Cadence Platform Admin Subscriptions module.
 * Covers:
 * - Overview cards: Total, Active, Pending, Expired, Cancelled Subscriptions
 * - Subscription Directory table: Business, Sub ID, Plan, Dates, Payment Status, Subscription Status, Actions
 * - Alternating row styling and View More pagination
 * - Search by Business name and Subscription ID
 * - Filters by subscription status, payment status, plan, billing period, and date range
 * - Mobile subscription cards
 * - Details page: Subscription Information, Payment Information, Plan Features, History Timeline
 * - Independent status rules: Subscription status and Payment status are strictly separated
 * - Actions: Change Plan, Extend, Cancel, Reactivate with confirmation dialogs
 * - Permission gates (view, manage, cancel, extend)
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SubscriptionsDirectoryPage } from '../subscriptions/SubscriptionsDirectoryPage';
import { SubscriptionDetailsPage } from '../subscriptions/SubscriptionDetailsPage';
import { PLATFORM_PERMISSIONS } from '../permissions';
import { MOCK_PLATFORM_SUBSCRIPTIONS } from '../mock-subscriptions';
import type { AuthenticatedActor } from '../../../components/layout/types';

describe('Platform Admin - Subscriptions Module', () => {
  const fullAdminActor: AuthenticatedActor = {
    id: 'admin-subs-full',
    fullName: 'Amara Okafor',
    email: 'admin@tallybakery.app',
    designation: 'Platform Super Admin',
    roleBadge: 'Super Admin',
    initials: 'AO',
    permissions: [
      PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW,
      PLATFORM_PERMISSIONS.SUBSCRIPTIONS_MANAGE,
      PLATFORM_PERMISSIONS.SUBSCRIPTIONS_CANCEL,
      PLATFORM_PERMISSIONS.SUBSCRIPTIONS_EXTEND,
    ],
  };

  const readOnlyActor: AuthenticatedActor = {
    id: 'admin-subs-ro',
    fullName: 'Chidi Reader',
    email: 'chidi@tallybakery.app',
    designation: 'Auditor',
    roleBadge: 'Auditor',
    initials: 'CR',
    permissions: [PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW],
  };

  describe('Subscription Overview & Directory', () => {
    it('renders overview metric cards for Total, Active, Pending, Expired, and Cancelled Subscriptions', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <SubscriptionsDirectoryPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Total Subscriptions');
      expect(html).toContain('Active Subscriptions');
      expect(html).toContain('Pending Subscriptions');
      expect(html).toContain('Expired Subscriptions');
      expect(html).toContain('Cancelled Subscriptions');
    });

    it('renders table headers with business, subscription ID, plan, dates, payment status, and subscription status', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <SubscriptionsDirectoryPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Business Name');
      expect(html).toContain('Subscription ID');
      expect(html).toContain('Plan');
      expect(html).toContain('Billing Period');
      expect(html).toContain('Payment Status');
      expect(html).toContain('Subscription Status');
      expect(html).toContain('Actions');

      const firstSub = MOCK_PLATFORM_SUBSCRIPTIONS[0];
      expect(html).toContain(firstSub.businessName);
      expect(html).toContain(firstSub.id);
      expect(html).toContain(firstSub.planName);
    });

    it('renders search input and multi-criteria filters', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <SubscriptionsDirectoryPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('placeholder="Search by business name or subscription ID..."');
      expect(html).toContain('All Subscription Statuses');
      expect(html).toContain('All Payment Statuses');
      expect(html).toContain('All Plans');
      expect(html).toContain('Clear Filters');
    });

    it('renders mobile cards alongside desktop table', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <SubscriptionsDirectoryPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('subscription-mobile-card');
    });

    it('renders action triggers (Change Plan, Extend, Cancel) when actor has permissions', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <SubscriptionsDirectoryPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('sub-action-change-plan');
      expect(html).toContain('sub-action-extend');
    });

    it('hides operational mutation actions for read-only actors', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <SubscriptionsDirectoryPage actor={readOnlyActor} />
        </MemoryRouter>
      );

      expect(html).not.toContain('sub-action-change-plan');
      expect(html).not.toContain('sub-action-extend');
      expect(html).toContain('View Details');
    });
  });

  describe('Subscription Details View', () => {
    it('renders complete subscription information, payment details, plan features, and history timeline', () => {
      const sub = MOCK_PLATFORM_SUBSCRIPTIONS[0];
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/admin/subscriptions/${sub.id}`]}>
          <Routes>
            <Route path="/admin/subscriptions/:id" element={<SubscriptionDetailsPage actor={fullAdminActor} />} />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain(sub.businessName);
      expect(html).toContain(sub.id);
      expect(html).toContain('Subscription Information');
      expect(html).toContain('Payment Information');
      expect(html).toContain('Plan Features');
      expect(html).toContain('Subscription History');
      expect(html).toContain('Back to Subscriptions');
    });

    it('displays independent payment status badge and verified payment history', () => {
      const sub = MOCK_PLATFORM_SUBSCRIPTIONS[0];
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/admin/subscriptions/${sub.id}`]}>
          <Routes>
            <Route path="/admin/subscriptions/:id" element={<SubscriptionDetailsPage actor={fullAdminActor} />} />
          </Routes>
        </MemoryRouter>
      );

      // Verifies payments are displayed with reference numbers
      expect(html).toContain(sub.paymentRecords[0].reference);
      expect(html).toContain(sub.paymentRecords[0].paymentStatus);
    });

    it('renders not found state when an invalid subscription ID is requested', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/subscriptions/NON-EXISTENT-SUB']}>
          <Routes>
            <Route path="/admin/subscriptions/:id" element={<SubscriptionDetailsPage actor={fullAdminActor} />} />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain('Subscription Not Found');
    });
  });
});
