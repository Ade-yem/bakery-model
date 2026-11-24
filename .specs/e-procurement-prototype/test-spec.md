# TDD Test Specification

## Module: E-Procurement Interactive Prototype (`/workspace-preview/procurement`)

### Cadence — Operations & Reconciliation Platform (`apps/app`)

---

## 1. Strategy

Following the project's **Strict TDD Workflow** (`.agents/rules/guide.md` Section 13), tests are written and confirmed with the user **before** implementing domain logic, storage, or React components. Tests use **Vitest** (`pnpm --filter @repo/app test`) matching `apps/app/src/features/staff-workspace/reception/__tests__/`:
- **Domain Unit Tests**: Pure logic for integer-kobo math, PO creation, PO cancellation, atomic delivery receipt, stock status classification, and KPI derivation.
- **Storage Unit Tests**: `localStorage` loading, valid snapshot parsing, corrupted JSON preservation, and demo reset.
- **Component & Integration Tests**: Workspace routing across all 5 views, low-stock reorder prefill, dialog validation, and end-to-end PO -> Receipt -> Stock & Ledger update in the rendered UI.

## 2. Proposed Test Locations

```text
apps/app/src/features/staff-workspace/procurement/__tests__/
├── domain.test.ts        # Money math, KPI derivation, PO & Receipt atomic transitions
├── storage.test.ts       # localStorage validation, corrupt data safety, reset behavior
└── workspace.test.tsx    # Routing, 5 views, dialogs, accessibility, full E2E demo loop
```

## 3. Test Suites and Scenarios

### 3.1 Domain & Validation Tests (`domain.test.ts`)
- **TEST-PROC-001 — Integer Kobo Parsing & Totals**: `parseMoney` converts `"1250.50"` -> `125050` and rejects negative, >2 decimal, or malformed strings; `calculateLinesTotal` sums `quantity * unitCostKobo` and throws on non-positive quantity or negative cost.
- **TEST-PROC-002 — Stock Status Classification**: `getStockStatus` returns `'CRITICAL'` when `currentStock === 0`, `'LOW'` when `0 < currentStock <= minThreshold`, and `'OK'` when `currentStock > minThreshold`.
- **TEST-PROC-003 — Create Purchase Order Validation & Creation**: Rejects missing supplier, empty lines, or invalid quantities; on valid input, generates next sequential `PO-XXXX`, calculates `totalAmountKobo`, and sets `status: 'OPEN'`.
- **TEST-PROC-004 — Cancel Purchase Order**: Transitions `OPEN` PO to `CANCELLED` without modifying `materials`, `receipts`, or `movements`; throws an error when attempting to cancel a `RECEIVED` or `CANCELLED` PO.
- **TEST-PROC-005 — Atomic Delivery Receipt Against PO**: Given an `OPEN` PO, `receivePurchaseOrder` atomically marks PO `RECEIVED`, appends a `ProcurementReceipt` with matching lines/total, increments `RawMaterial.currentStock` for every line, and appends `INBOUND_PROCUREMENT` `StockMovement` entries.
- **TEST-PROC-006 — Direct Receipt & Invalid Reference Rejection**: `recordDirectReceipt` updates stock, receipt ledger, and movements without a `poId`; rejects blank `reference` or `quantity <= 0` leaving snapshot completely unchanged.
- **TEST-PROC-007 — Add Supplier & KPI Derivation**: `addSupplier` validates required fields and appends unique ID; `deriveProcurementKpis` computes exact counts and total spend in kobo from snapshot state.

### 3.2 Storage & Persistence Tests (`storage.test.ts`)
- **TEST-PROC-008 — Cold Start Seed**: `loadProcurementPreview` returns initial seeded fixtures (`suppliers`, `materials` with >= 2 low-stock items, `purchaseOrders`, `receipts`, `movements`) when `localStorage` is empty.
- **TEST-PROC-009 — Corrupt Storage Safety**: When `localStorage` contains invalid JSON or an inconsistent snapshot (e.g., unknown `supplierId` or negative stock), `loadProcurementPreview` returns a recoverable error and does NOT overwrite the stored raw string.
- **TEST-PROC-010 — Save & Reset Demo Data**: `saveProcurementPreview` persists valid snapshots; `resetProcurementPreview` restores initial fixtures cleanly.

### 3.3 UI & End-to-End Integration Tests (`workspace.test.tsx`)
- **TEST-PROC-011 — Route & Navigation Isolation**: Rendering `/workspace-preview/procurement` displays `StaffShell` with 5 Procurement navigation links (`Overview`, `Purchase Orders`, `Receipts & Ledger`, `Raw Material Stock`, `Suppliers`) and no Reception cash totals or Production batch tables.
- **TEST-PROC-012 — Low-Stock Reorder Prefill Flow**: Clicking **Reorder** on a low-stock item on Overview or Raw Material Stock opens `CreatePoDialog` pre-filled with that material and its preferred supplier.
- **TEST-PROC-013 — Complete Client Demo Loop (UI)**:
  1. User creates a new Purchase Order for *Bread Flour 50kg* (+10 bags).
  2. Navigates to **Purchase Orders**, opens **Receive Delivery**, enters invoice reference `INV-9981`, and submits.
  3. Verifies PO status becomes `RECEIVED`, **Raw Material Stock** increases by `10`, **Receipts & Ledger** shows `INV-9981`, and **Overview** spend KPI increases accordingly.
- **TEST-PROC-014 — Add Supplier & Unknown Route Fallback**: Adding a supplier makes it immediately selectable in `CreatePoDialog`; navigating to `/workspace-preview/procurement/unknown` renders the "Page not found" fallback with a link back to Overview.

