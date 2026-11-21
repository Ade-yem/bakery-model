# Requirements Document

## Module: E-Procurement Interactive Prototype (`/workspace-preview/procurement`)

### Cadence — Operations & Reconciliation Platform (`apps/app`)

---

## Introduction

To demonstrate Cadence's end-to-end e-procurement workflow to a prospective bakery client without blocking on backend database migrations, this module delivers an interactive, stateful UI prototype at `/workspace-preview/procurement/*`. It mirrors the architectural patterns and visual identity of the existing Production (`/workspace-preview/*`) and Reception (`/workspace-preview/reception/*`) previews while showcasing the complete operational loop: identifying low-stock raw materials, issuing Purchase Orders (POs) to suppliers, recording supplier deliveries (Procurement Receipts), and automatically updating raw-material stock levels and the append-only spend ledger.

## Existing Capabilities and Boundaries

- **Existing Codebase Anchors**:
  - `apps/app/src/App.tsx`: Hosts client routing (`BrowserRouter`), `SyncProvider`, and existing `/workspace-preview/*` and `/workspace-preview/reception/*` routes.
  - `apps/app/src/features/staff-workspace/StaffShell.tsx`: Provides the shared sidebar, topbar, `GlobalSyncStatus` banner, preview disclaimer banner, skip links, and focus management.
  - `apps/app/src/features/staff-workspace/reception/`: Demonstrates validated `localStorage` persistence (`storage.ts`), integer kobo currency arithmetic (`orders.ts`), and Vitest unit/component tests (`__tests__/`).
  - `apps/api/src/suppliers/`: Existing supplier directory endpoints (`GET/POST /suppliers`), not yet wired to operational procurement or inventory tables.
- **In Scope**:
  - Client-only interactive preview at `/workspace-preview/procurement/*` with 5 views: Overview, Purchase Orders, Receipts & Ledger, Raw Material Stock, and Suppliers.
  - Validated `localStorage` persistence with a "Reset Demo Data" capability.
  - Integer-kobo safe monetary calculations (`parseMoney` / `formatMoney`) and deterministic stock quantity math.
  - Strict role-scope isolation inside the Procurement preview (no customer credit/sales drawer totals exposed).
- **Out of Scope**:
  - Live backend API mutations, PostgreSQL/Drizzle schema changes, authentication/session verification, or cross-department real-time server sync.

## Glossary

- **Purchase Order (PO)**: An order issued to a registered supplier specifying raw materials, ordered quantities, and agreed unit costs (`OPEN`, `RECEIVED`, or `CANCELLED`).
- **Procurement Receipt**: An immutable record of goods delivered by a supplier (either against an `OPEN` PO or as a direct receipt) that increments raw-material stock and records procurement spend.
- **Raw Material**: An ingredient or consumable tracked in store inventory with an explicit unit (e.g., `50kg bag`, `kg`, `carton`), current stock level, and minimum reorder threshold.
- **Inbound Stock Movement**: A ledger entry generated automatically when a Procurement Receipt is posted, linking the stock increase to the receipt reference and receiving actor.
- **Kobo**: The smallest currency unit (1/100th of NGN) used as a safe integer to prevent floating-point rounding errors.

## Requirements

### Requirement 1: Workspace Shell, Navigation & Role Isolation (PROC-01)

**User Story:** As a Shift / Branch Manager demoing Cadence to a client, I want a dedicated Procurement workspace preview that matches the rest of the app so that the demo feels cohesive and clearly scoped.

#### Acceptance Criteria

1. WHEN a user navigates to `/workspace-preview/procurement` or any sub-route under `/workspace-preview/procurement/*`, THE System SHALL render `ProcurementWorkspace` inside `StaffShell` with the `GlobalSyncStatus` banner and a clear UI preview notice.
2. THE System SHALL expose exactly five navigation destinations in the Procurement sidebar: Overview, Purchase Orders, Receipts & Ledger, Raw Material Stock, and Suppliers.
3. THE System SHALL NOT display Reception cash-drawer totals, customer credit balances, or Production batch schedules within the Procurement preview.
4. IF a user navigates to an unknown path under `/workspace-preview/procurement/*`, THEN THE System SHALL render a recoverable "Page not found" view with a link back to `/workspace-preview/procurement`.

### Requirement 2: Persistent Demo State & Recovery (PROC-02)

**User Story:** As a presenter running a live client walkthrough, I want my demo edits to survive page refreshes and be easily resettable so that I can rehearse and repeat the demo cleanly.

#### Acceptance Criteria

1. WHEN the Procurement preview loads with no prior saved state in `localStorage`, THE System SHALL seed realistic bakery suppliers, raw materials (including at least two low-stock items), open/received purchase orders, and receipts.
2. WHEN a Purchase Order, Procurement Receipt, or Supplier is created or updated, THE System SHALL validate the state transition and persist the updated snapshot to `localStorage` under a dedicated versioned key (`cadence:procurement-preview:v1`).
3. IF `localStorage` contains malformed or corrupted JSON, THEN THE System SHALL preserve the raw storage value without overwriting it and display a recoverable error panel with a retry/reset action.
4. WHEN the user activates **Reset Demo Data**, THE System SHALL restore the initial seeded fixtures in `localStorage` and display a confirmation status message.

### Requirement 3: Overview KPIs & Low-Stock Quick Reorder (PROC-03)

**User Story:** As a presenter, I want an executive Overview screen showing open orders, procurement spend, and low-stock alerts so that the client immediately grasps operational visibility.

#### Acceptance Criteria

1. THE System SHALL derive all Overview KPI cards (Open POs count, Today's Procurement Spend in kobo/NGN, Low-Stock Alerts count, and Posted Receipts count) directly from the current store state rather than hardcoded numbers.
2. WHEN one or more raw materials have `currentStock <= minThreshold`, THE System SHALL highlight them in a Low-Stock Alerts list on the Overview with a **Reorder** action.
3. WHEN the user clicks **Reorder** on a low-stock material, THE System SHALL open the New Purchase Order flow pre-populated with that material and its preferred supplier.

### Requirement 4: Purchase Order Lifecycle (PROC-04)

**User Story:** As a Procurement Officer, I want to create, filter, and cancel Purchase Orders so that supplier commitments are tracked before deliveries arrive.

#### Acceptance Criteria

1. WHEN creating a Purchase Order, THE System SHALL require a valid supplier, at least one line item with a positive integer quantity, and a nonnegative integer unit cost in kobo.
2. WHEN a valid Purchase Order is submitted, THE System SHALL assign a unique sequential PO number (e.g., `PO-0105`), compute `totalAmount` using safe integer arithmetic, set status to `OPEN`, and persist it.
3. WHILE viewing Purchase Orders, THE System SHALL allow filtering by status (`ALL`, `OPEN`, `RECEIVED`, `CANCELLED`).
4. WHEN an `OPEN` Purchase Order is cancelled, THE System SHALL transition its status to `CANCELLED` without altering raw-material stock or creating a receipt.
5. IF a Purchase Order is already `RECEIVED` or `CANCELLED`, THEN THE System SHALL disable delivery receipt and cancellation actions on that PO.

### Requirement 5: Atomic Delivery Receipt, Stock Update & Spend Ledger (PROC-05)

**User Story:** As a Storekeeper / Manager, I want recording a delivery against a Purchase Order (or directly) to update stock and log the receipt atomically so that inventory and spend always reconcile.

#### Acceptance Criteria

1. WHEN the user clicks **Receive Delivery** on an `OPEN` Purchase Order and confirms a non-empty supplier invoice/delivery reference and received line quantities (> 0), THE System SHALL atomically:
   - Transition the Purchase Order status to `RECEIVED` (if tied to a PO),
   - Append a new immutable `ProcurementReceipt` with timestamp, receiving actor, supplier, reference, lines, and `totalAmount`,
   - Increment `currentStock` on each matching `RawMaterial`, and
   - Append an inbound `StockMovement` record linked to the receipt ID.
2. WHEN the user records a **Direct Receipt** (without a prior PO), THE System SHALL perform the same atomic receipt, stock increment, and movement append operations.
3. THE System SHALL treat posted `ProcurementReceipt` and `StockMovement` entries as append-only; no UI control shall edit or delete a posted receipt.
4. IF any line quantity is invalid (<= 0 or non-integer) or the delivery reference is blank, THEN THE System SHALL block submission, show an inline validation error, and leave stock and PO state unchanged.

### Requirement 6: Raw Material Stock & Supplier Directory (PROC-06)

**User Story:** As a client evaluating procurement controls, I want to inspect live stock thresholds and manage the supplier directory so that I can see master data connected to operations.

#### Acceptance Criteria

1. WHILE viewing Raw Material Stock, THE System SHALL display SKU, material name, unit, current stock, minimum threshold, last unit cost, and a computed status badge (`CRITICAL` when `currentStock === 0`, `LOW` when `0 < currentStock <= minThreshold`, `OK` otherwise).
2. WHEN a user adds a new supplier via the **Add Supplier** dialog (name, category, contact name, phone/email, lead time in days), THE System SHALL validate non-empty required fields, append the supplier to state, and immediately make it selectable in new Purchase Orders and Direct Receipts.

