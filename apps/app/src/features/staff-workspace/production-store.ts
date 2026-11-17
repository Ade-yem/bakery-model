import { readRecord } from './journal/store';
import { createContext, useContext } from 'react';
import { productionRecords } from '../mock-auth/production-data';
import { validateBatchDraft, type BatchDraftValues } from './draft';
export type BatchRecord = (typeof productionRecords)[number] & {
  note?: string;
  sugar?: string;
  yeast?: string;
  accepted?: number;
  receivingNote?: string;
};
export const ProductionRecords = createContext<BatchRecord[]>(productionRecords);
export const useProductionRecords = () => useContext(ProductionRecords);
export const batchKey = 'tallybakery:production-records:v1';
export function makeBatch(input: BatchDraftValues, id: string): BatchRecord {
  const errors = validateBatchDraft(input);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  if (!['Family loaf · 500g', 'Sandwich bread · 1kg'].includes(input.product ?? ''))
    throw new Error('Choose a listed product.');
  if (!/^BAT-[a-z0-9-]+$/i.test(id)) throw new Error('Invalid batch reference.');
  return {
    id,
    product: input.product!,
    quantity: Number(input.output),
    flour: `${input.flour} bags`,
    sugar: input.sugar ?? '0',
    yeast: input.yeast ?? '0',
    waste: Number(input.waste),
    note: input.note.trim(),
    time: new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Lagos',
    }),
    state: 'Pending acceptance',
    sync: 'Pending acknowledgement',
  };
}
export function loadBatches(): { records: BatchRecord[]; error: string } {
  if (typeof window === 'undefined') return { records: productionRecords, error: '' };
  try {
    const raw = readRecord(batchKey);
    if (!raw) return { records: productionRecords, error: '' };
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved) || saved.length > 10000) throw new Error();
    const ids = new Set(productionRecords.map((r) => r.id));
    for (const record of saved) {
      if (
        !record ||
        typeof record.id !== 'string' ||
        ids.has(record.id) ||
        typeof record.flour !== 'string' ||
        typeof record.note !== 'string' ||
        typeof record.time !== 'string' ||
        record.state !== 'Pending acceptance'
      )
        throw new Error();
      const valid = makeBatch(
        {
          product: record.product,
          output: String(record.quantity),
          flour: record.flour.replace(/ bags$/, ''),
          waste: String(record.waste),
          note: record.note,
          sugar: record.sugar,
          yeast: record.yeast,
        },
        record.id
      );
      if (valid.quantity !== record.quantity || valid.waste !== record.waste) throw new Error();
      ids.add(record.id);
    }
    return { records: [...saved, ...productionRecords], error: '' };
  } catch {
    return {
      records: [],
      error:
        'Saved batch records cannot be read. They have not been overwritten. Allow storage or restore valid records, then retry.',
    };
  }
}
