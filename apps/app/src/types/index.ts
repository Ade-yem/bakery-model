/**
 * @file Type definitions for TallyBakery application and authentication flows.
 */

/**
 * Validation result shape for single field validations.
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Generic multi-field form validation result.
 */
export interface FormValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

/**
 * Sign In form input fields.
 */
export interface LoginFormValues {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Forgot Password form input fields.
 */
export interface ForgotPasswordFormValues {
  email: string;
}

/**
 * Registration form input fields.
 */
export interface RegisterFormValues {
  businessName: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreeToTerms?: boolean;
}
