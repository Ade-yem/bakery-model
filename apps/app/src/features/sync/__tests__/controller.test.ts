/** @file Connection and sync controller contract, tested before implementation. */
import { describe, expect, it, vi } from 'vitest';
import { createSyncController } from '../controller';
import type { SyncAdapter, SyncReport } from '../types';
const report: SyncReport = {
  pending: 3,
  conflicts: 0,
  serverReachable: true,
  lastAcknowledgedAt: null,
};
function adapter(overrides: Partial<SyncAdapter> = {}): SyncAdapter {
  return {
    readStatus: vi.fn(async () => report),
    sync: vi.fn(async () => ({
      ...report,
      pending: 0,
      lastAcknowledgedAt: '2026-11-13T12:00:00Z',
    })),
    ...overrides,
  };
}
describe('Global sync state', () => {
  it('does not invent a queue count or server connection without an adapter', async () => {
    const store = createSyncController();
    expect(store.getSnapshot()).toMatchObject({
      networkOnline: true,
      pending: null,
      serverReachable: null,
      configured: false,
    });
    await store.syncNow();
    expect(store.getSnapshot().lastAcknowledgedAt).toBeNull();
  });
  it('reads actual adapter counts and reports only the last server acknowledgement', async () => {
    const store = createSyncController(adapter());
    await store.refresh();
    expect(store.getSnapshot()).toMatchObject({
      pending: 3,
      configured: true,
      serverReachable: true,
    });
    await store.syncNow();
    expect(store.getSnapshot()).toMatchObject({
      pending: 0,
      lastAcknowledgedAt: '2026-11-13T12:00:00Z',
      phase: 'idle',
    });
  });
  it('does not issue sync calls while offline', async () => {
    const source = adapter();
    const store = createSyncController(source, false);
    await store.syncNow();
    expect(source.sync).not.toHaveBeenCalled();
    expect(store.getSnapshot().networkOnline).toBe(false);
  });
  it('keeps pending events and acknowledgement on failure, then allows retry', async () => {
    const sync = vi
      .fn()
      .mockRejectedValueOnce(new Error('private backend detail'))
      .mockResolvedValueOnce({ ...report, pending: 1 });
    const store = createSyncController(adapter({ sync }));
    await store.refresh();
    await store.syncNow();
    expect(store.getSnapshot()).toMatchObject({
      pending: 3,
      phase: 'error',
      lastAcknowledgedAt: null,
    });
    expect(store.getSnapshot().error).not.toContain('private backend detail');
    await store.syncNow();
    expect(store.getSnapshot()).toMatchObject({ pending: 1, phase: 'idle' });
  });
  it('prevents duplicate manual requests and shows syncing until acknowledgement', async () => {
    let finish: ((value: SyncReport) => void) | undefined;
    const sync = vi.fn(
      () =>
        new Promise<SyncReport>((resolve) => {
          finish = resolve;
        })
    );
    const store = createSyncController(adapter({ sync }));
    await store.refresh();
    const first = store.syncNow();
    await store.syncNow();
    expect(sync).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toMatchObject({ pending: 3, phase: 'syncing' });
    finish?.({ ...report, pending: 2 });
    await first;
    expect(store.getSnapshot().pending).toBe(2);
  });
  it('ignores a late sync response after going offline without erasing pending work', async () => {
    let finish: ((value: SyncReport) => void) | undefined;
    const source = adapter({
      sync: () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    });
    const store = createSyncController(source);
    await store.refresh();
    const operation = store.syncNow();
    store.setNetworkOnline(false);
    finish?.({ ...report, pending: 0 });
    await operation;
    expect(store.getSnapshot()).toMatchObject({
      pending: 3,
      networkOnline: false,
      lastAcknowledgedAt: null,
    });
  });
  it('keeps conflicts visible and never equates them with a cleared queue', async () => {
    const store = createSyncController(
      adapter({ sync: async () => ({ ...report, pending: 1, conflicts: 2 }) })
    );
    await store.syncNow();
    expect(store.getSnapshot()).toMatchObject({ pending: 1, conflicts: 2 });
  });
  it('rejects malformed reports instead of showing false success', async () => {
    const store = createSyncController(adapter({ sync: async () => ({ ...report, pending: -1 }) }));
    await store.refresh();
    await store.syncNow();
    expect(store.getSnapshot()).toMatchObject({ pending: 3, phase: 'error' });
  });
  it('notifies subscribers, cleans up, and refreshes after reconnect without auto-posting', async () => {
    const source = adapter();
    const store = createSyncController(source);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.setNetworkOnline(false);
    expect(listener).toHaveBeenCalled();
    unsubscribe();
    listener.mockClear();
    store.setNetworkOnline(true);
    await store.refresh();
    expect(listener).not.toHaveBeenCalled();
    expect(source.sync).not.toHaveBeenCalled();
    store.dispose();
  });
});

describe('Offline queue status and stale reads', () => {
  it('passes the offline hint to local status reads without sending mutations', async () => {
    const source = adapter();
    const store = createSyncController(source, false);
    await store.refresh();
    expect(source.readStatus).toHaveBeenCalledWith(expect.any(AbortSignal), false);
    expect(store.getSnapshot()).toMatchObject({
      pending: 3,
      networkOnline: false,
      serverReachable: false,
    });
    expect(source.sync).not.toHaveBeenCalled();
  });
  it('ignores an obsolete status response after a newer manual acknowledgement', async () => {
    let finish: ((value: SyncReport) => void) | undefined;
    const source = adapter({
      readStatus: () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    });
    const store = createSyncController(source);
    const staleRead = store.refresh();
    await store.syncNow();
    finish?.({ ...report, pending: 20 });
    await staleRead;
    expect(store.getSnapshot()).toMatchObject({
      pending: 0,
      phase: 'idle',
      lastAcknowledgedAt: '2026-11-13T12:00:00Z',
    });
  });
});
