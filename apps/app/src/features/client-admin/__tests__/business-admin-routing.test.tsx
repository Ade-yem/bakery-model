/**
 * @file Integration tests for Client Admin Dashboard routing, layout rendering,
 * multi-tenant workspace context, and subscription feature gating.
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { BusinessAdminRoutes } from '../BusinessAdminRoutes';
import { TenantProvider, useTenant } from '../context/TenantContext';
import { getClientAdminNavGroups } from '../layout/nav-config';
import { MOCK_SUBSCRIPTION_GOLDEN_CRUST, MOCK_SUBSCRIPTION_IKEJA_ARTISAN } from '../data/mock-tenants';
import { CLIENT_PERMISSIONS } from '../permissions';

describe('Client Admin Dashboard Integration & Routing', () => {
  it('renders Business Admin Layout with active business brand mark and overview', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/business/dashboard']}>
        <BusinessAdminRoutes />
      </MemoryRouter>
    );

    // Business identity
    expect(html).toContain('Golden Crust Bakery Works');
    expect(html).toContain('TEN-001');

    // Layout navigation & topbar
    expect(html).toContain('CADENCE');
    expect(html).toContain('Client Admin');
    expect(html).toContain('Workspace:');
  });

  it('renders nested 404 within BusinessAdminLayout when navigating to an unknown workspace route', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/business/non-existent-module-route']}>
        <BusinessAdminRoutes />
      </MemoryRouter>
    );

    expect(html).toContain('Workspace Page Not Found');
    expect(html).toContain('Return to Business Overview');
    // Shell layout remains preserved
    expect(html).toContain('CADENCE');
    expect(html).toContain('Golden Crust Bakery Works');
  });

  it('dynamically hides Branches navigation for single-branch subscription plans', () => {
    // Multi-branch plan (Business tier)
    const multiBranchNav = getClientAdminNavGroups({
      subscription: MOCK_SUBSCRIPTION_GOLDEN_CRUST,
      permissions: Object.values(CLIENT_PERMISSIONS),
    });
    const multiBranchItem = multiBranchNav
      .flatMap((g) => g.items)
      .find((i) => i.path === '/business/branches');
    expect(multiBranchItem).toBeDefined();

    // Single-branch plan (Starter tier)
    const singleBranchNav = getClientAdminNavGroups({
      subscription: MOCK_SUBSCRIPTION_IKEJA_ARTISAN,
      permissions: Object.values(CLIENT_PERMISSIONS),
    });
    const singleBranchItem = singleBranchNav
      .flatMap((g) => g.items)
      .find((i) => i.path === '/business/branches');
    expect(singleBranchItem).toBeUndefined();
  });

  it('dynamically gates operational modules not included in subscription', () => {
    // Starter tier only includes 'sales' and 'orders'
    const starterNav = getClientAdminNavGroups({
      subscription: MOCK_SUBSCRIPTION_IKEJA_ARTISAN,
      permissions: Object.values(CLIENT_PERMISSIONS),
    });
    const opsGroup = starterNav.find((g) => g.groupTitle === 'Operations');
    expect(opsGroup).toBeDefined();

    const modulePaths = opsGroup?.items.map((i) => i.path) || [];
    expect(modulePaths).toContain('/business/operations/sales');
    expect(modulePaths).toContain('/business/operations/orders');
    expect(modulePaths).not.toContain('/business/operations/production');
    expect(modulePaths).not.toContain('/business/operations/procurement');
  });
});
