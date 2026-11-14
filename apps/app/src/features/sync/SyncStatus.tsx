/** @file Accessible global network banner and reusable pending-mutation pill. */
import { useContext, useSyncExternalStore } from 'react';
import { Wifi, WifiOff, CloudOff, RefreshCw, Clock3, Check, CircleAlert } from 'lucide-react';
import { Button } from '../../components/shared/Button';
import { SyncContext } from './context';
import type { SyncSnapshot } from './types';
import './sync-status.css';
interface BannerProps {
  snapshot: SyncSnapshot;
  onSync: () => void;
}
/**
 * @description Shows queue counts without confusing unacknowledged mutations, conflicts or an unknown queue.
 * @param props Validated sync snapshot; null pending means the queue count is unknown.
 * @returns Text-and-icon pill accessible independently of color.
 */
export function SyncStatusPill({ snapshot }: { snapshot: SyncSnapshot }) {
  const label =
    snapshot.pending === null
      ? 'Pending count unavailable'
      : snapshot.pending === 0
        ? 'No pending changes'
        : `${snapshot.pending} pending`;
  const Icon = snapshot.phase === 'syncing' ? RefreshCw : snapshot.pending === 0 ? Check : Clock3;
  return (
    <span className="cs-pill" aria-label={label}>
      <Icon
        size={13}
        aria-hidden="true"
        className={snapshot.phase === 'syncing' ? 'cs-spin' : undefined}
      />
      <span>
        {snapshot.phase === 'syncing' ? 'Syncing · ' : ''}
        {label}
      </span>
      {Boolean(snapshot.conflicts) && (
        <span className="cs-conflicts">
          <CircleAlert size={12} aria-hidden="true" />
          {snapshot.conflicts} {snapshot.conflicts === 1 ? 'conflict' : 'conflicts'}
        </span>
      )}
    </span>
  );
}
/**
 * @description Separates browser network availability from confirmed service reachability and manual sync outcomes.
 * @param props Sync snapshot and explicit manual sync callback; no mutations are sent by rendering the banner.
 * @returns A responsive status region with visible reasons when sync cannot run.
 */
export function OnlineOfflineBanner({ snapshot, onSync }: BannerProps) {
  const busy = snapshot.phase === 'syncing' || snapshot.phase === 'checking';
  const disabled = !snapshot.networkOnline || !snapshot.configured || busy;
  const offline = !snapshot.networkOnline;
  const connection = offline
    ? 'Offline mode'
    : !snapshot.configured
      ? 'Network available'
      : snapshot.phase === 'checking'
        ? 'Checking service'
        : snapshot.serverReachable === true
          ? 'Online'
          : snapshot.serverReachable === false
            ? 'Service unavailable'
            : 'Service not verified';
  const Icon = offline ? WifiOff : snapshot.serverReachable === false ? CloudOff : Wifi;
  const description =
    snapshot.error ??
    (!snapshot.configured
      ? 'Sync queue not connected. Pending mutations cannot be counted yet.'
      : offline
        ? 'Server requests are paused. Pending changes await acknowledgement after reconnecting.'
        : snapshot.conflicts
          ? 'Conflicts need review; a retry must not overwrite conflicting records.'
          : snapshot.serverReachable === false
            ? 'Your network is available, but the service is unreachable. You can retry sync.'
            : snapshot.pending === null
              ? 'Reading queue status. No successful sync has been assumed.'
              : snapshot.pending > 0
                ? 'Changes are waiting for server acknowledgement.'
                : 'No queued mutations are waiting for acknowledgement.');
  const lastSync =
    snapshot.lastAcknowledgedAt && Number.isFinite(Date.parse(snapshot.lastAcknowledgedAt))
      ? new Date(snapshot.lastAcknowledgedAt)
      : null;
  const reason = !snapshot.configured
    ? 'Sync is unavailable until an authenticated queue and transport are connected.'
    : offline
      ? 'Reconnect to enable manual synchronization.'
      : busy
        ? 'Wait for the current status request to finish.'
        : 'Synchronize queued changes with the service.';
  return (
    <section
      className={`cs-banner ${offline ? 'cs-offline' : ''}`}
      aria-label="Connection and synchronization"
      aria-busy={busy}
    >
      <div className="cs-state" role="status" aria-live="polite" aria-atomic="true">
        <Icon size={17} aria-hidden="true" />
        <div>
          <strong>{connection}</strong>
          <p>{description}</p>
          {lastSync && (
            <span className="cs-last-sync">
              Last server acknowledgement:{' '}
              <time dateTime={snapshot.lastAcknowledgedAt ?? undefined}>
                {lastSync.toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </span>
          )}
        </div>
      </div>
      <div className="cs-actions">
        <div role="status" aria-live="polite" aria-atomic="true">
          <SyncStatusPill snapshot={snapshot} />
        </div>
        <span title={reason}>
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={onSync}
            aria-label={`${snapshot.phase === 'error' ? 'Retry sync' : 'Sync Now'}. ${reason}`}
            icon={
              <RefreshCw
                size={13}
                aria-hidden="true"
                className={snapshot.phase === 'syncing' ? 'cs-spin' : undefined}
              />
            }
          >
            {snapshot.phase === 'syncing'
              ? 'Syncing…'
              : snapshot.phase === 'checking'
                ? 'Checking…'
                : snapshot.phase === 'error'
                  ? 'Retry sync'
                  : 'Sync Now'}
          </Button>
        </span>
      </div>
    </section>
  );
}
/**
 * @description Connects the reusable banner to the app-wide controller, updating across all staff routes.
 * @returns Shared live connection and sync status UI; unconfigured previews never claim a synced queue.
 */
export function GlobalSyncStatus() {
  const controller = useContext(SyncContext);
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot
  );
  return (
    <OnlineOfflineBanner
      snapshot={snapshot}
      onSync={() => {
        void controller.syncNow();
      }}
    />
  );
}
