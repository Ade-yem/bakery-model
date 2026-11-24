/**
 * @file Unit tests for the custom 404 Not Found page component.
 * Verifies 404 typography, required text, home and back actions,
 * TallyBakery design tokens, and nested admin layout adaptations.
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from '../NotFound';

describe('2. Custom 404 Not Found Page (NotFound)', () => {
  it('renders prominent 404 badge, heading, and exact descriptive copy', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(html).toContain('404');
    expect(html).toContain('Page not found');
    expect(html).toContain("The page you&#x27;re looking for doesn&#x27;t exist or has been moved.");
  });

  it('renders Back to Home button with default root path', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(html).toContain('Back to Home');
    expect(html).toContain('href="/"');
  });

  it('renders accessible Go Back navigation action', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(html).toContain('Go Back');
    expect(html).toContain('type="button"');
  });

  it('supports contextual home path and label for Platform Admin', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <NotFound homePath="/admin/dashboard" homeLabel="Back to Admin Dashboard" />
      </MemoryRouter>
    );

    expect(html).toContain('Back to Admin Dashboard');
    expect(html).toContain('href="/admin/dashboard"');
  });

  it('adapts container styling when nested inside an admin or shell layout', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <NotFound isNested={true} />
      </MemoryRouter>
    );

    // When nested, should not force min-h-screen full viewport
    expect(html).toContain('py-12');
    expect(html).not.toContain('min-h-screen');
  });

  it('applies TallyBakery brand colors and styling tokens', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(html).toContain('text-oven-black');
    expect(html).toContain('bg-flour');
    expect(html).toContain('text-verdigris');
  });
});
