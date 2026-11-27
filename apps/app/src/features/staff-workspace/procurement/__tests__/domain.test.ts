/** @file Unit tests for procurement domain math, PO lifecycle, and atomic receipt transitions. */
import { describe, expect, it } from 'vitest';
import {
  addSupplier,
  calculateLinesTotal,
  cancelPurchaseOrder,
  createPurchaseOrder,
  deriveProcurementKpis,
  formatMoney,
  getStockStatus,
  parseMoney,
  receivePurchaseOrder,
  recordDirectReceipt,
} from '../domain';
import { initialProcurementSnapshot } from '../data';

describe('Procurement domain logic', () => {
  it('TEST-PROC-001: parses currency into integer kobo and computes line totals safely', () => {
    expect(parseMoney('1250.50')).toBe(125050);
    expect(parseMoney('0')).toBe(0);
    expect(parseMoney('18500')).toBe(1850000);
    for (const invalid of ['-5', '12.345', 'abc', '', '1e4', '9007199254740991']) {
      expect(parseMoney(invalid)).toBeNull();
    }

    expect(
      calculateLinesTotal([
        { quantity: 2, unitCostKobo: 1850000 },
        { quantity: 3, unitCostKobo: 3250000 },
      ]),
    ).toBe(13450000);

    expect(() => calculateLinesTotal([{ quantity: 0, unitCostKobo: 1000 }])).toThrow();
    expect(() => calculateLinesTotal([{ quantity: 1.5, unitCostKobo: 1000 }])).toThrow();
    expect(() => calculateLinesTotal([{ quantity: 2, unitCostKobo: -100 }])).toThrow();
    expect(formatMoney(13450000)).toBe('₦134,500.00');
  });

  it('TEST-PROC-002: classifies medical supply stock status accurately', () => {
    expect(getStockStatus(0, 4)).toBe('CRITICAL');
    expect(getStockStatus(6, 12)).toBe('LOW');
    expect(getStockStatus(12, 12)).toBe('LOW');
    expect(getStockStatus(14, 5)).toBe('OK');
  });

  it('TEST-PROC-003: validates and creates a new sequential Purchase Order', () => {
    expect(() =>
      createPurchaseOrder(initialProcurementSnapshot, {
        supplierId: 'SUP-UNKNOWN',
        expectedDate: '2026-11-22',
        lines: [{ materialId: 'RM-001', quantity: 5, unitCostKobo: 1850000 }],
      }),
    ).toThrow(/supplier/i);

    expect(() =>
      createPurchaseOrder(initialProcurementSnapshot, {
        supplierId: 'SUP-002',
        expectedDate: '2026-11-22',
        lines: [],
      }),
    ).toThrow(/line/i);

    const next = createPurchaseOrder(initialProcurementSnapshot, {
      supplierId: 'SUP-002',
      expectedDate: '2026-11-22',
      notes: 'Restock surgical gloves for theatre',
      lines: [{ materialId: 'RM-001', quantity: 10, unitCostKobo: 1850000 }],
    });

    expect(next.purchaseOrders[0].poNumber).toBe('PO-0103');
    expect(next.purchaseOrders[0].status).toBe('OPEN');
    expect(next.purchaseOrders[0].totalAmountKobo).toBe(18500000);
    expect(next.materials).toEqual(initialProcurementSnapshot.materials);
  });

  it('TEST-PROC-004: cancels an OPEN PO without altering stock and rejects cancelling finalized POs', () => {
    const cancelled = cancelPurchaseOrder(initialProcurementSnapshot, 'PO-0102');
    const po = cancelled.purchaseOrders.find((p) => p.id === 'PO-0102');
    expect(po?.status).toBe('CANCELLED');
    expect(cancelled.materials).toEqual(initialProcurementSnapshot.materials);
    expect(cancelled.receipts).toEqual(initialProcurementSnapshot.receipts);

    expect(() => cancelPurchaseOrder(initialProcurementSnapshot, 'PO-0101')).toThrow();
    expect(() => cancelPurchaseOrder(cancelled, 'PO-0102')).toThrow();
  });

  it('TEST-PROC-005: atomically receives an OPEN PO, increments stock, and appends receipt & movement', () => {
    const beforeSaline = initialProcurementSnapshot.materials.find((m) => m.id === 'RM-002')!;
    expect(beforeSaline.currentStock).toBe(0);

    const next = receivePurchaseOrder(initialProcurementSnapshot, {
      poId: 'PO-0102',
      reference: 'FD-INV-8821',
      receivedBy: 'Kemi Adeyemi',
      notes: 'Batch verified at pharmacy bay',
    });

    const po = next.purchaseOrders.find((p) => p.id === 'PO-0102')!;
    expect(po.status).toBe('RECEIVED');

    const afterSaline = next.materials.find((m) => m.id === 'RM-002')!;
    expect(afterSaline.currentStock).toBe(6);

    expect(next.receipts.length).toBe(initialProcurementSnapshot.receipts.length + 1);
    const newestReceipt = next.receipts[0];
    expect(newestReceipt.poId).toBe('PO-0102');
    expect(newestReceipt.reference).toBe('FD-INV-8821');
    expect(newestReceipt.totalAmountKobo).toBe(25200000);

    expect(next.movements.length).toBe(initialProcurementSnapshot.movements.length + 1);
    expect(next.movements[0]).toMatchObject({
      materialId: 'RM-002',
      type: 'INBOUND_PROCUREMENT',
      quantityDelta: 6,
      receiptId: newestReceipt.id,
      actor: 'Kemi Adeyemi',
    });

    expect(() =>
      receivePurchaseOrder(next, {
        poId: 'PO-0102',
        reference: 'DUP-001',
        receivedBy: 'Kemi Adeyemi',
      }),
    ).toThrow();
  });

  it('TEST-PROC-006: records a direct receipt and rejects blank references or invalid quantities', () => {
    expect(() =>
      recordDirectReceipt(initialProcurementSnapshot, {
        supplierId: 'SUP-003',
        reference: '   ',
        receivedBy: 'Kemi Adeyemi',
        lines: [{ materialId: 'RM-005', quantity: 4, unitCostKobo: 3250000 }],
      }),
    ).toThrow(/reference/i);

    const next = recordDirectReceipt(initialProcurementSnapshot, {
      supplierId: 'SUP-003',
      reference: 'BMD-INV-310',
      receivedBy: 'Kemi Adeyemi',
      lines: [{ materialId: 'RM-005', quantity: 4, unitCostKobo: 3250000 }],
    });

    const testKits = next.materials.find((m) => m.id === 'RM-005')!;
    expect(testKits.currentStock).toBe(7);
    expect(next.receipts[0].poId).toBeNull();
    expect(next.receipts[0].reference).toBe('BMD-INV-310');
    expect(next.movements[0].quantityDelta).toBe(4);
  });

  it('TEST-PROC-007: adds a validated supplier and derives KPIs from snapshot state', () => {
    expect(() =>
      addSupplier(initialProcurementSnapshot, {
        name: ' ',
        category: 'Lab Reagents & Kits',
        contactName: 'Ada',
        phone: '0800',
        email: 'a@b.com',
        leadTimeDays: 2,
      }),
    ).toThrow(/name/i);

    const withSupplier = addSupplier(initialProcurementSnapshot, {
      name: 'Emzor Pharmaceutical Supply',
      category: 'Pharmaceuticals & IV Fluids',
      contactName: 'Seyi Balogun',
      phone: '+234 802 111 2233',
      email: 'supply@emzor-sample.ng',
      leadTimeDays: 2,
    });
    expect(withSupplier.suppliers.length).toBe(4);
    expect(withSupplier.suppliers[3].id).toBe('SUP-004');

    const kpis = deriveProcurementKpis(initialProcurementSnapshot, '2026-11-20');
    expect(kpis).toEqual({
      openPoCount: 1,
      todaySpendKobo: 4750000,
      lowStockCount: 3,
      postedReceiptsCount: 1,
    });
  });
});
