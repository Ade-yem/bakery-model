/**
 * @file Integration tests for application routing, error boundary encapsulation,
 * route skeleton display for lazy loading, 404 catch-all, and Platform Admin nested 404 handling.
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../AppRoutes';
import { AdminRoutes } from '../features/platform-admin/AdminRoutes';

describe('4. Application Routing Integration', () => {
  it('displays route skeleton fallback when resolving lazy-loaded routes (/login, /register)', () => {
    const htmlLogin = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Initial render of lazy-loaded route triggers Suspense fallback
    expect(htmlLogin).toContain('role="status"');
    expect(htmlLogin).toContain('Loading page content...');
    expect(htmlLogin).toContain('data-skeleton-variant="general"');

    const htmlRegister = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/register']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(htmlRegister).toContain('role="status"');
    expect(htmlRegister).toContain('Loading page content...');
  });

  it('renders custom 404 page when navigating to an unknown top-level route', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/unknown-random-page']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(html).toContain('404');
    expect(html).toContain('Page not found');
    expect(html).toContain("The page you&#x27;re looking for doesn&#x27;t exist or has been moved.");
    expect(html).toContain('Back to Home');
    expect(html).toContain('Go Back');
  });

  it('renders 404 page within Platform Admin layout when accessing an unknown admin sub-route', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/admin/non-existent-admin-page']}>
        <AdminRoutes />
      </MemoryRouter>
    );

    // Verifies the 404 page is rendered
    expect(html).toContain('404');
    expect(html).toContain('Page not found');
    expect(html).toContain('Back to Admin Dashboard');

    // Verifies the surrounding Admin layout (sidebar and topbar) is preserved
    expect(html).toContain('Platform Admin');
    expect(html).toContain('Platform Healthy');
  });

  it('renders route skeleton preview showcase at /dev/skeletons', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/dev/skeletons']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(html).toContain('Route Loading Skeletons Preview');
    expect(html).toContain('data-skeleton-variant="dashboard"');
  });
});
