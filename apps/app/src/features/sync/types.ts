/** @file Frontend integration contract; adapters own durable queues and server validation. */
export interface SyncReport {
  /** Queued mutations awaiting acknowledgement, excluding separately blocked conflicts. */
  pending: number;
  conflicts: number;
  serverReachable: boolean;
  /** Last successful server acknowledgement, never the last attempted sync time. */
  lastAcknowledgedAt: string | null;
}
export interface SyncAdapter {
  /** Read the durable local queue and optionally probe the service; do not send requests when offline. */
  readStatus: (signal: AbortSignal, networkOnline: boolean) => Promise<SyncReport>;
  /** Send authorized queued events; preserve every unacknowledged event and return actual outcomes. */
  sync: (signal: AbortSignal) => Promise<SyncReport>;
  /** Notify after enqueue, acknowledgement, conflict or another device's local queue change. */
  subscribe?: (listener: () => void) => () => void;
}
export interface SyncSnapshot {
  networkOnline: boolean;
  serverReachable: boolean | null;
  pending: number | null;
  conflicts: number | null;
  lastAcknowledgedAt: string | null;
  phase: 'idle' | 'checking' | 'syncing' | 'error';
  configured: boolean;
  error: string | null;
}
export interface SyncController {
  getSnapshot: () => SyncSnapshot;
  subscribe: (listener: () => void) => () => void;
  setNetworkOnline: (online: boolean) => void;
  refresh: () => Promise<void>;
  syncNow: () => Promise<void>;
  dispose: () => void;
}
