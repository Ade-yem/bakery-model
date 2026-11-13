import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateRequired,
  validatePassword,
  validatePasswordMatch,
  validateContactForm,
  validateLoginForm,
  validateRegisterForm,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('returns error when email is empty', () => {
      const res = validateEmail('');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Email address is required');
    });

    it('returns error for invalid email formats', () => {
      expect(validateEmail('not-an-email').isValid).toBe(false);
      expect(validateEmail('user@').isValid).toBe(false);
      expect(validateEmail('@domain.com').isValid).toBe(false);
      expect(validateEmail('user@domain').isValid).toBe(false);
    });

    it('returns valid for well-formed emails', () => {
      expect(validateEmail('baker@tallybakery.com').isValid).toBe(true);
      expect(validateEmail('admin.bakery@domain.co.uk').isValid).toBe(true);
    });
  });

  describe('validateRequired', () => {
    it('returns error when value is empty or only whitespace', () => {
      expect(validateRequired('', 'Business name').isValid).toBe(false);
      expect(validateRequired('   ', 'Business name').isValid).toBe(false);
    });

    it('returns valid when non-empty string is provided', () => {
      const res = validateRequired('Artisan Breads Ltd', 'Business name');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });
  });

  describe('validatePassword', () => {
    it('rejects passwords shorter than 8 characters', () => {
      const res = validatePassword('Pass1');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('at least 8 characters');
    });

    it('accepts passwords with 8 or more characters', () => {
      const res = validatePassword('SecurePass123!');
      expect(res.isValid).toBe(true);
    });
  });

  describe('validatePasswordMatch', () => {
    it('rejects passwords that do not match', () => {
      const res = validatePasswordMatch('Password123!', 'DifferentPass456!');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Passwords do not match');
    });

    it('accepts identical passwords', () => {
      const res = validatePasswordMatch('Password123!', 'Password123!');
      expect(res.isValid).toBe(true);
    });
  });

  describe('validateContactForm', () => {
    it('identifies missing fields', () => {
      const res = validateContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.name).toBeDefined();
      expect(res.errors.email).toBeDefined();
      expect(res.errors.subject).toBeDefined();
      expect(res.errors.message).toBeDefined();
    });

    it('passes for complete valid data', () => {
      const res = validateContactForm({
        name: 'Jane Baker',
        email: 'jane@bakery.com',
        subject: 'Multi-branch inquiry',
        message: 'We have 3 branches and need inventory tracking.',
      });
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors)).toHaveLength(0);
    });
  });

  describe('validateLoginForm', () => {
    it('validates credentials presence', () => {
      const res = validateLoginForm({ identifier: '', password: '' });
      expect(res.isValid).toBe(false);
      expect(res.errors.identifier).toBeDefined();
      expect(res.errors.password).toBeDefined();
    });

    it('succeeds with identifier and valid password', () => {
      const res = validateLoginForm({ identifier: 'admin@tallybakery.com', password: 'Password123' });
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors)).toHaveLength(0);
    });
  });

  describe('validateRegisterForm', () => {
    it('validates all required registration fields and password confirmation', () => {
      const res = validateRegisterForm({
        businessName: '',
        fullName: '',
        email: 'bad-email',
        username: '',
        password: '123',
        confirmPassword: '456',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.businessName).toBeDefined();
      expect(res.errors.fullName).toBeDefined();
      expect(res.errors.email).toBeDefined();
      expect(res.errors.username).toBeDefined();
      expect(res.errors.password).toBeDefined();
      expect(res.errors.confirmPassword).toBeDefined();
    });

    it('succeeds for complete valid registration', () => {
      const res = validateRegisterForm({
        businessName: 'Golden Crust Bakery',
        fullName: 'Alex Miller',
        email: 'alex@goldencrust.com',
        username: 'alexmiller',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      });
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors)).toHaveLength(0);
    });
  });
});
