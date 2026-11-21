/**
 * @file Forgot Password form component with left icon badges, clean borders, and feedback states.
 */

import React, { useState, useEffect } from 'react';
import { requireAuthClient, useAuth } from '../../features/integration/auth';
import { Mail, CheckCircle2, ArrowLeft, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { validateForgotPasswordForm } from '../../utils/validation';
import { maskEmail } from '../../utils/format';
import type { ForgotPasswordFormValues } from '../../types';

export interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

/**
 * @description Accessible form inputs for requesting a password reset email with 30s rate-limit cooldown.
 * @param {ForgotPasswordFormProps} props - Callbacks.
 * @returns {React.ReactElement} Forgot password form element.
 */
export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps): React.ReactElement {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [values, setValues] = useState<ForgotPasswordFormValues>({
    email: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordFormValues, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // 30-second cooldown timer for the Resend action
  useEffect(() => {
    if (!isSubmitted || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof ForgotPasswordFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateForgotPasswordForm(values);

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    if (pending) return;
    setPending(true);
    setRequestError('');
    try {
      await requireAuthClient(auth.client).requestPasswordReset(values.email);
      setIsSubmitted(true);
      setResendNotice(null);
      setCountdown(30);
      onSuccess?.();
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : 'Unable to request a reset link. Please retry.'
      );
    } finally {
      setPending(false);
    }
  };
  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setRequestError('');
    try {
      await requireAuthClient(auth.client).requestPasswordReset(values.email);
      setResendNotice('If your account is eligible, a new reset link will be sent.');
      setCountdown(30);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to resend. Please retry.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      {(!auth.client || auth.client.passwordResetAvailable === false) && (
        <p role="status" className="mb-4 text-sm">
          Password reset is currently unavailable. Please try again later.
        </p>
      )}
      {requestError && (
        <p role="alert" className="mb-4 text-sm">
          {requestError}
        </p>
      )}
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <fieldset disabled={pending} className="sw-form-fields space-y-4">
            <p className="text-xs text-oven-black/70 leading-relaxed font-sans">
              Enter your business email address and we&apos;ll send you a link to reset your
              password.
            </p>

            {/* Email Address Field */}
            <div>
              <div
                className={`flex items-center rounded-md border bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-verdigris ${
                  errors.email ? 'border-[#B3261E]' : 'border-rule'
                }`}
              >
                <div className="flex items-center justify-center px-3.5 py-2.5 text-verdigris border-r border-[#E5E0D0] bg-[#F9F7F1]/60">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="Business Email Address"
                  aria-label="Business Email Address"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'forgot-email-err' : undefined}
                  className="w-full px-3.5 py-2.5 text-sm text-oven-black placeholder-oven-black/40 focus:outline-none bg-transparent font-sans"
                />
              </div>
              {errors.email && (
                <p id="forgot-email-err" className="text-xs text-[#B3261E] mt-1 pl-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pending || !auth.client || auth.client.passwordResetAvailable === false}
              className="w-full mt-2 py-2.5 px-4 rounded-md bg-verdigris hover:bg-[#08484E] text-white font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-verdigris cursor-pointer"
            >
              Send Reset Link
            </button>
          </fieldset>
        </form>
      ) : (
        <div className="space-y-5 animate-fade-in font-sans">
          {/* Clean Message Box */}
          <div className="p-4 rounded-xl bg-flour border border-rule text-center space-y-2">
            <div className="w-9 h-9 rounded-full bg-verdigris/10 text-verdigris flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5 text-verdigris" />
            </div>
            <h2 className="text-sm font-bold text-oven-black">Check your email</h2>
            <p className="text-xs text-oven-black/70 leading-relaxed max-w-xs mx-auto">
              If an eligible account exists, a password reset link will be sent to{' '}
              <span className="font-semibold text-oven-black">{maskEmail(values.email)}</span>.
            </p>
          </div>

          {resendNotice && (
            <p className="text-xs text-center text-[#3F7A2A] font-medium animate-fade-in">
              {resendNotice}
            </p>
          )}

          {/* Resend Action Button with 30s Cooldown */}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || countdown > 0}
            className="w-full py-2.5 px-4 rounded-md border border-rule bg-white hover:bg-[#F9F7F1] text-oven-black font-medium text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-flour/50"
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-verdigris ${isResending ? 'animate-spin' : ''}`}
            />
            <span>
              {isResending
                ? 'Sending...'
                : countdown > 0
                  ? `Resend available in ${countdown}s`
                  : 'Resend Email'}
            </span>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setResendNotice(null);
                setCountdown(30);
              }}
              className="text-xs text-verdigris hover:underline cursor-pointer"
            >
              Use a different email address
            </button>
          </div>
        </div>
      )}

      {/* Return to Login Link */}
      <div className="mt-5 pt-4 border-t border-[#E5E0D0] text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-verdigris hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
