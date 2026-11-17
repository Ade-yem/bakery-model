import { describe, it, expect } from 'vitest';
import { formatCurrency, calculateAnnualSavings } from '../format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('formats round dollar amounts cleanly', () => {
      expect(formatCurrency(49)).toBe('$49');
      expect(formatCurrency(0)).toBe('$0');
    });

    it('formats decimal amounts with two decimal places', () => {
      expect(formatCurrency(49.5)).toBe('$49.50');
      expect(formatCurrency(99.99)).toBe('$99.99');
    });
  });

  describe('calculateAnnualSavings', () => {
    it('calculates savings percentage between monthly and annual plan', () => {
      // monthly: 49/mo -> 588/yr. annual: 39/mo -> 468/yr -> ~20%
      const savings = calculateAnnualSavings(49, 39);
      expect(savings).toBe(20);
    });

    it('returns 0 when no monthly difference', () => {
      expect(calculateAnnualSavings(50, 50)).toBe(0);
    });
  });
});
