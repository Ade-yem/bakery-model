/** @file Observable connection state; never owns or clears the operational mutation queue. */
import type { SyncAdapter, SyncController, SyncReport, SyncSnapshot } from './types';
/**
 * @description Rejects malformed counts and timestamps before they can imply successful synchronization.
 * @param report Status reported by the authenticated queue/transport adapter.
 * @returns Whether the report has safe, nonnegative counts and a valid acknowledgement timestamp.
 */
function isValidReport(report: SyncReport): boolean {
  return (
    Boolean(report) &&
    Number.isSafeInteger(report.pending) &&
    report.pending >= 0 &&
    Number.isSafeInteger(report.conflicts) &&
    report.conflicts >= 0 &&
    typeof report.serverReachable === 'boolean' &&
    (report.lastAcknowledgedAt === null ||
      (typeof report.lastAcknowledgedAt === 'string' &&
        Number.isFinite(Date.parse(report.lastAcknowledgedAt))))
  );
}
/**
 * @description Combines browser connectivity and real adapter outcomes without fabricating sync success.
 * @param adapter Optional authenticated queue/transport; absent until backend integration exists.
 * @param initialOnline Browser network hint, not proof that the service is reachable.
 * @returns An observable controller. Failed, aborted and stale responses never erase reported pending work.
 * @example const controller = createSyncController(sessionScopedAdapter, navigator.onLine);
 */
export function createSyncController(adapter?: SyncAdapter, initialOnline = true): SyncController {
  let snapshot: SyncSnapshot = {
    networkOnline: initialOnline,
    serverReachable: null,
    pending: null,
    conflicts: null,
    lastAcknowledgedAt: null,
    phase: 'idle',
    configured: Boolean(adapter),
    error: null,
  };
  const listeners = new Set<() => void>();
  let request: AbortController | undefined;
  let generation = 0;
  /**
   * @description Publishes a new immutable snapshot so React subscribers receive stable change notifications.
   * @param patch Fields changed by a connection event or validated adapter outcome.
   * @returns Nothing.
   */
  function publish(patch: Partial<SyncSnapshot>): void {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener());
  }
  /**
   * @description Runs one status read or manual sync and discards obsolete outcomes after disconnect/disposal.
   * @param kind Read-only queue refresh or explicit manual transport action.
   * @returns Completion; safe public errors are recorded in the snapshot.
   */
  async function run(kind: 'checking' | 'syncing'): Promise<void> {
    if (!adapter || snapshot.phase === 'syncing' || (kind === 'syncing' && !snapshot.networkOnline))
      return;
    request?.abort();
    const active = new AbortController();
    request = active;
    const version = ++generation;
    publish({ phase: kind, error: null });
    try {
      const report =
        kind === 'syncing'
          ? await adapter.sync(active.signal)
          : await adapter.readStatus(active.signal, snapshot.networkOnline);
      if (active.signal.aborted || version !== generation) return;
      if (!isValidReport(report) || (kind === 'syncing' && !report.serverReachable))
        throw new Error('Invalid or unacknowledged sync outcome');
      publish({
        ...report,
        serverReachable: snapshot.networkOnline ? report.serverReachable : false,
        phase: 'idle',
        error: null,
      });
    } catch {
      if (active.signal.aborted || version !== generation) return;
      publish({
        phase: 'error',
        serverReachable: false,
        error:
          kind === 'syncing'
            ? 'Sync failed. Unacknowledged changes remain pending. Try again when the service is available.'
            : 'Could not check sync status. The last known counts are shown; no changes were discarded.',
      });
    }
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setNetworkOnline: (online) => {
      if (online === snapshot.networkOnline) return;
      generation++;
      request?.abort();
      publish({
        networkOnline: online,
        serverReachable: online ? null : false,
        phase: 'idle',
        error: null,
      });
    },
    refresh: () => run('checking'),
    syncNow: () => run('syncing'),
    dispose: () => {
      generation++;
      request?.abort();
      listeners.clear();
    },
  };
}
