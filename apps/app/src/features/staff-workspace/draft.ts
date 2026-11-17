/** @file Local draft field checks; backend rules govern posted production. */
export interface BatchDraftValues {
  product?: string;
  output: string;
  flour: string;
  waste: string;
  note: string;
}
/**
 * @description Validates basic quantity shape without inventing production yield constraints.
 * @param values Unposted sample production input with explicit field units.
 * @returns Field-specific errors; an empty object indicates a well-formed local draft.
 */
export function validateBatchDraft(
  values: BatchDraftValues
): Partial<Record<keyof BatchDraftValues, string>> {
  const errors: Partial<Record<keyof BatchDraftValues, string>> = {};
  if (
    !values.output.trim() ||
    !Number.isSafeInteger(Number(values.output)) ||
    Number(values.output) <= 0
  )
    errors.output = 'Enter a positive whole number of units.';
  if (!values.flour.trim() || !Number.isFinite(Number(values.flour)) || Number(values.flour) <= 0)
    errors.flour = 'Enter a positive quantity of flour bags.';
  if (
    !values.waste.trim() ||
    !Number.isSafeInteger(Number(values.waste)) ||
    Number(values.waste) < 0
  )
    errors.waste = 'Enter a whole number of units, including zero.';
  if (!errors.waste && Number(values.waste) > 0 && !values.note.trim())
    errors.note = 'Explain the recorded scrap or waste.';
  return errors;
}
/**
 * @description Recovers only known string fields from an untrusted preview draft.
 * @param raw Browser-stored JSON or no prior entry.
 * @returns Recoverable draft fields, or null for missing/corrupt data.
 */
export function parseBatchDraft(raw: string | null): BatchDraftValues | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== 'object' ||
      !('output' in value) ||
      !('flour' in value) ||
      !('waste' in value) ||
      !('note' in value)
    )
      return null;
    if (
      typeof value.output !== 'string' ||
      typeof value.flour !== 'string' ||
      typeof value.waste !== 'string' ||
      typeof value.note !== 'string'
    )
      return null;
    const draft: BatchDraftValues = {
      output: value.output,
      flour: value.flour,
      waste: value.waste,
      note: value.note,
    };
    if (
      'product' in value &&
      (value.product === 'Family loaf · 500g' || value.product === 'Sandwich bread · 1kg')
    )
      draft.product = value.product;
    return draft;
  } catch {
    return null;
  }
}
