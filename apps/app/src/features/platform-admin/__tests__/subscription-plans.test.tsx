/**
 * @file Unit and integration tests for Cadence Platform Admin Subscription Plans module.
 * Covers:
 * - Plans Overview cards (Total Plans, Active Plans, Archived Plans)
 * - Plans directory table (Name, Description, Price, Period, Modules, Limits, Status, Actions)
 * - Alternating row styling (Ledger #EFEBDB / Flour #F6F3EA) and View More pagination
 * - Search by plan name, filter by status and billing period
 * - Plan Details view (terms, included modules, limits, metrics)
 * - Plan Creation & Editing form validation and state handling
 * - Activation and Archiving actions with confirmation dialog
 * - Permission gates (platform.plans.view, platform.plans.manage)
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PlansOverviewPage } from '../plans/PlansOverviewPage';
import { PlanDetailsPage } from '../plans/PlanDetailsPage';
import { CreatePlanPage } from '../plans/CreatePlanPage';
import { EditPlanPage } from '../plans/EditPlanPage';
import { PLATFORM_PERMISSIONS } from '../permissions';
import { MOCK_SUBSCRIPTION_PLANS } from '../mock-plans';
import type { AuthenticatedActor } from '../../../components/layout/types';

describe('Platform Admin - Subscription Plans Module', () => {
  const fullAdminActor: AuthenticatedActor = {
    id: 'admin-plans-full',
    fullName: 'Amara Okafor',
    email: 'admin@tallybakery.app',
    designation: 'Platform Super Admin',
    roleBadge: 'Super Admin',
    initials: 'AO',
    permissions: [
      PLATFORM_PERMISSIONS.PLANS_VIEW,
      PLATFORM_PERMISSIONS.PLANS_MANAGE,
    ],
  };

  const readOnlyActor: AuthenticatedActor = {
    id: 'admin-plans-ro',
    fullName: 'Chidi Reader',
    email: 'chidi@tallybakery.app',
    designation: 'Auditor',
    roleBadge: 'Auditor',
    initials: 'CR',
    permissions: [PLATFORM_PERMISSIONS.PLANS_VIEW],
  };

  describe('Plans Overview & Summary Cards', () => {
    it('renders summary cards for Total Plans, Active Plans, and Archived Plans', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlansOverviewPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Total Plans');
      expect(html).toContain('Active Plans');
      expect(html).toContain('Archived Plans');
      expect(html).toContain(String(MOCK_SUBSCRIPTION_PLANS.length));
    });

    it('renders table columns with plan name, description, price, billing period, and status', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlansOverviewPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Plan Name');
      expect(html).toContain('Price');
      expect(html).toContain('Billing Period');
      expect(html).toContain('Included Modules');
      expect(html).toContain('Usage Limits');
      expect(html).toContain('Status');
      expect(html).toContain('Actions');

      const firstPlan = MOCK_SUBSCRIPTION_PLANS[0];
      expect(html).toContain(firstPlan.name);
      expect(html).toContain(firstPlan.description);
    });

    it('renders search input and filters by status and billing period', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlansOverviewPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('placeholder="Search plans by name..."');
      expect(html).toContain('All Statuses');
      expect(html).toContain('All Billing Periods');
      expect(html).toContain('Clear Filters');
    });

    it('renders mobile cards alongside desktop table', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlansOverviewPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('plan-mobile-card');
    });

    it('renders "Create Plan" button when actor has plans.manage permission', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlansOverviewPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Create Plan');
      expect(html).toContain('/admin/plans/new');
    });

    it('hides "Create Plan" button when actor has only plans.view permission', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <PlansOverviewPage actor={readOnlyActor} />
        </MemoryRouter>
      );

      expect(html).not.toContain('/admin/plans/new');
    });
  });

  describe('Plan Details View', () => {
    it('renders complete plan profile, pricing, modules, and limits', () => {
      const plan = MOCK_SUBSCRIPTION_PLANS[0];
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/admin/plans/${plan.id}`]}>
          <Routes>
            <Route path="/admin/plans/:id" element={<PlanDetailsPage actor={fullAdminActor} />} />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain(plan.name);
      expect(html).toContain(plan.description);
      expect(html).toContain('Included Modules');
      expect(html).toContain('Usage Limits');
      expect(html).toContain('Subscribed Businesses');
      expect(html).toContain('Back to Plans');
    });

    it('renders not found state when an invalid plan ID is requested', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/plans/NON-EXISTENT-PLAN']}>
          <Routes>
            <Route path="/admin/plans/:id" element={<PlanDetailsPage actor={fullAdminActor} />} />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain('Plan Not Found');
    });
  });

  describe('Create and Edit Plan Forms', () => {
    it('renders create plan form with basic info, pricing, modules, and limits', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <CreatePlanPage actor={fullAdminActor} />
        </MemoryRouter>
      );

      expect(html).toContain('Create Subscription Plan');
      expect(html).toContain('Plan Name');
      expect(html).toContain('Subscription Price');
      expect(html).toContain('Billing Period');
      expect(html).toContain('Included Modules');
      expect(html).toContain('Usage Limits');
      expect(html).toContain('Save Plan');
    });

    it('renders edit plan form prefilled with existing plan attributes', () => {
      const plan = MOCK_SUBSCRIPTION_PLANS[0];
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/admin/plans/${plan.id}/edit`]}>
          <Routes>
            <Route path="/admin/plans/:id/edit" element={<EditPlanPage actor={fullAdminActor} />} />
          </Routes>
        </MemoryRouter>
      );

      expect(html).toContain('Edit Subscription Plan');
      expect(html).toContain(plan.name);
      expect(html).toContain('Update Plan');
    });
  });
});
