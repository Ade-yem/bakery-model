/**
 * @file General platform branding and support contact information form section.
 */

import React from 'react';
import { Building2 } from 'lucide-react';
import type { PlatformSettings } from '../../types';

export interface GeneralInfoSectionProps {
  /** Form state. */
  settings: PlatformSettings;
  /** Field change callback. */
  onChange: <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => void;
  /** Whether the section is in read-only mode. */
  disabled?: boolean;
}

/**
 * @description Form subsection managing platform name, description, support email, phone, and website.
 * @param {GeneralInfoSectionProps} props - Component properties.
 * @returns {React.ReactElement} Form section element.
 */
export function GeneralInfoSection({
  settings,
  onChange,
  disabled = false,
}: GeneralInfoSectionProps): React.ReactElement {
  return (
    <div className="p-5 rounded-xl border border-[#D9D3C0] bg-white space-y-4 font-sans">
      <div className="flex items-center gap-2 text-[#0B5C63]">
        <Building2 className="w-4 h-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#10201F]">
          General Platform Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Platform Name */}
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Platform Name *
          </label>
          <input
            type="text"
            disabled={disabled}
            value={settings.platformName}
            onChange={(e) => onChange('platformName', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          />
        </div>

        {/* Official Website */}
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Official Website
          </label>
          <input
            type="url"
            disabled={disabled}
            value={settings.websiteUrl}
            onChange={(e) => onChange('websiteUrl', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          />
        </div>
      </div>

      {/* Platform Description */}
      <div>
        <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
          Platform Description
        </label>
        <textarea
          rows={2}
          disabled={disabled}
          value={settings.platformDescription}
          onChange={(e) => onChange('platformDescription', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        />
      </div>

      {/* Support Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#D9D3C0]/60">
        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Support Email *
          </label>
          <input
            type="email"
            disabled={disabled}
            value={settings.supportEmail}
            onChange={(e) => onChange('supportEmail', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#10201F]/80 mb-1">
            Support Phone Number
          </label>
          <input
            type="text"
            disabled={disabled}
            value={settings.supportPhone}
            onChange={(e) => onChange('supportPhone', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#D9D3C0] bg-[#FDFCF7] text-[#10201F] disabled:bg-[#F6F3EA] disabled:text-[#10201F]/60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
          />
        </div>
      </div>
    </div>
  );
}
