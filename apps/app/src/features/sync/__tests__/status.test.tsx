/** @file Accessible rendering of connection, pending, syncing and failure states. */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { OnlineOfflineBanner, SyncStatusPill } from '../SyncStatus';
import type { SyncSnapshot } from '../types';
const base: SyncSnapshot = {
  networkOnline: true,
  serverReachable: true,
  configured: true,
  pending: 3,
  conflicts: 0,
  lastAcknowledgedAt: null,
  phase: 'idle',
  error: null,
};
describe('Connection banner and sync pill', () => {
  it('shows online service state, pending mutations and an enabled manual trigger', () => {
    const html = renderToStaticMarkup(<OnlineOfflineBanner snapshot={base} onSync={() => {}} />);
    expect(html).toContain('Online');
    expect(html).toContain('3 pending');
    expect(html).toContain('Sync Now');
    expect(html).not.toContain('disabled=""');
  });
  it('disables network requests offline without claiming work was acknowledged', () => {
    const html = renderToStaticMarkup(
      <OnlineOfflineBanner
        snapshot={{ ...base, networkOnline: false, serverReachable: false }}
        onSync={() => {}}
      />
    );
    expect(html).toContain('Offline mode');
    expect(html).toContain('3 pending');
    expect(html).toContain('disabled=""');
    expect(html).not.toContain('All synced');
  });
  it('distinguishes an unconfigured queue and unverified network from a healthy server', () => {
    const html = renderToStaticMarkup(
      <OnlineOfflineBanner
        snapshot={{ ...base, configured: false, serverReachable: null, pending: null }}
        onSync={() => {}}
      />
    );
    expect(html).toContain('Network available');
    expect(html).toContain('Pending count unavailable');
    expect(html).toContain('not connected');
    expect(html).not.toContain('0 pending');
  });
  it('shows progress and prevents concurrent manual clicks', () => {
    const html = renderToStaticMarkup(
      <OnlineOfflineBanner snapshot={{ ...base, phase: 'syncing' }} onSync={() => {}} />
    );
    expect(html).toContain('Syncing');
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-busy="true"');
  });
  it('keeps conflicts and retry feedback visible without falsely claiming completion', () => {
    const html = renderToStaticMarkup(
      <OnlineOfflineBanner
        snapshot={{
          ...base,
          conflicts: 2,
          phase: 'error',
          error: 'Sync failed. Pending changes retained.',
        }}
        onSync={() => {}}
      />
    );
    expect(html).toContain('2 conflicts');
    expect(html).toContain('Sync failed');
    expect(html).toContain('Retry sync');
  });
  it('uses a quiet no-pending state and an accessible count label', () => {
    const html = renderToStaticMarkup(<SyncStatusPill snapshot={{ ...base, pending: 0 }} />);
    expect(html).toContain('No pending changes');
    expect(html).not.toContain('All synced');
  });
});
