import { describe, expect, it } from 'vitest';
import { createReceipt, receiptTotal, parseReceipts, sampleReceipts } from './model';
const input = {
  id: 'REC-test',
  supplierId: 'mill',
  materialId: 'flour',
  quantity: '2.5',
  unitCost: '18500.25',
  reference: 'INV-203',
  receivedOn: '2026-11-14',
  note: '',
};
describe('procurement sample receipts', () => {
  it('calculates decimal quantities and money exactly', () => {
    expect(receiptTotal('2.5', '18500.25')).toBe(4625063);
    expect(receiptTotal('0.001', '5.00')).toBe(1);
  });
  it('validates positive decimals, dates and catalog selections', () => {
    for (const quantity of ['', '0', '-1', '1e3', '0.0001', 'Infinity'])
      expect(() => createReceipt({ ...input, quantity }, [])).toThrow();
    expect(() => createReceipt({ ...input, unitCost: '1.001' }, [])).toThrow();
    expect(() => createReceipt({ ...input, receivedOn: '2026-02-30' }, [])).toThrow();
    expect(() => createReceipt({ ...input, supplierId: 'unknown' }, [])).toThrow();
  });
  it('rejects duplicate reference per supplier and repeat submission IDs', () => {
    const receipt = createReceipt(input, []);
    expect(() =>
      createReceipt({ ...input, id: 'other', reference: ' inv-203 ' }, [receipt])
    ).toThrow();
    expect(() => createReceipt({ ...input, reference: 'OTHER' }, [receipt])).toThrow();
  });
  it('restores validated receipts and rejects tampered totals', () => {
    expect(parseReceipts(JSON.stringify(sampleReceipts))).toEqual(sampleReceipts);
    const receipt = createReceipt(input, []);
    expect(parseReceipts(JSON.stringify([{ ...receipt, total: 0 }]))).toBeNull();
    expect(parseReceipts('{')).toBeNull();
  });
});

it('records multiple material lines under one invoice with exact totals and recovery', () => {
  const receipt = createReceipt(
    {
      id: 'REC-multi',
      supplierId: 'mill',
      materialId: 'flour',
      quantity: '2',
      unitCost: '18500.25',
      reference: 'MULTI-01',
      receivedOn: '2026-11-16',
      note: '',
      additionalLines: [{ materialId: 'sugar', quantity: '1.5', unitCost: '1200.10' }],
    },
    []
  );
  expect(receipt.total).toBe(3880065);
  expect(receipt.additionalLines).toHaveLength(1);
  expect(parseReceipts(JSON.stringify([receipt]))).toEqual([receipt]);
});
