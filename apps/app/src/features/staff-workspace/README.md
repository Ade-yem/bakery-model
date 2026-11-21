# Staff application

Canonical routes cover Production, Reception, Disbursement and Procurement under `/workspace/:department`. Existing Figtree typography, Logo, Button, layouts, route boundaries and workflow forms are retained.

Runtime demo authentication and seeded data have been removed. Sign-in and workspace access remain unavailable until the team supplies authenticated adapters. No server success is simulated.

The frontend retains batch validation and drafts, split tenders, explicit order push, credit gates, repayments, quantity-only receiving/fulfillment, stock counts, decimal-safe multi-line receipts, independent handovers, schedules, profiles and sync/error states. Data comes from the assigned department snapshot, including opening balances, identity and shifts.

See `../integration/README.md` for contracts, future live/offline integration and preservation of old device evidence. UI completion is separate from server authorization, canonical ledger posting and synchronization. Track those gates in `apps/app/CHECKLIST.md`.
