# Design Document

## Module: E-Procurement Interactive Prototype (`/workspace-preview/procurement`)

### Cadence — Operations & Reconciliation Platform (`apps/app`)

---

## Overview

The E-Procurement Prototype extends `apps/app/src/features/staff-workspace/` with a self-contained `procurement/` module modeled directly on `reception/`. It delivers a fast, deterministic client demo without modifying the NestJS API or database schemas, while honoring Cadence's core domain invariants: append-only receipt/stock movement ledgers, atomic PO-to-receipt transitions, decimal-safe integer kobo arithmetic, and strict role/department boundaries.

## Current Architecture and Evidence

| Concern | Existing implementation | Design implication |
|---|---|---|
| Routing & Preview Shell | `apps/app/src/App.tsx` maps `/workspace-preview/reception/*` and `/workspace-preview/*` | Register `<Route path="/workspace-preview/procurement/*" element={<ProcurementWorkspace />} />` above the `*` fallback in `App.tsx`. |
| Layout & Navigation | `apps/app/src/features/staff-workspace/StaffShell.tsx` & `access.ts` render sidebar, topbar, `GlobalSyncStatus`, and preview banner | Reuse `StaffShell` with `procurementAccess`, `navigationLabels`, and `extraLinks` so all 5 procurement views share identical chrome and accessibility behavior. |
| Styles & Tokens | `apps/app/src/features/staff-workspace/workspace.css`, `reception/reception.css`, and `apps/app/src/styles/global.css` | Reuse `.sw-*` layout/table/dialog classes and add scoped `.pr-*` classes in `procurement.css` using `--color-*` tokens (`--color-copper`, `--color-verdigris`, `--color-flour`, etc.). |
| Money & Validation | `apps/app/src/features/staff-workspace/reception/orders.ts` (`parseMoney`, integer kobo totals) | Reuse integer-kobo math (`parseMoney`, `formatMoney`, `calculateLinesTotal`) in `procurement/domain.ts` so currency calculations are exact and consistent. |
| Persistence & Recovery | `apps/app/src/features/staff-workspace/reception/storage.ts` (`loadReceptionPreview`) | Implement `procurement/storage.ts` with `cadence:procurement-preview:v1`, strict schema validation on load, and non-destructive error reporting. |
| Backend Suppliers API | `apps/api/src/suppliers/suppliers.controller.ts` exists for authenticated tenants, but no `procurement` or `inventory` API modules exist yet | Keep prototype 100% client-side under `/workspace-preview/procurement` and align entity fields (`name`, `category`, `contactName`, `phone`, `email`) with `CreateSupplierDto` for future API wiring. |

## Architecture

```text
+-------------------------------------------------------------------------+
| apps/app/src/App.tsx                                                    |
|   Route: /workspace-preview/procurement/*                               |
+-----------------------------------+-------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| ProcurementWorkspace.tsx (Feature Root & State Controller)              |
|  - Loads/saves ProcurementSnapshot via storage.ts (localStorage)        |
|  - Exposes pure domain transitions: createPO, receiveDelivery,          |
|    cancelPO, addSupplier, resetDemo                                     |
|  - Renders inside StaffShell (GlobalSyncStatus + Sidebar + Topbar)      |
+------+-------------+----------------+------------------+----------------+
       |             |                |                  |
       v             v                v                  v
+------------+ +-------------+ +--------------+ +----------------+
| Overview   | | Purchase    | | Receipts &   | | Stock &        |
| Home       | | Orders Page | | Ledger Page  | | Suppliers Pages|
+------------+ +------+------+ +--------------+ +--------+-------+
                      |                                  |
                      v                                  v
              +---------------+                  +---------------+
              | CreatePoDialog|                  | AddSupplier   |
              | ReceivePo     |                  | Dialog        |
              | Dialog        |                  |               |
              +---------------+                  +---------------+
```

### Core Workflow / Lifecycle / State Machine

```text
RawMaterial (currentStock <= minThreshold)
   │ [Click "Reorder"]
   ▼
PurchaseOrder (status = "OPEN") ──[Cancel PO]──▶ PurchaseOrder (status = "CANCELLED")
   │
   │ [Receive Delivery: valid reference + qty > 0]
   ▼ (Atomic State Transition)
1. PurchaseOrder.status ──▶ "RECEIVED"
2. Append ProcurementReceipt (immutable)
3. Increment RawMaterial.currentStock += receivedQty
4. Append StockMovement (type = "INBOUND_PROCUREMENT", receiptId)
```

- **Direct Receipt**: Skips step 1 (no `poId`) and executes steps 2, 3, and 4 atomically.
- **Immutability**: Once a `ProcurementReceipt` and its `StockMovement`s are appended, no update/delete methods exist in the domain layer.

### Data and Identity Contracts

All types reside in `apps/app/src/features/staff-workspace/procurement/types.ts`:

- `Supplier`:
  - `id: string` (`SUP-001`), `name: string`, `category: string`, `contactName: string`, `phone: string`, `email: string`, `leadTimeDays: number`
- `RawMaterial`:
  - `id: string` (`RM-001`), `sku: string`, `name: string`, `unit: string`, `currentStock: number`, `minThreshold: number`, `lastUnitCostKobo: number`, `preferredSupplierId: string`
- `ProcurementLine`:
  - `materialId: string`, `materialName: string`, `unit: string`, `quantity: number`, `unitCostKobo: number`
- `PurchaseOrder`:
  - `id: string` (`PO-0101`), `poNumber: string`, `supplierId: string`, `status: 'OPEN' | 'RECEIVED' | 'CANCELLED'`, `createdAt: string`, `expectedDate: string`, `lines: ProcurementLine[]`, `totalAmountKobo: number`, `notes: string`
- `ProcurementReceipt`:
  - `id: string` (`REC-0201`), `receiptNumber: string`, `poId: string | null`, `supplierId: string`, `reference: string`, `receivedAt: string`, `receivedBy: string`, `lines: ProcurementLine[]`, `totalAmountKobo: number`, `notes: string`
- `StockMovement`:
  - `id: string` (`MOV-0301`), `materialId: string`, `type: 'INBOUND_PROCUREMENT'`, `quantityDelta: number`, `receiptId: string`, `createdAt: string`, `actor: string`
- `ProcurementSnapshot`:
  - `suppliers: Supplier[]`, `materials: RawMaterial[]`, `purchaseOrders: PurchaseOrder[]`, `receipts: ProcurementReceipt[]`, `movements: StockMovement[]`

### API and Service Boundaries

- No network calls are executed in `/workspace-preview/procurement`.
- All business mutations are implemented as **pure, deterministic reducer/transition functions** in `procurement/domain.ts`, enabling 100% unit-test coverage without DOM or browser storage mocks.
- Storage serialization and defensive validation (`parseProcurementSnapshot`) live in `procurement/storage.ts`.

### UI and Interaction Design

- **File & Component Size Limits**: Every file <= 500 LOC; every React component <= 200 LOC (per `.agents/rules/guide.md`).
- **Accessibility & Focus**:
  - Dialogs (`CreatePoDialog`, `ReceivePoDialog`, `AddSupplierDialog`) use `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Escape-key close, and accessible form labels.
  - Status badges and KPI updates announce feedback cleanly via `role="status"` live regions (`sw-feedback`).
  - Tabular monetary values use `font-variant-numeric: tabular-nums` and `.pr-money` styling.
- **Responsive Design**: Tables use `.sw-table-scroll`; grids adapt cleanly from mobile (`< 768px`) to desktop (`>= 1024px`) following `workspace.css` and `responsive.css`.

