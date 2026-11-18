/**
 * @file Unit and accessibility tests for the Platform Admin interface and layout.
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from '../AdminLayout';
import { AdminSidebar } from '../AdminSidebar';
import { AdminTopbar } from '../AdminTopbar';
import { AdminPageHeader } from '../AdminPageHeader';
import { AdminDashboard } from '../AdminDashboard';
import { AdminPlaceholderPage } from '../AdminPlaceholderPage';
import { AdminRoutes } from '../AdminRoutes';
import { MOCK_PLATFORM_METRICS, MOCK_TENANT_BUSINESSES } from '../mock-data';

describe('TallyBakery Platform Admin Interface', () => {
  describe('AdminSidebar Component', () => {
    it('renders grouped navigation sections', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminSidebar isCollapsed={false} onToggle={() => {}} />
        </MemoryRouter>
      );
      expect(html).toContain('Overview');
      expect(html).toContain('Platform Management');
      expect(html).toContain('Billing Management');
      expect(html).toContain('System');
    });

    it('renders all official platform admin navigation links', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminSidebar isCollapsed={false} onToggle={() => {}} />
        </MemoryRouter>
      );
      expect(html).toContain('Dashboard');
      expect(html).toContain('Businesses');
      expect(html).toContain('Subscription Plans');
      expect(html).toContain('Subscriptions');
      expect(html).toContain('Client Admin Accounts');
      expect(html).toContain('Platform Settings');
      expect(html).toContain('Audit and Activity');
    });

    it('renders badges for business management item', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminSidebar isCollapsed={false} onToggle={() => {}} />
        </MemoryRouter>
      );
      expect(html).toContain('48');
    });

    it('renders brand mark and Platform Admin badge', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminSidebar isCollapsed={false} onToggle={() => {}} />
        </MemoryRouter>
      );
      expect(html).toContain('CADENCE');
      expect(html).toContain('PLATFORM');
      expect(html).toContain('Platform Admin');
    });
  });

  describe('AdminTopbar Component', () => {
    it('renders page title, health indicator and admin profile', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminTopbar onToggleSidebar={() => {}} />
        </MemoryRouter>
      );
      expect(html).toContain('Dashboard');
      expect(html).toContain('Platform Healthy');
      expect(html).toContain('Super Admin');
      expect(html).toContain('SA');
    });

    it('renders notifications button with unread count', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminTopbar onToggleSidebar={() => {}} />
        </MemoryRouter>
      );
      expect(html).toContain('aria-label="View notifications"');
    });
  });

  describe('AdminPageHeader Component', () => {
    it('renders title, description and optional action slot', () => {
      const html = renderToStaticMarkup(
        <AdminPageHeader
          title="Tenant Bakeries"
          description="Manage commercial bakeries and subscription accounts."
          action={<button type="button">Add Bakery</button>}
        />
      );
      expect(html).toContain('Tenant Bakeries');
      expect(html).toContain('Manage commercial bakeries and subscription accounts.');
      expect(html).toContain('Add Bakery');
    });
  });

  describe('AdminDashboard Component', () => {
    it('renders 4 platform metric KPI cards', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminDashboard />
        </MemoryRouter>
      );
      for (const metric of MOCK_PLATFORM_METRICS) {
        expect(html).toContain(metric.label);
        expect(html).toContain(metric.value);
      }
    });

    it('renders recent tenant businesses table with bakery names and plan tags', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminDashboard />
        </MemoryRouter>
      );
      for (const biz of MOCK_TENANT_BUSINESSES.slice(0, 3)) {
        expect(html).toContain(biz.name);
        expect(html).toContain(biz.plan);
      }
    });

    it('renders platform operational activities', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminDashboard />
        </MemoryRouter>
      );
      expect(html).toContain('Recent Platform Activity');
      expect(html).toContain('New business registered');
    });
  });

  describe('AdminLayout & Placeholder Pages', () => {
    it('renders AdminLayout container wrapping page content', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminLayout>
            <div data-testid="test-content">Dashboard Content</div>
          </AdminLayout>
        </MemoryRouter>
      );
      expect(html).toContain('Dashboard Content');
      expect(html).toContain('Platform Admin');
    });

    it('renders AdminPlaceholderPage with correct title and navigation breadcrumb', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/businesses']}>
          <AdminPlaceholderPage
            title="Businesses"
            description="Manage all registered bakery companies on TallyBakery."
          />
        </MemoryRouter>
      );
      expect(html).toContain('Businesses');
      expect(html).toContain('Manage all registered bakery companies on TallyBakery.');
      expect(html).toContain('Module In Development');
    });

    it('renders AdminRoutes and resolves dashboard route without authentication barrier', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </MemoryRouter>
      );
      expect(html).toContain('Dashboard');
      expect(html).toContain('Total businesses');
    });

    it('renders AdminRoutes placeholder views for sub-routes without authentication barrier', () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/admin/transactions']}>
          <Routes>
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </MemoryRouter>
      );
      expect(html).toContain('Transactions');
      expect(html).toContain('Module In Development');
    });
  });
});
