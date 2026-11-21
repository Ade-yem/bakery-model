/** @file Local draft field checks; backend rules govern posted production. */
export interface BatchDraftValues {
  product?: string;
  output: string;
  flour: string;
  sugar?: string;
  yeast?: string;
  waste: string;
  note: string;
}
/**
 * @description Validates basic quantity shape without inventing production yield constraints.
 * @param values Unposted production input with explicit field units.
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
  for (const field of ['sugar', 'yeast'] as const) {
    if (values[field] !== undefined && typeof values[field] !== 'string') {
      errors[field] = 'Enter a valid kilogram quantity.';
      continue;
    }
    if (
      values[field] !== undefined &&
      (typeof values[field] !== 'string' ||
        !/^\d{1,7}(\.\d{1,3})?$/.test(values[field]!) ||
        !Number.isFinite(Number(values[field])))
    )
      errors[field] = 'Enter a nonnegative kilogram quantity with up to three decimal places.';
  }
  if (values.note.length > 500) errors.note = 'Keep production notes within 500 characters.';
  if (!errors.waste && Number(values.waste) > 0 && !values.note.trim())
    errors.note = 'Explain the recorded scrap or waste.';
  return errors;
}
/**
 * @description Recovers only known string fields from an untrusted workspace draft.
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
      typeof value.product === 'string' &&
      value.product.trim().length > 0 &&
      value.product.length <= 200
    )
      draft.product = value.product;
    if ('sugar' in value) {
      if (typeof value.sugar !== 'string') return null;
      draft.sugar = value.sugar;
    }
    if ('yeast' in value) {
      if (typeof value.yeast !== 'string') return null;
      draft.yeast = value.yeast;
    }
    return draft;
  } catch {
    return null;
  }
}
