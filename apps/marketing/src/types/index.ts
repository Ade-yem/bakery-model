/**
 * @file Type definitions for TallyBakery public website.
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
 * Contact form input fields.
 */
export interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
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

/**
 * Subscription plan definition.
 */
export interface PricingPlan {
  id: 'starter' | 'growth' | 'business';
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  isPopular?: boolean;
  features: string[];
  departmentLimit: string;
  staffLimit: string;
  ctaText: string;
}

/**
 * Nav link representation.
 */
export interface NavItem {
  label: string;
  href: string;
}
