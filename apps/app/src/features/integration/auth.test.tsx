import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceRoute } from '../staff-workspace/WorkspaceRoute';
import { requireAuthClient, validateSession } from './auth';

describe('production authentication boundary', () => {
  it('does not accept browser-created sessions when authentication is unavailable', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => JSON.stringify({ department: 'production', expiresAt: Date.now() + 100000 }),
    });
    try {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <WorkspaceRoute />
        </MemoryRouter>
      );
      expect(html).toContain('Sign-in unavailable');
      expect(html).not.toContain('Staff navigation');
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it('rejects unconfigured operations instead of simulating success', () => {
    expect(() => requireAuthClient(null)).toThrow('Sign-in is currently unavailable');
  });
  it('rejects incomplete session identities and missing permissions', () => {
    expect(() =>
      validateSession({ department: 'production', expiresAt: Date.now() + 1000 })
    ).toThrow();
    expect(validateSession(null)).toBeNull();
  });
});
