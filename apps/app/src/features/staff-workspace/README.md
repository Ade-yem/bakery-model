# Staff application

All implementation is inside `apps/app`. The staff frontend uses canonical routes
`/workspace/production`, `/workspace/reception`, `/workspace/disbursement` and
`/workspace/procurement`. Authentication and current source data are supplied by
the explicitly requested mock implementation; the pages themselves are normal
application pages following the existing Figtree, Logo, Button and palette.

## Implemented frontend journeys

- Production: flour/bags, sugar/kg, yeast/kg, output and waste entry; draft recovery;
  batch submission; records, summary and history; independent receiving feedback.
- Reception: orders and split allocations; required bank/customer evidence;
  manual handoff; fulfillment feedback; linked cash/transfer repayments; customers
  and outstanding credit; cash closing counts and dual-person handover.
- Disbursement: pending Production transfers; independent received counts and
  explained differences; only manually pushed orders; atomic full multi-product
  fulfillment, available stock, physical closing counts and dual-person handover.
- Procurement: supplier lookup; multi-material receipts with explicit units,
  decimal-safe totals and references; duplicate checks; drafts, records and history.
- All departments: own schedule/profile, module/permission-aware navigation,
  route/action denial, account/session/subscription states, local pending-work and
  conflict inspection, durable saved changes and offline app-shell reload.

The shared mock transport returns quantity-only projections to Disbursement.
Customer/contact/payment data are not part of those projections. Actual backend
field-level authorization must enforce the same separation.

## Pending-service semantics

Independent signatures produce `SEALED_PENDING_SYNC`, never a fabricated server
seal. The shell shows actual local queued-work counts. Manual sync remains disabled
without an authenticated transport. See `journal/README.md` for persistence and
transport requirements and `handover/README.md` for the signer contract.

The production build emits `sw.js` to cache hashed static assets, fonts and the
HTML shell. API/auth responses and operational records are not cached by the
service worker. See [Vite's plugin API](https://vite.dev/guide/api-plugin) for the
build hook used by `tooling/offline-shell.ts`.

## Development access

`<department>@demo.tallybakery.test` with `TallyDemo2026!`. Incoming mock verifier
credentials use `<department>.incoming@demo.tallybakery.test` for Reception or
Disbursement only, with the same password. No password is persisted.

## Release boundary

This completes the staff frontend against the local/mock contract. It does not
complete live identity, tenant isolation, financial/stock posting, canonical shift
lifecycle, operational IndexedDB sync, notification delivery or server conflict
resolution. Those are explicitly separate integration acceptance gates in
`CHECKLIST.md`. No API, shared-package, marketing or root configuration changes
are included. Management approvals/settings and Super/Client Admin areas are not
staff capabilities.
