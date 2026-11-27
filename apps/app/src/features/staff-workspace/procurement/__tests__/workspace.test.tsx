/** @file Integration and rendering tests for the hospital Procurement workspace preview. */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ProcurementWorkspace } from '../ProcurementWorkspace';
import { CreatePoDialog } from '../CreatePoDialog';
import { ProcurementOverview } from '../ProcurementOverview';
import { PurchaseOrdersPage } from '../PurchaseOrdersPage';
import { RawMaterialStockPage } from '../RawMaterialStockPage';
import { ReceiptsLedgerPage } from '../ReceiptsLedgerPage';
import { initialProcurementSnapshot } from '../data';
import {
  addSupplier,
  createPurchaseOrder,
  formatMoney,
  receivePurchaseOrder,
} from '../domain';

describe('Procurement workspace integration', () => {
  it('TEST-PROC-011: renders all 5 routes inside StaffShell with hospital context and strict role isolation', () => {
    for (const path of ['', '/purchase-orders', '/receipts', '/stock', '/suppliers']) {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[`/workspace-preview/procurement${path}`]}>
          <ProcurementWorkspace />
        </MemoryRouter>,
      );

      expect(html).toContain('Sample data');
      expect(html).toContain('Lagoon Specialist Hospital');
      expect(html).toContain('Central Medical Store');
      expect(html).toContain('Overview');
      expect(html).toContain('Purchase Orders');
      expect(html).toContain('Receipts &amp; Ledger');
      expect(html).toContain('Medical Stock');
      expect(html).toContain('Suppliers');
      expect(html).not.toMatch(/Tally Artisan Bakery|Bread Flour|Unsalted Butter/);
      expect(html).not.toMatch(/Network available|Sync queue not connected|Pending count unavailable/);
      expect(html).not.toMatch(/Customer credit|Push to Disbursement|Record a production batch|BAT-0186/);
    }
  });

  it('TEST-PROC-012: pre-fills CreatePoDialog with low-stock medical item and its preferred supplier', () => {
    const lowGloves = initialProcurementSnapshot.materials.find((m) => m.id === 'RM-001')!;
    const overviewHtml = renderToStaticMarkup(
      <MemoryRouter>
        <ProcurementOverview
          snapshot={initialProcurementSnapshot}
          onReorder={() => {}}
          onReset={() => {}}
        />
      </MemoryRouter>,
    );
    expect(overviewHtml).toContain('Sterile Nitrile Gloves');
    expect(overviewHtml).toContain('Reorder');

    const dialogHtml = renderToStaticMarkup(
      <CreatePoDialog
        snapshot={initialProcurementSnapshot}
        prefilledMaterial={lowGloves}
        onClose={() => {}}
        onSubmit={() => null}
      />,
    );
    expect(dialogHtml).toContain('Medline Surgical &amp; Diagnostics');
    expect(dialogHtml).toContain('Sterile Nitrile Gloves · Box of 100');
    expect(dialogHtml).toContain('18500');
  });

  it('TEST-PROC-013: reflects the complete PO -> Receive Delivery -> Stock & Ledger loop in UI views', () => {
    const afterPo = createPurchaseOrder(initialProcurementSnapshot, {
      supplierId: 'SUP-002',
      expectedDate: '2026-11-22',
      notes: 'Demo surgical gloves restock',
      lines: [{ materialId: 'RM-001', quantity: 10, unitCostKobo: 1850000 }],
    });
    const newPo = afterPo.purchaseOrders[0];
    expect(newPo.poNumber).toBe('PO-0103');

    const todayIso = new Date().toISOString();
    const afterReceive = receivePurchaseOrder(
      afterPo,
      {
        poId: newPo.id,
        reference: 'INV-9981',
        receivedBy: 'Kemi Adeyemi',
      },
      todayIso,
    );

    const poHtml = renderToStaticMarkup(
      <PurchaseOrdersPage
        snapshot={afterReceive}
        onCreate={() => {}}
        onReceive={() => {}}
        onDirectReceipt={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(poHtml).toContain('PO-0103');
    expect(poHtml).toContain('RECEIVED');

    const stockHtml = renderToStaticMarkup(
      <RawMaterialStockPage
        materials={afterReceive.materials}
        suppliers={afterReceive.suppliers}
        onReorder={() => {}}
      />,
    );
    expect(stockHtml).toContain('<strong>16</strong> box');

    const ledgerHtml = renderToStaticMarkup(
      <ReceiptsLedgerPage
        receipts={afterReceive.receipts}
        movements={afterReceive.movements}
        suppliers={afterReceive.suppliers}
        onRecordDirectReceipt={() => {}}
      />,
    );
    expect(ledgerHtml).toContain('INV-9981');
    expect(ledgerHtml).toContain(formatMoney(18500000));

    const overviewHtml = renderToStaticMarkup(
      <ProcurementOverview
        snapshot={afterReceive}
        onReorder={() => {}}
        onReset={() => {}}
      />,
    );
    expect(overviewHtml).toContain(formatMoney(18500000));
  });

  it('TEST-PROC-014: makes newly added suppliers selectable and renders fallback for unknown routes', () => {
    const withNewSupplier = addSupplier(initialProcurementSnapshot, {
      name: 'Emzor Pharmaceutical Supply',
      category: 'Pharmaceuticals & IV Fluids',
      contactName: 'Seyi Balogun',
      phone: '+234 802 111 2233',
      email: 'supply@emzor-sample.ng',
      leadTimeDays: 2,
    });
    const dialogHtml = renderToStaticMarkup(
      <CreatePoDialog
        snapshot={withNewSupplier}
        prefilledMaterial={null}
        onClose={() => {}}
        onSubmit={() => null}
      />,
    );
    expect(dialogHtml).toContain('Emzor Pharmaceutical Supply');

    const notFoundHtml = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/workspace-preview/procurement/unknown']}>
        <ProcurementWorkspace />
      </MemoryRouter>,
    );
    expect(notFoundHtml).toContain('Page not found');
    expect(notFoundHtml).toContain('Return to overview');
  });
});
