# Reception staff workspace — UI implementation

Preview: `/workspace-preview/reception`. Live `/workspace` remains behind the existing session-integration boundary. All data and actions here are explicitly labeled as a local preview.

## Pages and interactions

- Overview, department tasks, orders/payments with search and dispatch-state filters.
- Order entry with product lines, whole-unit quantities and immutable catalogue prices.
- Order details with cash, transfer evidence and debt shown separately.
- Additional payment capture on unsettled records, requiring a transfer reference and customer identity/contact for debt.
- Explicit **Push to Disbursement** confirmation, separate from payment; repeat push is harmless and no stock is adjusted.
- Source-linked customer and credit views; staff cannot grant credit approval. A fixture demonstrates already authorized credit; newly recorded debt remains pending until an agreed backend approval policy is connected.
- Own history, schedule and read-only profile.
- Closing cash and outgoing handover draft, with expected cash derived from opening float + cash receipts − approved petty cash. Differences require an explanation. Draft variance uses brackets for deficits. Incoming independent verification and canonical sealing are not simulated.

Shared `StaffShell`, Logo, Button, Switzer fonts and staff styles keep Reception consistent with Production and the existing app identity. No production batch, raw-material, procurement, transfer-acceptance or fulfillment controls are exposed.

## Persistence and financial limits

Money input is parsed as integer kobo. No fractional currency arithmetic is used to calculate order totals or cash balances. Currency division is used only for display. Order status is separate from tender entries; debt never counts as money received, and bank transfers never count as drawer cash.

Sample order/payment/push changes persist under `tallybakery:reception-preview:v1`. Browser records are validated on recovery; corrupt storage is not overwritten with fixtures. Storage failures keep the form open with an error. A local outgoing cash draft can be restored and warns when the expected balance has changed.

This browser storage is not the PRD's authenticated IndexedDB repository or append-only server ledger. No live payment, bank verification, stock write, server dispatch, notification, dual signoff, or sync acknowledgement is reported. Avoid real customer data in the preview.

## Backend dependencies / remaining scope

- Backend-resolved tenant/branch/department/role/permissions and plan entitlements.
- Authenticated catalogue, customer, order, payment, credit and schedule endpoints.
- Server validation, immutable posted ledgers, transactions, idempotency and concurrency.
- Credit eligibility/approval rules, transfer verification and customer repayments.
- Server-provided opening float and approved petty cash, incoming co-sign, canonical shift seal and incident notification.
- Durable operational IndexedDB outbox, authorization/cache isolation and explicit accepted/conflict/error outcomes.
- Real history/pagination and authenticated logout.

Do not integrate the local sample state as an authoritative business balance.
