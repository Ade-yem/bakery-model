/**
 * @file Unit tests for application formatting utilities.
 */

import { describe, it, expect } from 'vitest';
import { maskEmail } from '../format';

describe('Formatting Utilities', () => {
  describe('maskEmail', () => {
    it('masks long email address preserving first char and last two chars of local part', () => {
      expect(maskEmail('gbenlekamolideen2020@gmail.com')).toBe('g***20@gmail.com');
      expect(maskEmail('john.doe@example.com')).toBe('j***oe@example.com');
      expect(maskEmail('support@cadence.com')).toBe('s***rt@cadence.com');
    });

    it('masks short local parts gracefully', () => {
      expect(maskEmail('al@cadence.com')).toBe('a***l@cadence.com');
      expect(maskEmail('bob@cadence.com')).toBe('b***ob@cadence.com');
      expect(maskEmail('x@cadence.com')).toBe('x***@cadence.com');
    });

    it('returns empty string or unformatted string for empty/malformed inputs', () => {
      expect(maskEmail('')).toBe('');
      expect(maskEmail('notanemail')).toBe('notanemail');
      expect(maskEmail('@domain.com')).toBe('@domain.com');
    });
  });
});
