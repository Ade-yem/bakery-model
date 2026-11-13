# Staff workspace — first UI slice

The first slice is a production-only UI preview at `/workspace-preview`, with home, tasks, records/detail, history, personal schedule and own profile. Switzer is bundled locally and is the font family for the app, including existing shared components. The workspace reuses the existing landing/auth Logo and Button components, the same palette, rounded controls and a compatible surface/heading hierarchy.

`/workspace` shows a sign-in/integration boundary until the agreed session contract is connected. This implementation does not create an alternative auth mechanism, claim server authorization, submit inventory movements or grant role-switching access.

## PRD alignment

- Production preview contains no sales amounts, cash, customer data, raw-material balances or disbursement inventory views. It can show its own material consumption and submitted batch's receiving result.
- Submitted output is pending acceptance, not available finished stock.
- Submitted and accepted quantities are shown separately; history is read-only.
- Staff cannot edit their role, department or schedule.
- A next-day label makes overnight shifts explicit.
- Navigation helpers require module access plus permissions for departmental tasks. These are client display checks only; server enforcement remains required.

## Draft limits

The single preview draft is saved under `tallybakery:production-preview-draft` in browser localStorage. It is restored when the form reopens, with corrupt/blocked storage handled. Positive waste requires a note. This is a sample draft editor, not the PRD's IndexedDB operational repository or sync outbox; no sync success is simulated. Authenticated offline production entries must wait for an agreed event contract, access policy and durable outbox implementation.

## Remaining integration work

Backend-resolved identity, tenant, branch and department membership; entitlements and permissions; active shift; own task/record/schedule endpoints; authoritative mutations and input validation; offline authorization lifetime and cache isolation; authenticated logout and session expiry. No API, shared-package or root configuration files are changed.

Reception now has a separate preview at `/workspace-preview/reception`, sharing the same shell and design; see `reception/README.md`. Disbursement, Procurement and the complete canonical shift handover flow remain unchecked in `apps/app/CHECKLIST.md`.

## Verification

47 tests cover existing auth utilities plus navigation access, page rendering/privacy, unknown routes, draft quantity checks and recovery. Browser checks cover invalid draft input, saved draft recovery, empty search, navigation and 320px mobile layout. Build and lint checks run through the app package.

## Cross-app brand alignment

The agreed font from the design brief is Switzer. `apps/app` now loads it locally and declares it in both CSS font tokens. The separately owned `apps/marketing` still declares Figtree; its owner must update that declaration to Switzer for full typography consistency. No marketing source was changed. The staff sidebar reuses the shared loaf logo, and primary controls reuse the existing Button component rather than creating a separate identity.
