/**
 * @file Client Admin top navigation bar matching the Platform Admin topbar layout,
 * incorporating page title, business name, status pill, notifications, and profile.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, CheckCircle2 } from 'lucide-react';
import { UserAccountDropdown } from '../../../components/layout/UserAccountDropdown';
import { useTenant } from '../context/TenantContext';

export interface BusinessAdminTopbarProps {
  /** Callback to trigger mobile sidebar toggle. */
  onToggleSidebar: () => void;
}

const CLIENT_ROUTE_TITLES: Record<string, string> = {
  '/business': 'Overview',
  '/business/dashboard': 'Dashboard Overview',
  '/business/profile': 'Business Profile',
  '/business/branches': 'Branch Management',
  '/business/departments': 'Department Builder',
  '/business/departments/config': 'Department Configuration',
  '/business/staff': 'Staff Management',
  '/business/roles': 'Roles & Permissions',
  '/business/shifts': 'Shift Scheduling',
  '/business/operations/inventory': 'Central Inventory',
  '/business/operations/sales': 'Sales & Cashiers',
  '/business/operations/orders': 'Customer Orders',
  '/business/operations/procurement': 'Procurement Requisitions',
  '/business/operations/production': 'Baking Runs & Production',
  '/business/operations/payments': 'Payments & Disbursement',
  '/business/operations/credits': 'Customer Credits',
  '/business/reports': 'Reports & History',
  '/business/settings': 'Workspace Settings',
};

/**
 * @description Topbar for the Client Business Admin dashboard displaying route context,
 * current business branding, operational status pill, and user profile.
 * Strictly scoped to the authenticated tenant (no cross-tenant data leaks).
 * @param {BusinessAdminTopbarProps} props - Topbar properties.
 * @returns {React.ReactElement} Business topbar element.
 */
export function BusinessAdminTopbar({ onToggleSidebar }: BusinessAdminTopbarProps): React.ReactElement {
  const location = useLocation();
  const { currentBusiness, subscription, actor } = useTenant();

  const displayTitle = CLIENT_ROUTE_TITLES[location.pathname] || 'Workspace';
  const isHealthy = subscription.status === 'active';

  return (
    <header className="sticky top-0 z-20 h-[52px] bg-white border-b border-[#E5E7EB] px-4 sm:px-6 md:px-8 flex items-center justify-between font-sans">
      {/* Left: Mobile Trigger & Route Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open sidebar menu"
          className="md:hidden p-1.5 rounded-md text-[#10201F]/70 hover:text-[#10201F] hover:bg-[#F6F3EA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-semibold text-[#DF1B22] tracking-tight">
            {displayTitle}
          </h2>
          <span className="hidden sm:inline text-xs text-[#10201F]/40">•</span>
          <span className="hidden sm:inline text-xs font-medium text-[#10201F]/70 truncate max-w-[200px]">
            {currentBusiness.name}
          </span>
        </div>
      </div>

      {/* Right: Operational Status Pill, Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isHealthy
              ? 'bg-[#EBF3E8] text-[#3F7A2A] border-[#CBE2C4]'
              : 'bg-[#FEF6E7] text-[#D97706] border-[#FBD89C]'
          }`}
          title={`Account Status: ${isHealthy ? 'Active' : subscription.status} (${subscription.planName})`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-current" />
          <span className="capitalize">{isHealthy ? 'Active' : subscription.status}</span>
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative p-1.5 rounded-lg text-[#10201F]/80 hover:text-[#10201F] hover:bg-[#F6F3EA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B5C63] cursor-pointer"
        >
          <Bell className="w-5 h-5 text-[#10201F]/80" />
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#A9501A] text-[10px] font-bold text-white shadow-xs">
            2
          </span>
        </button>

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
