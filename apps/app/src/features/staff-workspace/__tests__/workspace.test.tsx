import { TestWorkspace } from './fixtures/workspace';
import { WorkspaceRoute } from '../WorkspaceRoute';
/** @file Staff UI checks for role boundaries, routes and integration states. */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { StaffWorkspace } from '../StaffWorkspace';

describe('Production staff workspace', () => {
  it('keeps the real workspace behind an explicit session integration boundary', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <WorkspaceRoute />
      </MemoryRouter>
    );
    expect(html).not.toContain('Staff navigation');
    expect(html).not.toContain('Ada Okonkwo');
    expect(html).not.toContain('BAT-0186');
  });

  for (const page of [
    '',
    '/tasks',
    '/records',
    '/records/BAT-0186',
    '/history',
    '/schedule',
    '/profile',
  ]) {
    it(`renders production workspace ${page || '/'} with no financial or customer information`, () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/workspace/production${page}`]}>
          <TestWorkspace department="production">
            <StaffWorkspace />
          </TestWorkspace>
        </MemoryRouter>
      );
      expect(html).toContain('Staff navigation');
      expect(html).toContain('Log out');
      expect(html).not.toContain('Sample data');
      expect(html).not.toMatch(/₦|cash drawer|customer credit|Sales today|Adebayo Stores/i);
      expect(html).not.toContain('href="/platform');
      expect(html).not.toContain('href="/app/');
      expect(html).toContain('<h1');
    });
  }

  it('shows pending acceptance without counting submitted production as available stock', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/workspace/production/records/BAT-0186']}>
        <TestWorkspace department="production">
          <StaffWorkspace />
        </TestWorkspace>
      </MemoryRouter>
    );
    expect(html).toContain('Pending acceptance');
    expect(html).toContain('not available stock');
  });

  it('handles unrecognized workspace pages without falling back to privileged content', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/workspace/production/unknown']}>
        <TestWorkspace department="production">
          <StaffWorkspace />
        </TestWorkspace>
      </MemoryRouter>
    );
    expect(html).toContain('Page not found');
  });
});
