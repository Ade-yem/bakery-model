# Live workflow integration boundary

The application contains no development login, runtime seed records, preview routes or fabricated mutation success. With no adapters supplied, authentication and protected workspaces show unavailable states. There is no fallback to old browser sessions or device records.

## Team handoff

`App` accepts `authClient`, `workspaceAdapter` and the existing `syncAdapter`. Supply these from the application bootstrap when the team approves the deployed API and authentication contract. No provider, endpoint URL or new dependency has been selected by this cleanup.

- `auth.ts`: the session identity, assignments, plan/module grants and asynchronous sign-in, registration, reset and logout contract. An adapter must use server-authenticated sessions, map failures to safe messages and handle cookie/CSRF policy. Browser-supplied identity is never server authorization.
- `workspace.ts`: a discriminated snapshot per department. Map and validate API responses in the adapter; do not fetch all departments and hide sensitive fields in presentation code. Scope includes tenant, branch, user and department. Scope mismatch or missing record collections blocks rendering.
- `WorkspaceAdapter.load`: load the current authorized snapshot. Include verified shift ID/status, schedule, opening balances and a concurrency version. Empty collections mean a successful empty load, not unavailable data. Unknown opening cash/expenses are `null`; unknown queue metadata is `null`.
- `WorkspaceAdapter.mutate`: send a domain intent with `eventId` and `expectedVersion`. Resolve with an updated scoped snapshot only after an authoritative acknowledgement or a durable repository write explicitly represented as pending. Never resolve on validation alone. Preserve conflicts and indeterminate outcomes. Return the actual per-record/shift status; transport success does not imply transfer acceptance or a finalized shift.
- `syncAdapter`: reports actual queue metadata, reachability and server outcomes. Without one, the status stays unconfigured and manual sync is disabled. Do not report a completed synchronization just because the network is available.

The UI retains exact-money calculations, explicit Reception dispatch, immutable repayment inputs, multi-product stock checks, independent counts and distinct incoming signers. Incoming handover signing uses the current authenticated staff account; another person's password is not checked in the browser. The backend must enforce the same rules atomically and idempotently.

The in-memory submission queue blocks concurrent posts and reuses event IDs for unchanged retries while mounted. It is not a durable offline outbox. The live adapter must persist event IDs/outcomes across reloads and implement the approved IndexedDB repository, stale-session policy, shared-device/logout rules and conflict protocol. Test uncertain network outcomes and server acknowledgements before enabling real operations.

## Saved device evidence

Old `tallybakery:*` records and drafts are deliberately not loaded into new sessions and are not deleted. `journal/legacy.ts` is a read-only recovery parser, excluded from the normal application import graph. Do not automatically upload or attribute these unscoped records to a live tenant. A migration must be reviewed against the actual server contract and identify the original actors/scopes.

New drafts are isolated by tenant, branch, user, shift and workflow. Drafts are not submitted records and never change inventory or cash. The static service worker caches the app shell only; it does not implement operational offline synchronization.

## Verification

Use Node 22 and the package's existing commands:

```sh
pnpm --filter @repo/app exec tsc -b
pnpm --filter @repo/app lint
pnpm --filter @repo/app test
pnpm --filter @repo/app build
```

If a locally installed pnpm attempts to install the pinned package manager into a protected home directory, `npm_config_manage_package_manager_versions=false` uses the installed pnpm without changing manifests or the lockfile.

Fixtures under staff `__tests__/fixtures` are test-only. Keep them outside all production entrypoints. Before live rollout, test every adapter against the team's API, including revoked access, expired sessions, empty catalogues, duplicate requests, changed versions, storage failures, and balanced/unbalanced handovers.
