import { describe, expect, it } from 'vitest';
import { makeBatch } from '../production-store';
describe('production submission', () => {
  it('submits output as pending acceptance, never available stock', () => {
    const batch = makeBatch(
      {
        product: 'Family loaf · 500g',
        output: '200',
        flour: '4',
        waste: '2',
        note: 'Two burnt units',
      },
      'BAT-new'
    );
    expect(batch.quantity).toBe(200);
    expect(batch.state).toBe('Pending acceptance');
    expect(batch.sync).toBe('Pending acknowledgement');
  });
  it('rejects unsupported products and invalid quantities', () => {
    expect(() =>
      makeBatch({ product: 'Unknown', output: '0', flour: '-1', waste: '0', note: '' }, 'BAT-new')
    ).toThrow();
  });
});

it('retains explicit sugar and yeast units without exposing them in receiving projections', () => {
  const batch = makeBatch(
    {
      product: 'Family loaf · 500g',
      output: '150',
      flour: '3',
      sugar: '2.5',
      yeast: '0.125',
      waste: '0',
      note: '',
    },
    'BAT-materials'
  );
  expect(batch.sugar).toBe('2.5');
  expect(batch.yeast).toBe('0.125');
  expect(() =>
    makeBatch(
      {
        product: 'Family loaf · 500g',
        output: '150',
        flour: '3',
        sugar: '-2',
        yeast: '0',
        waste: '0',
        note: '',
      },
      'BAT-materials'
    )
  ).toThrow();
});
