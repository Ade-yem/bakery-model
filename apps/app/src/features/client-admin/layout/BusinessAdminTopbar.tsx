/**
 * @file Top navigation bar for the Cadence Client Admin Dashboard,
 * incorporating active business brand mark, plan tier indicator, tenant switcher, notifications, and profile.
 */

import React, { useState } from 'react';
import { Menu, Bell, Building, Check, Sparkles } from 'lucide-react';
import { UserAccountDropdown } from '../../../components/layout/UserAccountDropdown';
import { useTenant } from '../context/TenantContext';

export interface BusinessAdminTopbarProps {
  onToggleSidebar: () => void;
}

export function BusinessAdminTopbar({ onToggleSidebar }: BusinessAdminTopbarProps): React.ReactElement {
  const { currentBusiness, subscription, actor, availableBusinesses, switchTenant } = useTenant();
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#F6F3EA]/90 backdrop-blur-md border-b border-[#D9D3C0] font-sans">
      {/* Left: Mobile Toggle & Business Brand Info */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open mobile navigation"
          className="lg:hidden p-2 rounded-xl text-[#10201F] hover:bg-[#EFE9D9] transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-3">
          {currentBusiness.logoUrl ? (
            <img
              src={currentBusiness.logoUrl}
              alt={currentBusiness.name}
              className="w-9 h-9 rounded-xl object-cover border border-[#D9D3C0] shadow-2xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#0B5C63] text-[#F6F3EA] font-bold flex items-center justify-center text-sm shadow-2xs">
              {currentBusiness.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-[#10201F] tracking-tight leading-tight">
                {currentBusiness.name}
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-[#0B5C63]/10 text-[#0B5C63] border border-[#0B5C63]/20">
                {subscription.planName}
              </span>
            </div>
            <p className="text-2xs text-[#10201F]/60 hidden sm:block">
              {currentBusiness.businessType}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Tenant Switcher, Notifications & User Account */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tenant Switcher (For Multi-tenant Verification & Demos) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setTenantMenuOpen(!tenantMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#D9D3C0] bg-white hover:bg-[#EFE9D9] text-[#10201F] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Switch demo business workspace to verify tenant isolation"
          >
            <Building size={14} className="text-[#0B5C63]" />
            <span className="hidden md:inline">Workspace:</span>
            <span className="max-w-[100px] truncate">{currentBusiness.name.split(' ')[0]}</span>
          </button>

          {tenantMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#D9D3C0] shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              role="menu"
            >
              <div className="px-3 py-1.5 border-b border-[#D9D3C0]/60">
                <p className="text-2xs font-bold uppercase tracking-wider text-[#10201F]/60">
                  Select Business Workspace
                </p>
              </div>
              {availableBusinesses.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    switchTenant(b.id);
                    setTenantMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-[#F6F3EA] transition-colors cursor-pointer ${
                    b.id === currentBusiness.id ? 'font-bold text-[#0B5C63] bg-[#0B5C63]/5' : 'text-[#10201F]'
                  }`}
                >
                  <div className="truncate">
                    <p className="font-semibold truncate">{b.name}</p>
                    <p className="text-2xs text-[#10201F]/60">{b.id}</p>
                  </div>
                  {b.id === currentBusiness.id && <Check size={14} className="text-[#0B5C63] shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Indicator */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View notifications"
            className="p-2 rounded-xl border border-[#D9D3C0] bg-white hover:bg-[#EFE9D9] text-[#10201F] transition-colors cursor-pointer relative shadow-2xs"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#A9501A]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#D9D3C0] shadow-lg p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#D9D3C0]/60 mb-2">
                <span className="font-bold text-xs text-[#10201F]">Notifications</span>
                <span className="text-2xs text-[#0B5C63] font-semibold">2 New</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-[#F6F3EA] text-2xs space-y-0.5">
                  <p className="font-bold text-[#10201F]">Daily Shift Reconciled</p>
                  <p className="text-[#10201F]/70">Lekki Main Branch evening register balanced with 0 variance.</p>
                </div>
                <div className="p-2 rounded-xl bg-[#A9501A]/10 text-2xs space-y-0.5 border border-[#A9501A]/20">
                  <p className="font-bold text-[#A9501A]">Low Stock Warning</p>
                  <p className="text-[#10201F]/70">Golden Penny All-Purpose Flour is below 15% reorder point.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Account Profile */}
        <UserAccountDropdown
          actor={actor}
          showEmail={false}
          showChevron={true}
          profilePath="/business/profile"
        />
      </div>
    </header>
  );
}
