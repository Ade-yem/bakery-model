/** @file Draft validation is separate from authoritative production posting. */
import { describe, expect, it } from 'vitest';
import { validateBatchDraft } from '../draft';
describe('Production draft validation', () => {
  it('accepts explicit output, material and waste quantities', () => {
    expect(
      validateBatchDraft({ output: '250', flour: '5', waste: '2', note: 'Two damaged units' })
    ).toEqual({});
  });
  it('rejects empty, fractional and negative finished units', () => {
    for (const output of ['', '0', '-1', '2.5', 'NaN']) {
      expect(validateBatchDraft({ output, flour: '5', waste: '0', note: '' })).toHaveProperty(
        'output'
      );
    }
  });
  it('rejects invalid raw materials and waste', () => {
    expect(validateBatchDraft({ output: '10', flour: '-1', waste: '1.5', note: '' })).toEqual({
      flour: expect.any(String),
      waste: expect.any(String),
    });
  });
  it('requires a waste note without rejecting a valid yield variation', () => {
    expect(
      validateBatchDraft({ output: '240', flour: '5', waste: '2', note: '' })
    ).not.toHaveProperty('output');
    expect(validateBatchDraft({ output: '240', flour: '5', waste: '2', note: '' })).toHaveProperty(
      'note'
    );
  });
});

describe('Preview draft recovery', () => {
  it('recovers a well-formed browser draft without trusting unknown properties', async () => {
    const { parseBatchDraft } = await import('../draft');
    expect(
      parseBatchDraft('{"output":"123","flour":"3","waste":"0","note":"Saved","role":"owner"}')
    ).toEqual({ output: '123', flour: '3', waste: '0', note: 'Saved' });
  });
  it('handles missing, corrupt and wrongly typed browser data safely', async () => {
    const { parseBatchDraft } = await import('../draft');
    for (const value of [null, 'invalid', '[]', 'null', '{"output":123}'])
      expect(parseBatchDraft(value)).toBeNull();
  });
});
