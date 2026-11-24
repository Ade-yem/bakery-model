/**
 * @file Notification preference toggles and critical alerts email section.
 */

import React from 'react';
import { Bell } from 'lucide-react';
import type { PlatformSettings } from '../../types';

export interface NotificationsSectionProps {
  settings: PlatformSettings;
  onChange: <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => void;
  disabled?: boolean;
}

/**
 * @description Form subsection configuring platform alerts for registrations, expiries, and payment failures.
 * @param {NotificationsSectionProps} props - Component properties.
 * @returns {React.ReactElement} Form section element.
 */
export function NotificationsSection({
  settings,
  onChange,
  disabled = false,
}: NotificationsSectionProps): React.ReactElement {
  return (
    <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-4 font-sans">
      <div className="flex items-center gap-2 text-[#0B5C63]">
        <Bell className="w-4 h-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#10201F]">
          Notification Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Toggle: New Registrations */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#D9D3C0] bg-[#FDFCF7] cursor-pointer hover:bg-[#F6F3EA] transition-colors">
          <input
            type="checkbox"
            disabled={disabled}
            checked={settings.notifyNewRegistration}
            onChange={(e) => onChange('notifyNewRegistration', e.target.checked)}
            className="mt-0.5 rounded border-[#D9D3C0] text-[#0B5C63] focus:ring-[#0B5C63] disabled:opacity-50"
          />
          <div>
            <span className="text-xs font-bold text-[#10201F] block">
              New Business Registrations
            </span>
            <span className="text-[11px] text-[#10201F]/60">
              Notify platform administrators when a new bakery registers.
            </span>
          </div>
        </label>

        {/* Toggle: Subscription Expiry */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#D9D3C0] bg-[#FDFCF7] cursor-pointer hover:bg-[#F6F3EA] transition-colors">
          <input
            type="checkbox"
            disabled={disabled}
            checked={settings.notifySubscriptionExpiry}
            onChange={(e) => onChange('notifySubscriptionExpiry', e.target.checked)}
            className="mt-0.5 rounded border-[#D9D3C0] text-[#0B5C63] focus:ring-[#0B5C63] disabled:opacity-50"
          />
          <div>
            <span className="text-xs font-bold text-[#10201F] block">
              Subscription Expiry Alerts
            </span>
            <span className="text-[11px] text-[#10201F]/60">
              Alert operations team when client subscription approaches expiration.
            </span>
          </div>
        </label>

        {/* Toggle: Payment Failure */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#D9D3C0] bg-[#FDFCF7] cursor-pointer hover:bg-[#F6F3EA] transition-colors">
          <input
            type="checkbox"
            disabled={disabled}
            checked={settings.notifyPaymentFailure}
            onChange={(e) => onChange('notifyPaymentFailure', e.target.checked)}
            className="mt-0.5 rounded border-[#D9D3C0] text-[#0B5C63] focus:ring-[#0B5C63] disabled:opacity-50"
          />
          <div>
            <span className="text-xs font-bold text-[#10201F] block">
              Payment Failure Notifications
            </span>
            <span className="text-[11px] text-[#10201F]/60">
              Dispatch alert when automated card or direct charge fails.
            </span>
          </div>
        </label>

        {/* Toggle: Admin Alerts */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#D9D3C0] bg-[#FDFCF7] cursor-pointer hover:bg-[#F6F3EA] transition-colors">
          <input
            type="checkbox"
            disabled={disabled}
            checked={settings.notifyAdminAlerts}
            onChange={(e) => onChange('notifyAdminAlerts', e.target.checked)}
            className="mt-0.5 rounded border-[#D9D3C0] text-[#0B5C63] focus:ring-[#0B5C63] disabled:opacity-50"
          />
          <div>
            <span className="text-xs font-bold text-[#10201F] block">
              Administrative Alerts
            </span>
            <span className="text-[11px] text-[#10201F]/60">
              Notify on significant platform actions and security events.
            </span>
          </div>
        </label>
      </div>

      {/* Alert Recipient Email */}
      <div className="pt-2 border-t border-[#D9D3C0]/60 max-w-md">
        <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
          Administrative Alert Recipient Email
        </label>
        <input
          type="email"
          disabled={disabled}
          value={settings.alertEmail}
          onChange={(e) => onChange('alertEmail', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        />
      </div>
    </div>
  );
}
