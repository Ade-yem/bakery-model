/**
 * @file Security policies configuration section: session timeouts, MFA, and password complexity.
 */

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { PlatformSettings } from '../../types';

export interface SecuritySectionProps {
  settings: PlatformSettings;
  onChange: <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => void;
  disabled?: boolean;
}

/**
 * @description Form subsection configuring platform administrator session timeout, MFA, and password policy.
 * @param {SecuritySectionProps} props - Component properties.
 * @returns {React.ReactElement} Form section element.
 */
export function SecuritySection({
  settings,
  onChange,
  disabled = false,
}: SecuritySectionProps): React.ReactElement {
  return (
    <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-4 font-sans">
      <div className="flex items-center gap-2 text-[#0B5C63]">
        <ShieldAlert className="w-4 h-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#10201F]">
          Security Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Session Timeout */}
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Session Timeout *
          </label>
          <select
            disabled={disabled}
            value={settings.sessionTimeoutMinutes}
            onChange={(e) => onChange('sessionTimeoutMinutes', Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          >
            <option value={15}>15 Minutes (High Security)</option>
            <option value={30}>30 Minutes</option>
            <option value={60}>60 Minutes (Standard)</option>
            <option value={120}>2 Hours</option>
            <option value={240}>4 Hours</option>
          </select>
          <p className="text-[11px] text-[#10201F]/60 mt-1">
            Inactive administrator sessions will be automatically terminated.
          </p>
        </div>

        {/* Password Policy */}
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Password Minimum Length *
          </label>
          <select
            disabled={disabled}
            value={settings.passwordMinLength}
            onChange={(e) => onChange('passwordMinLength', Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          >
            <option value={8}>8 Characters</option>
            <option value={10}>10 Characters (Recommended)</option>
            <option value={12}>12 Characters (Strong)</option>
            <option value={16}>16 Characters (Enterprise)</option>
          </select>
          <p className="text-[11px] text-[#10201F]/60 mt-1">
            Applied to all newly created administrator accounts.
          </p>
        </div>
      </div>

      {/* Security Checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D9D3C0]/60">
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#D9D3C0] bg-[#FDFCF7] cursor-pointer hover:bg-[#F6F3EA] transition-colors">
          <input
            type="checkbox"
            disabled={disabled}
            checked={settings.requireMfaForAdmins}
            onChange={(e) => onChange('requireMfaForAdmins', e.target.checked)}
            className="mt-0.5 rounded border-[#D9D3C0] text-[#0B5C63] focus:ring-[#0B5C63] disabled:opacity-50"
          />
          <div>
            <span className="text-xs font-bold text-[#10201F] block">
              Multi-Factor Authentication
            </span>
            <span className="text-[11px] text-[#10201F]/60">
              Require two-factor authentication (TOTP/WebAuthn) for platform super admins.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#D9D3C0] bg-[#FDFCF7] cursor-pointer hover:bg-[#F6F3EA] transition-colors">
          <input
            type="checkbox"
            disabled={disabled}
            checked={settings.requireSpecialChar}
            onChange={(e) => onChange('requireSpecialChar', e.target.checked)}
            className="mt-0.5 rounded border-[#D9D3C0] text-[#0B5C63] focus:ring-[#0B5C63] disabled:opacity-50"
          />
          <div>
            <span className="text-xs font-bold text-[#10201F] block">
              Require Special Characters
            </span>
            <span className="text-[11px] text-[#10201F]/60">
              Enforce inclusion of special characters (!@#$%^&*) in admin passwords.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
