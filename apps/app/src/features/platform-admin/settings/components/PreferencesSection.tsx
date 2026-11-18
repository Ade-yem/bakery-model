/**
 * @file Platform preferences configuration section: currency, timezone, and formats.
 */

import React from 'react';
import { Sliders } from 'lucide-react';
import type { PlatformSettings } from '../../types';

export interface PreferencesSectionProps {
  settings: PlatformSettings;
  onChange: <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => void;
  disabled?: boolean;
}

/**
 * @description Form subsection for currency, timezone, date/time format, and default language.
 * @param {PreferencesSectionProps} props - Component properties.
 * @returns {React.ReactElement} Form section element.
 */
export function PreferencesSection({
  settings,
  onChange,
  disabled = false,
}: PreferencesSectionProps): React.ReactElement {
  return (
    <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-4 font-sans">
      <div className="flex items-center gap-2 text-[#0B5C63]">
        <Sliders className="w-4 h-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#10201F]">
          Platform Preferences
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Default Currency */}
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Default Currency *
          </label>
          <select
            disabled={disabled}
            value={settings.defaultCurrency}
            onChange={(e) => onChange('defaultCurrency', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          >
            <option value="NGN">NGN (₦) - Nigerian Naira</option>
            <option value="USD">USD ($) - US Dollar</option>
            <option value="EUR">EUR (€) - Euro</option>
            <option value="GBP">GBP (£) - British Pound</option>
            <option value="GHS">GHS (₵) - Ghanaian Cedi</option>
            <option value="KES">KES (KSh) - Kenyan Shilling</option>
          </select>
        </div>

        {/* Default Timezone */}
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Default Time Zone *
          </label>
          <select
            disabled={disabled}
            value={settings.defaultTimeZone}
            onChange={(e) => onChange('defaultTimeZone', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          >
            <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
            <option value="Africa/Accra">Africa/Accra (GMT, UTC+0)</option>
            <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
            <option value="UTC">UTC (Universal Time)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
          </select>
        </div>

        {/* Date Format */}
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Date Format *
          </label>
          <select
            disabled={disabled}
            value={settings.dateFormat}
            onChange={(e) => onChange('dateFormat', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 18/02/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 02/18/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
          </select>
        </div>

        {/* Time Format */}
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Time Format *
          </label>
          <select
            disabled={disabled}
            value={settings.timeFormat}
            onChange={(e) => onChange('timeFormat', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          >
            <option value="24-hour">24-hour (e.g. 14:30)</option>
            <option value="12-hour">12-hour (e.g. 02:30 PM)</option>
          </select>
        </div>

        {/* Default Language */}
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Default Language
          </label>
          <select
            disabled={disabled}
            value={settings.defaultLanguage}
            onChange={(e) => onChange('defaultLanguage', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          >
            <option value="English (en-NG)">English (en-NG)</option>
            <option value="English (en-GB)">English (en-GB)</option>
            <option value="English (en-US)">English (en-US)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
