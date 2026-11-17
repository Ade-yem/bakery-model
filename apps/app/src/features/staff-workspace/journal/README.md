# Local mutation journal and transport boundary

`commitRecord` atomically writes a department projection and its pending event in
one versioned browser-storage envelope. Event IDs and sequence numbers survive
reload, identical retries do not enqueue duplicates, and failed writes expose no
success. Corrupt envelopes block reads/writes without replacing evidence. The
active mock session must match the department. UI route and action permissions
are checked separately; the real API remains the authorization authority.

The journal preserves events after acknowledgement or conflict. `recordOutcomes`
accepts only validated outcomes for the pending IDs supplied to a real transport.
Unknown, duplicate or malformed outcomes do not clear work. No automatic upload
exists. The UI exposes department-filtered metadata and conflicts; it never
allows staff to erase pending events or self-resolve canonical conflicts.

Default app status reads actual local pending/conflict counts but leaves manual
sync disabled until a real authenticated `SyncAdapter` is supplied. An adapter
must translate these full-state mock payloads to the agreed versioned API event
contract, validate scope and aggregate versions, report each actual outcome and
preserve rejected evidence. The local journal is not claimed to be that API's
operational event protocol.

Current persistence is a bounded localStorage adapter, not the proposed
IndexedDB production repository. Storage failures retain form input. It supports
browser offline reload and local workflows, but it is not a multi-device locking
or server-authorization solution. Before real tenant data is used, replace mock
identity and projections, agree logout/shared-device policy, use the approved
durable store and test quota, concurrency, API idempotency and conflict handling.
