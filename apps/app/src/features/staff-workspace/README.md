# Staff application

Canonical routes cover Production, Reception, Disbursement and Procurement under `/workspace/:department`. Existing Figtree typography, Logo, Button, layouts, route boundaries and workflow forms are retained.

Runtime demo authentication and seeded data have been removed. Cookie sign-in, verified workspace selection, catalogues and supported supplier/customer entry connect to the supplied Cadence API. See `../api/README.md` for coverage and verification. No server success is simulated.

The frontend retains batch validation and drafts, split tenders, explicit order push, credit gates, repayments, quantity-only receiving/fulfillment, stock counts, decimal-safe multi-line receipts, independent handovers, schedules and sync/error states for future transactional adapters. Those workflows require authoritative department snapshots, including opening balances and shifts. Their canonical pages currently show unavailable states because operational endpoints are not deployed.

See `../integration/README.md` for contracts, future live/offline integration and preservation of old device evidence. UI completion is separate from server authorization, canonical ledger posting and synchronization. Track those gates in `apps/app/CHECKLIST.md`.
