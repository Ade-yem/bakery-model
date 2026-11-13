/**
 * @file Sign In Form component styled with reference aesthetic (left icon badges, clean borders).
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { validateLoginForm } from '../../utils/validation';
import type { LoginFormValues } from '../../types';

export interface LoginFormProps {
  onSuccess?: () => void;
}

/**
 * @description Accessible form inputs for logging into TallyBakery with reference styling.
 * @param {LoginFormProps} props - Callbacks.
 * @returns {React.ReactElement} Login form element.
 */
export function LoginForm({ onSuccess }: LoginFormProps): React.ReactElement {
  const [values, setValues] = useState<LoginFormValues>({
    identifier: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((prev: LoginFormValues) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof LoginFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setStatusNotice(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateLoginForm(values);

    if (!result.isValid) {
      setErrors(result.errors);
      setStatusNotice(null);
      return;
    }

    setErrors({});
    setStatusNotice({
      type: 'error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
    });
    if (onSuccess) onSuccess();
  };

  return (
    <div>
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

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Address Field */}
        <div>
          <div
            className={`flex items-center rounded-md border bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#0B5C63] ${
              errors.identifier ? 'border-[#B3261E]' : 'border-[#D9D3C0]'
            }`}
          >
            <div className="flex items-center justify-center px-3.5 py-2.5 text-[#0B5C63] border-r border-[#E5E0D0] bg-[#F9F7F1]/60">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={values.identifier}
              onChange={handleChange}
              placeholder="e-Mail Address"
              aria-label="e-Mail Address"
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? 'login-id-err' : undefined}
              className="w-full px-3.5 py-2.5 text-sm text-[#10201F] placeholder-[#10201F]/40 focus:outline-none bg-transparent"
            />
          </div>
          {errors.identifier && (
            <p id="login-id-err" className="text-xs text-[#B3261E] mt-1 pl-1">
              {errors.identifier}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div
            className={`flex items-center rounded-md border bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#0B5C63] ${
              errors.password ? 'border-[#B3261E]' : 'border-[#D9D3C0]'
            }`}
          >
            <div className="flex items-center justify-center px-3.5 py-2.5 text-[#0B5C63] border-r border-[#E5E0D0] bg-[#F9F7F1]/60">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              placeholder="Password"
              aria-label="Password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'login-pw-err' : undefined}
              className="w-full px-3.5 py-2.5 text-sm text-[#10201F] placeholder-[#10201F]/40 focus:outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="px-3 text-[#10201F]/50 hover:text-[#10201F] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="login-pw-err" className="text-xs text-[#B3261E] mt-1 pl-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label
            htmlFor="login-remember-me"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              id="login-remember-me"
              name="rememberMe"
              type="checkbox"
              checked={values.rememberMe || false}
              onChange={handleChange}
              className="w-4 h-4 rounded border-[#D9D3C0] text-[#0B5C63] focus:ring-[#0B5C63] focus:ring-offset-0 cursor-pointer accent-[#0B5C63]"
            />
            <span className="text-xs text-[#10201F]/80 hover:text-[#10201F]">Remember me</span>
          </label>
        </div>

        {/* Primary Login Button */}
        <button
          type="submit"
          className="w-full mt-2 py-2.5 px-4 rounded-md bg-[#0B5C63] hover:bg-[#08484E] text-white font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B5C63] cursor-pointer"
        >
          Login
        </button>

        {/* Forgot Password Link */}
        <div className="text-center pt-2">
          <Link to="/forgot-password" className="text-xs text-[#0B5C63] hover:underline">
            Forgot your Password? Click here to reset it.
          </Link>
        </div>
      </form>
    </div>
  );
}
