/**
 * @file Master top navigation bar for all authenticated interfaces with actor dropdown and responsive triggers.
 */

import React from 'react';
import { Menu } from 'lucide-react';
import { UserAccountDropdown } from './UserAccountDropdown';
import type { AuthenticatedTopbarProps } from './types';

/**
 * @description Master authenticated topbar presenting title hierarchy, contextual actions, and user account menu.
 * @param {AuthenticatedTopbarProps} props - Topbar configurations.
 * @returns {React.ReactElement} Topbar React element.
 * @example
 * ```tsx
 * <AuthenticatedTopbar actor={actor} title="Shift Management" onToggleMobileSidebar={handleOpen} />
 * ```
 */
export function AuthenticatedTopbar({
  actor,
  onToggleMobileSidebar,
  title,
  breadcrumbs,
  actions,
  onSignOut,
  onProfileClick,
  profilePath,
}: AuthenticatedTopbarProps): React.ReactElement {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-xs border-b border-[#D9D3C0] px-4 sm:px-6 flex items-center justify-between font-sans">
      {/* Left: Mobile trigger & Page Title / Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Open sidebar menu"
          className="md:hidden p-2 rounded-md text-[#10201F]/70 hover:text-[#10201F] hover:bg-[#F6F3EA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B5C63]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {title && (
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#10201F] tracking-tight">
              {title}
            </h1>
          )}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#10201F]/70 mt-0.5">
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <span>/</span>}
                  {crumb.to ? (
                    <a href={crumb.to} className="hover:text-[#0B5C63] transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="font-semibold text-[#10201F]">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Right: Actions Slot & User Account Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        <div className="h-6 w-px bg-[#E5E0D0] hidden sm:block" />

        <UserAccountDropdown
          actor={actor}
          onSignOut={onSignOut}
          onProfileClick={onProfileClick}
          profilePath={profilePath}
        />
      </div>
    </header>
  );
}
