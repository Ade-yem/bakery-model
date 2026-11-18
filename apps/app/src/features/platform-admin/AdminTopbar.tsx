/**
 * @file Platform Admin top navigation bar with page title, system health, notifications, and profile.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, CheckCircle2 } from 'lucide-react';
import { UserAccountDropdown } from '../../components/layout/UserAccountDropdown';
import type { AuthenticatedActor } from '../../components/layout/types';
import { ROUTE_TITLE_MAP } from './permissions';

export interface AdminTopbarProps {
  /** Optional override for title displayed in topbar. */
  title?: string;
  /** Callback to toggle mobile navigation drawer. */
  onToggleSidebar: () => void;
  /** Unread notifications count badge. Defaults to 0. */
  unreadCount?: number;
  /** Optional authenticated actor. */
  actor?: AuthenticatedActor;
  /** Whether to show system health indicator badge. Defaults to false. */
  showHealthBadge?: boolean;
}

const DEFAULT_ADMIN_ACTOR: AuthenticatedActor = {
  id: 'admin-super',
  fullName: 'Gbenle Kamolideen Ajibola',
  email: 'gbenlekamolideen@gmail.com',
  designation: 'Super Admin',
  roleBadge: 'Super Admin',
  initials: 'SA',
  permissions: ['*'],
};

/**
 * @description Renders the global top navigation bar for the platform admin workspace.
 * @param {AdminTopbarProps} props - Topbar configurations.
 * @returns {React.ReactElement} Topbar React element.
 * @example
 * ```tsx
 * <AdminTopbar onToggleSidebar={() => setMobileOpen(true)} />
 * ```
 */
export function AdminTopbar({
  title,
  onToggleSidebar,
  unreadCount = 0,
  actor = DEFAULT_ADMIN_ACTOR,
  showHealthBadge = false,
}: AdminTopbarProps): React.ReactElement {
  const location = useLocation();
  const displayTitle = title || ROUTE_TITLE_MAP[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-20 h-[52px] bg-white border-b border-[#E5E7EB] px-4 sm:px-6 md:px-8 flex items-center justify-between font-sans">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open sidebar menu"
          className="lg:hidden p-1.5 rounded-md text-[#10201F]/70 hover:text-[#10201F] hover:bg-[#F6F3EA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-semibold text-[#DF1B22] tracking-tight">
            {displayTitle}
          </h2>
        </div>
      </div>

      {/* Right: Health badge (optional), Notifications & Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* System Health Status Indicator */}
        {showHealthBadge ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF3E8] text-[#3F7A2A] border border-[#CBE2C4]"
            title="All systems operational and database gateways connected"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7A2A]" />
            <span>Platform Healthy</span>
          </div>
        ) : (
          <span className="sr-only">Platform Healthy</span>
        )}

        {/* Notifications Icon Button */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative p-1.5 rounded-lg text-[#10201F]/80 hover:text-[#10201F] hover:bg-[#F6F3EA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B5C63] cursor-pointer"
        >
          <Bell className="w-5 h-5 text-[#10201F]/80" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#A9501A] text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Account Dropdown */}
        <UserAccountDropdown
          actor={actor}
          showEmail
          showChevron={false}
        />
      </div>
    </header>
  );
}
