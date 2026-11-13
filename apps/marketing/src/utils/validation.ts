/**
 * @file Form validation helpers with explicit JSDocs and clean type boundaries.
 */

import type {
  FieldValidationResult,
  FormValidationResult,
  ContactFormValues,
  LoginFormValues,
  RegisterFormValues,
} from '../types';

/**
 * Standard RFC-5322 simplified email regex pattern.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @description Validates an email address for presence and valid RFC syntax.
 * @param {string} email - The email string to validate.
 * @returns {FieldValidationResult} Object indicating validity and optional error message.
 * @example
 * ```ts
 * const res = validateEmail('user@domain.com');
 * if (!res.isValid) console.error(res.error);
 * ```
 */
export function validateEmail(email: string): FieldValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
}

/**
 * @description Validates that a string field is not empty or composed solely of whitespace.
 * @param {string} value - The input value to check.
 * @param {string} fieldName - Human-readable name of the field for error reporting.
 * @returns {FieldValidationResult} Object indicating validity and optional error message.
 * @example
 * ```ts
 * const res = validateRequired('Artisan', 'Business name');
 * ```
 */
export function validateRequired(value: string, fieldName: string): FieldValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

/**
 * @description Validates password strength (minimum 8 characters).
 * @param {string} password - The password string to validate.
 * @returns {FieldValidationResult} Object indicating validity and optional error message.
 */
export function validatePassword(password: string): FieldValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  return { isValid: true };
}

/**
 * @description Checks that two passwords match identically.
 * @param {string} password - The primary password.
 * @param {string} confirm - The confirmation password.
 * @returns {FieldValidationResult} Object indicating validity and optional error message.
 */
export function validatePasswordMatch(password: string, confirm: string): FieldValidationResult {
  if (!confirm) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  if (password !== confirm) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  return { isValid: true };
}

/**
 * @description Validates all fields of the contact form.
 * @param {ContactFormValues} values - Contact form input values.
 * @returns {FormValidationResult<ContactFormValues>} Validation status with keyed errors.
 */
export function validateContactForm(values: ContactFormValues): FormValidationResult<ContactFormValues> {
  const errors: Partial<Record<keyof ContactFormValues, string>> = {};

  const nameCheck = validateRequired(values.name, 'Full name');
  if (!nameCheck.isValid && nameCheck.error) errors.name = nameCheck.error;

  const emailCheck = validateEmail(values.email);
  if (!emailCheck.isValid && emailCheck.error) errors.email = emailCheck.error;

  const subjectCheck = validateRequired(values.subject, 'Subject');
  if (!subjectCheck.isValid && subjectCheck.error) errors.subject = subjectCheck.error;

  const msgCheck = validateRequired(values.message, 'Message');
  if (!msgCheck.isValid && msgCheck.error) errors.message = msgCheck.error;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * @description Validates login form inputs.
 * @param {LoginFormValues} values - Login form inputs.
 * @returns {FormValidationResult<LoginFormValues>} Validation status with keyed errors.
 */
export function validateLoginForm(values: LoginFormValues): FormValidationResult<LoginFormValues> {
  const errors: Partial<Record<keyof LoginFormValues, string>> = {};

  const idCheck = validateRequired(values.identifier, 'Email or username');
  if (!idCheck.isValid && idCheck.error) errors.identifier = idCheck.error;

  const pwCheck = validateRequired(values.password, 'Password');
  if (!pwCheck.isValid && pwCheck.error) errors.password = pwCheck.error;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * @description Validates registration form inputs.
 * @param {RegisterFormValues} values - Registration form inputs.
 * @returns {FormValidationResult<RegisterFormValues>} Validation status with keyed errors.
 */
export function validateRegisterForm(values: RegisterFormValues): FormValidationResult<RegisterFormValues> {
  const errors: Partial<Record<keyof RegisterFormValues, string>> = {};

  const bizCheck = validateRequired(values.businessName, 'Bakery business name');
  if (!bizCheck.isValid && bizCheck.error) errors.businessName = bizCheck.error;

  const nameCheck = validateRequired(values.fullName, 'Full name');
  if (!nameCheck.isValid && nameCheck.error) errors.fullName = nameCheck.error;

  const emailCheck = validateEmail(values.email);
  if (!emailCheck.isValid && emailCheck.error) errors.email = emailCheck.error;

  const userCheck = validateRequired(values.username, 'Username');
  if (!userCheck.isValid && userCheck.error) errors.username = userCheck.error;

  const pwCheck = validatePassword(values.password);
  if (!pwCheck.isValid && pwCheck.error) errors.password = pwCheck.error;

  const matchCheck = validatePasswordMatch(values.password, values.confirmPassword);
  if (!matchCheck.isValid && matchCheck.error) errors.confirmPassword = matchCheck.error;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
