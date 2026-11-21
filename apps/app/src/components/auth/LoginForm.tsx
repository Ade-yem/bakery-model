/**
 * @file Sign In Form component styled with reference aesthetic (left icon badges, clean borders).
 */

import React, { useState } from 'react';
import { useAuth } from '../../features/integration/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { validateLoginForm } from '../../utils/validation';
import type { LoginFormValues } from '../../types';

export interface LoginFormProps {
  onSuccess?: () => void;
}

/**
 * @description Accessible form inputs for logging into Cadence with reference styling.
 * @param {LoginFormProps} props - Callbacks.
 * @returns {React.ReactElement} Login form element.
 */
export function LoginForm({ onSuccess }: LoginFormProps): React.ReactElement {
  const navigate = useNavigate();
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [values, setValues] = useState<LoginFormValues>({
    identifier: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateLoginForm(values);

    if (!result.isValid) {
      setErrors(result.errors);
      setStatusNotice(null);
      return;
    }

    setErrors({});
    if (pending) return;
    setPending(true);
    try {
      const session = await auth.signIn(values.identifier, values.password);
      onSuccess?.();
      navigate(`/workspace/${session.department}`, { replace: true });
    } catch (error) {
      setStatusNotice(error instanceof Error ? error.message : 'Sign-in failed. Please retry.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      {!auth.client && (
        <p role="status" className="mb-4 text-sm">
          Sign-in is currently unavailable. Please try again later.
        </p>
      )}
      {statusNotice && (
        <div
          role="alert"
          className="mb-5 p-4 rounded-r-xl rounded-l-md border-l-4 text-sm flex items-start gap-3 bg-status-unbalanced/8 border-status-unbalanced text-[#8C1D18]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{statusNotice}</span>
        </div>
      )}

      <form aria-busy={pending} onSubmit={handleSubmit} noValidate className="space-y-4">
        <fieldset disabled={pending} className="sw-form-fields space-y-4">
          {/* Email Address Field */}
          <div>
            <div
              className={`flex items-center rounded-md border bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-verdigris ${
                errors.identifier ? 'border-[#B3261E]' : 'border-rule'
              }`}
            >
              <div className="flex items-center justify-center px-3.5 py-2.5 text-verdigris border-r border-[#E5E0D0] bg-[#F9F7F1]/60">
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
                className="w-full px-3.5 py-2.5 text-sm text-oven-black placeholder-oven-black/40 focus:outline-none bg-transparent"
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
              className={`flex items-center rounded-md border bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-verdigris ${
                errors.password ? 'border-[#B3261E]' : 'border-rule'
              }`}
            >
              <div className="flex items-center justify-center px-3.5 py-2.5 text-verdigris border-r border-[#E5E0D0] bg-[#F9F7F1]/60">
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
              <p id="login-pw-err" className="text-xs text-[#B3261E] mt-1 pl-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Primary Login Button */}
          <button
            type="submit"
            disabled={pending || !auth.client}
            className="w-full mt-2 py-2.5 px-4 rounded-md bg-verdigris hover:bg-[#08484E] text-white font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-verdigris cursor-pointer"
          >
            {pending ? 'Signing in…' : 'Login'}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center pt-2">
            <Link to="/forgot-password" className="text-xs text-verdigris hover:underline">
              Forgot your Password? Click here to reset it.
            </Link>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
