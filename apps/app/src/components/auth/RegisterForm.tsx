/**
 * @file Registration Form inputs with reference styling (left icon badges, clean borders).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requireAuthClient, useAuth } from '../../features/integration/auth';
import { Building2, User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { validateRegisterForm } from '../../utils/validation';
import type { RegisterFormValues } from '../../types';

export interface RegisterFormProps {
  selectedPlan: string;
}

/**
 * @description Form component handling new bakery account inputs and validation.
 * @param {RegisterFormProps} props - Plan context.
 * @returns {React.ReactElement} Form element.
 */
export function RegisterForm({ selectedPlan }: RegisterFormProps): React.ReactElement {
  const auth = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [values, setValues] = useState<RegisterFormValues>({
    businessName: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((prev: RegisterFormValues) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof RegisterFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setStatusNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateRegisterForm(values);

    if (!result.isValid) {
      setErrors(result.errors);
      setStatusNotice(null);
      return;
    }

    setErrors({});
    if (pending) return;
    setPending(true);
    try {
      await requireAuthClient(auth.client).register(values, selectedPlan);
      await auth.refresh();
      navigate('/workspace', { state: { businessName: values.businessName } });
      setValues((current) => ({ ...current, password: '', confirmPassword: '' }));
      setStatusNotice({
        type: 'success',
        message: 'Your registration request was accepted.',
      });
    } catch (error) {
      setStatusNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Registration failed. Please retry.',
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      {!auth.client && (
        <p role="status" className="mb-4 text-sm">
          Registration is currently unavailable. Please try again later.
        </p>
      )}
      {statusNotice && (
        <div
          role={statusNotice.type === 'error' ? 'alert' : 'status'}
          className={`mb-5 p-4 rounded-r-xl rounded-l-md border-l-4 text-sm flex items-start gap-3 shadow-xs ${
            statusNotice.type === 'error'
              ? 'bg-[#B3261E]/[0.08] border-[#B3261E] text-[#8C1D18]'
              : 'bg-[#3F7A2A]/[0.08] border-[#3F7A2A] text-[#2C571D]'
          }`}
        >
          {statusNotice.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B3261E]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#3F7A2A]" />
          )}
          <span>{statusNotice.message}</span>
        </div>
      )}

      <form aria-busy={pending} onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <fieldset disabled={pending} className="sw-form-fields space-y-3.5">
          {/* Bakery Business Name */}
          <div>
            <div
              className={`flex items-center rounded-md border bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-verdigris ${
                errors.businessName ? 'border-[#B3261E]' : 'border-rule'
              }`}
            >
              <div className="flex items-center justify-center px-3.5 py-2.5 text-verdigris border-r border-[#E5E0D0] bg-[#F9F7F1]/60">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                id="reg-biz-name"
                name="businessName"
                type="text"
                value={values.businessName}
                onChange={handleChange}
                placeholder="Business Name"
                aria-label="Business Name"
                aria-invalid={!!errors.businessName}
                aria-describedby={errors.businessName ? 'reg-biz-err' : undefined}
                className="w-full px-3.5 py-2.5 text-sm text-oven-black placeholder-oven-black/40 focus:outline-none bg-transparent"
              />
            </div>
            {errors.businessName && (
              <p id="reg-biz-err" className="text-xs text-[#B3261E] mt-1 pl-1">
                {errors.businessName}
              </p>
            )}
          </div>

          {/* Full name */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <div
                className={`flex items-center rounded-md border bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-verdigris ${
                  errors.fullName ? 'border-[#B3261E]' : 'border-rule'
                }`}
              >
                <div className="flex items-center justify-center px-3 py-2.5 text-verdigris border-r border-[#E5E0D0] bg-[#F9F7F1]/60">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="reg-full-name"
                  name="fullName"
                  type="text"
                  value={values.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  aria-label="Full Name"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'reg-fname-err' : undefined}
                  className="w-full px-3 py-2.5 text-sm text-oven-black placeholder-oven-black/40 focus:outline-none bg-transparent"
                />
              </div>
              {errors.fullName && (
                <p id="reg-fname-err" className="text-xs text-[#B3261E] mt-1 pl-1">
                  {errors.fullName}
                </p>
              )}
            </div>
          </div>

          {/* Email Address */}
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
                id="reg-email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                placeholder="e-Mail Address"
                aria-label="e-Mail Address"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'reg-email-err' : undefined}
                className="w-full px-3.5 py-2.5 text-sm text-oven-black placeholder-oven-black/40 focus:outline-none bg-transparent"
              />
            </div>
            {errors.email && (
              <p id="reg-email-err" className="text-xs text-[#B3261E] mt-1 pl-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div
              className={`flex items-center rounded-md border bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-verdigris ${
                errors.password ? 'border-[#B3261E]' : 'border-rule'
              }`}
            >
              <div className="flex items-center justify-center px-3.5 py-2.5 text-verdigris border-r border-[#E5E0D0] bg-[#F9F7F1]/60">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={handleChange}
                placeholder="Password (min 8 chars)"
                aria-label="Password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'reg-pw-err' : undefined}
                className="w-full px-3.5 py-2.5 text-sm text-oven-black placeholder-oven-black/40 focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="px-3 text-oven-black/50 hover:text-oven-black cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="reg-pw-err" className="text-xs text-[#B3261E] mt-1 pl-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div
              className={`flex items-center rounded-md border bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-verdigris ${
                errors.confirmPassword ? 'border-[#B3261E]' : 'border-rule'
              }`}
            >
              <div className="flex items-center justify-center px-3.5 py-2.5 text-verdigris border-r border-[#E5E0D0] bg-[#F9F7F1]/60">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={values.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                aria-label="Confirm Password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'reg-cpw-err' : undefined}
                className="w-full px-3.5 py-2.5 text-sm text-oven-black placeholder-oven-black/40 focus:outline-none bg-transparent"
              />
            </div>
            {errors.confirmPassword && (
              <p id="reg-cpw-err" className="text-xs text-[#B3261E] mt-1 pl-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Agree to Terms Checkbox */}
          <div className="pt-1">
            <label
              htmlFor="reg-agree-terms"
              className="flex items-start gap-2 cursor-pointer select-none"
            >
              <input
                id="reg-agree-terms"
                name="agreeToTerms"
                type="checkbox"
                checked={values.agreeToTerms || false}
                onChange={handleChange}
                aria-invalid={!!errors.agreeToTerms}
                aria-describedby={errors.agreeToTerms ? 'reg-terms-err' : undefined}
                className={`w-4 h-4 mt-0.5 rounded border text-verdigris focus:ring-verdigris focus:ring-offset-0 cursor-pointer accent-verdigris shrink-0 transition-colors ${
                  errors.agreeToTerms ? 'border-[#B3261E] ring-1 ring-[#B3261E]' : 'border-rule'
                }`}
              />
              <span className="text-xs text-oven-black/80 leading-snug">
                I agree to the{' '}
                <span className="font-semibold text-verdigris">Terms of Service</span> and{' '}
                <span className="font-semibold text-verdigris">Privacy Policy</span>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p id="reg-terms-err" className="text-xs text-[#B3261E] mt-1 pl-6 font-medium">
                {errors.agreeToTerms}
              </p>
            )}
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={pending || !auth.client}
            className="w-full mt-2 py-2.5 px-4 rounded-md bg-verdigris hover:bg-[#08484E] text-white font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-verdigris cursor-pointer"
          >
            Create Business Account
          </button>
        </fieldset>
      </form>
    </div>
  );
}
