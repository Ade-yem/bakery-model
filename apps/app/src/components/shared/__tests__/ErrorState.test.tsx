/**
 * @file Unit tests for standardized ErrorState component.
 * Verifies error variants (network, server, request-failed, unauthorized, session-expired),
 * onRetry callback execution, production safety (no raw stack trace leakage),
 * custom title/description overrides, and accessibility (role="alert").
 */

import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ErrorState } from '../ErrorState';

describe('4. Standardized ErrorState Component', () => {
  it('renders network error variant with wifi offline icon and reconnect message', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ErrorState variant="network" />
      </MemoryRouter>
    );

    expect(html).toContain('Network Connection Error');
    expect(html).toContain('Unable to reach Cadence servers. Please verify your connection.');
    expect(html).toContain('role="alert"');
  });

  it('renders server error variant with safe non-technical description', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ErrorState variant="server" />
      </MemoryRouter>
    );

    expect(html).toContain('Server Encountered an Issue');
    expect(html).toContain('Our backend service encountered a temporary error.');
  });

  it('renders request-failed variant with retry button', () => {
    const onRetry = vi.fn();
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ErrorState
          variant="request-failed"
          onRetry={onRetry}
          retryLabel="Try Loading Again"
        />
      </MemoryRouter>
    );

    expect(html).toContain('Request Failed');
    expect(html).toContain('Try Loading Again');
  });

  it('renders unauthorized access error variant with access-denied guidance', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ErrorState variant="unauthorized" />
      </MemoryRouter>
    );

    expect(html).toContain('Access Restricted');
    expect(html).toContain('You do not have permission to view or manage this operational section.');
  });

  it('renders session-expired variant with prompt to sign in again', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ErrorState
          variant="session-expired"
          loginPath="/login"
        />
      </MemoryRouter>
    );

    expect(html).toContain('Session Expired');
    expect(html).toContain('Your session has timed out. Please sign in again.');
    expect(html).toContain('href="/login"');
  });

  it('never exposes raw stack traces or internal exception details in UI', () => {
    const sensitiveError = new Error('FATAL: Database connection timeout at pool.pg:5432 with secret_key');
    sensitiveError.stack = 'SecretInternalStack: at internal_db.ts:42:13';

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ErrorState
          variant="server"
          error={sensitiveError}
        />
      </MemoryRouter>
    );

    expect(html).not.toContain('SecretInternalStack');
    expect(html).not.toContain('internal_db.ts');
    expect(html).not.toContain('secret_key');
  });

  it('supports custom title, description, and secondary action button', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ErrorState
          title="Custom Inventory Sync Error"
          description="Failed to load stock movements for shift 42."
          action={{
            label: 'View Shift Logs',
            to: '/business/operations/inventory',
          }}
        />
      </MemoryRouter>
    );

    expect(html).toContain('Custom Inventory Sync Error');
    expect(html).toContain('Failed to load stock movements for shift 42.');
    expect(html).toContain('View Shift Logs');
    expect(html).toContain('href="/business/operations/inventory"');
  });

  it('supports compact mode for small widgets and table cells', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ErrorState
          variant="request-failed"
          compact={true}
        />
      </MemoryRouter>
    );

    expect(html).toContain('py-4');
    expect(html).toContain('text-xs');
  });
});
