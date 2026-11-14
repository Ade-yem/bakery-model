# Global connection banner and sync-status pill

`SyncProvider` owns one observable controller at the app root. `GlobalSyncStatus` appears in the shared staff shell, so both Production and Reception report the same connection/queue state. `OnlineOfflineBanner` and `SyncStatusPill` can be reused by future authenticated shells without duplicating state.

## User-facing states

- **Network available:** the browser reports a network connection, but no authenticated service/queue adapter is attached. Pending count is explicitly unavailable, never fabricated as zero.
- **Online:** an adapter confirms service reachability.
- **Offline mode:** browser online/offline events pause manual network sync; existing counts remain visible. Local status reads receive `networkOnline: false` and must not perform network calls.
- **Checking / Syncing:** progress is visible, motion respects reduced-motion settings, and concurrent manual requests are blocked.
- **Pending changes:** number of queued mutations awaiting acknowledgement, separate from blocked conflicts.
- **Service unavailable / Retry sync:** failures preserve pending counts and last acknowledgement, with safe error copy.
- **Conflicts:** remain visible separately; a sync retry must not silently overwrite conflicting records.
- **No pending changes:** quiet queue-empty state, not a blanket claim that every record has synced.

The last-sync timestamp comes exclusively from a successful server acknowledgement reported by the adapter, not the time of a button click.

## Current integration boundary

There is no authenticated operational outbox or sync endpoint in this frontend yet. No adapter is attached by default. Consequently, the preview correctly shows **Pending count unavailable** and disables **Sync Now** with an explanation. Production drafts and Reception preview objects in localStorage are not counted as operational mutations and are never uploaded by this component.

The actual manual trigger is implemented and tested through `SyncAdapter`. Pass a stable, authenticated, session-scoped adapter to `<App syncAdapter={adapter} />`. The adapter must:

1. Read pending and conflict counts from the durable authorized outbox, not from a manually maintained UI counter.
2. Optionally probe service reachability when online; browser connectivity alone is insufficient.
3. Send authorized, schema-validated, idempotent events on `sync(signal)` and only acknowledge actual server outcomes.
4. Preserve unacknowledged events on abort, network/provider errors, session expiry and conflicts.
5. Return updated counts and the last real acknowledgement timestamp after sync.
6. Notify subscribers after enqueue, acknowledgement and conflict changes, including supported cross-tab queue updates.
7. Respect AbortSignal, enforce bounded transport timeouts and use backend event IDs for safe retries.

Replace the adapter identity or unmount the provider when user, tenant, branch or access scope changes, and remove it on logout. No queue identity, authorization, database provider, new authentication scheme or backend endpoint is invented here. No sensitive payload is exposed by the status component.

Reconnect refreshes status only. It does not automatically post mutations. The user can trigger **Sync Now** once online and configured. Late responses after disconnect, replacement or disposal are ignored.

## Verification

Controller tests cover adapter acknowledgement, real counts, offline suppression, retries, duplicate clicks, stale responses, conflicts, malformed outcomes and subscription cleanup. Rendering tests cover accessible state text, unknown counts, disabled reasons, progress and conflict feedback. Build/lint run through the existing app scripts.
