import { useDepartmentData } from '../integration/workspace';
import { validateBatchDraft, type BatchDraftValues } from './draft';
export interface BatchRecord {
  id: string;
  product: string;
  quantity: number;
  flour: string;
  waste: number;
  time: string;
  state: string;
  sync: string;
  recordedBy?: string;
  note?: string;
  sugar?: string;
  yeast?: string;
  accepted?: number;
  receivingNote?: string;
}
export const useProductionRecords = () => useDepartmentData('production').records;
export function makeBatch(input: BatchDraftValues, id: string): BatchRecord {
  const errors = validateBatchDraft(input);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  if (!input.product?.trim()) throw new Error('Choose a product.');
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
