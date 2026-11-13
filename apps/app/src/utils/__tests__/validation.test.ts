import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateRequired,
  validatePassword,
  validatePasswordMatch,
  validateLoginForm,
  validateForgotPasswordForm,
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

  describe('validateForgotPasswordForm', () => {
    it('returns error when email is empty', () => {
      const res = validateForgotPasswordForm({ email: '' });
      expect(res.isValid).toBe(false);
      expect(res.errors.email).toBe('Email address is required');
    });

    it('returns error for invalid email syntax', () => {
      const res = validateForgotPasswordForm({ email: 'invalid-email' });
      expect(res.isValid).toBe(false);
      expect(res.errors.email).toBe('Please enter a valid email address');
    });

    it('succeeds for valid email address', () => {
      const res = validateForgotPasswordForm({ email: 'owner@business.com' });
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
        agreeToTerms: false,
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.businessName).toBeDefined();
      expect(res.errors.fullName).toBeDefined();
      expect(res.errors.email).toBeDefined();
      expect(res.errors.username).toBeDefined();
      expect(res.errors.password).toBeDefined();
      expect(res.errors.confirmPassword).toBeDefined();
      expect(res.errors.agreeToTerms).toBeDefined();
    });

    it('requires terms of service and privacy policy acceptance', () => {
      const res = validateRegisterForm({
        businessName: 'Golden Crust Bakery',
        fullName: 'Alex Miller',
        email: 'alex@goldencrust.com',
        username: 'alexmiller',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        agreeToTerms: false,
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.agreeToTerms).toBe(
        'You must accept the Terms of Service and Privacy Policy to continue'
      );
    });

    it('succeeds for complete valid registration', () => {
      const res = validateRegisterForm({
        businessName: 'Golden Crust Bakery',
        fullName: 'Alex Miller',
        email: 'alex@goldencrust.com',
        username: 'alexmiller',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        agreeToTerms: true,
      });
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors)).toHaveLength(0);
    });
  });
});
