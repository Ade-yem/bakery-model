/** @file Staff UI checks for role boundaries, routes and integration states. */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { StaffWorkspace } from '../StaffWorkspace';

describe('Production staff workspace', () => {
  it('keeps the real workspace behind an explicit session integration boundary', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <StaffWorkspace preview={false} />
      </MemoryRouter>
    );
    expect(html).toContain('Sign in to your workspace');
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
    it(`renders production preview ${page || '/'} with no financial or customer information`, () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/workspace-preview${page}`]}>
          <StaffWorkspace preview />
        </MemoryRouter>
      );
      expect(html).toContain('Sample data');
      expect(html).not.toMatch(/₦|cash drawer|customer credit|Sales today|Adebayo Stores/i);
      expect(html).not.toContain('href="/platform');
      expect(html).not.toContain('href="/app/');
      expect(html).toContain('<h1');
    });
  }

  it('shows pending acceptance without counting submitted production as available stock', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/workspace-preview/records/BAT-0186']}>
        <StaffWorkspace preview />
      </MemoryRouter>
    );
    expect(html).toContain('Pending acceptance');
    expect(html).toContain('not available stock');
  });

  it('handles unrecognized preview pages without falling back to privileged content', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/workspace-preview/unknown']}>
        <StaffWorkspace preview />
      </MemoryRouter>
    );
    expect(html).toContain('Page not found');
  });
});
