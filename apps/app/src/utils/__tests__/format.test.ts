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
      expect(maskEmail('support@tallybakery.com')).toBe('s***rt@tallybakery.com');
    });

    it('masks short local parts gracefully', () => {
      expect(maskEmail('al@tallybakery.com')).toBe('a***l@tallybakery.com');
      expect(maskEmail('bob@tallybakery.com')).toBe('b***ob@tallybakery.com');
      expect(maskEmail('x@tallybakery.com')).toBe('x***@tallybakery.com');
    });

    it('returns empty string or unformatted string for empty/malformed inputs', () => {
      expect(maskEmail('')).toBe('');
      expect(maskEmail('notanemail')).toBe('notanemail');
      expect(maskEmail('@domain.com')).toBe('@domain.com');
    });
  });
});
