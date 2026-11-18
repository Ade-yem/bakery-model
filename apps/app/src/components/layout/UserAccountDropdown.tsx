/**
 * @file Reusable user account dropdown menu displaying actor profile, designation, and sign out.
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, ShieldCheck, Building, MapPin } from 'lucide-react';
import type { UserAccountDropdownProps } from './types';

/**
 * @description Accessible user dropdown menu displaying authenticated actor profile and session actions.
 * @param {UserAccountDropdownProps} props - Dropdown properties.
 * @returns {React.ReactElement} User account dropdown element.
 * @example
 * ```tsx
 * <UserAccountDropdown actor={currentActor} onSignOut={handleSignOut} />
 * ```
 */
export function UserAccountDropdown({
  actor,
  onSignOut,
  onProfileClick,
  profilePath = '/workspace/profile',
  isOpen: controlledIsOpen,
  showEmail = false,
  showChevron = true,
}: UserAccountDropdownProps): React.ReactElement {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDropdownOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  // Dismiss on Escape key press
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInternalIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen]);

  // Dismiss on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setInternalIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);

  const initials =
    actor.initials ||
    actor.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const handleSignOutClick = () => {
    setInternalIsOpen(false);
    if (onSignOut) onSignOut();
    else if (typeof window !== 'undefined') window.location.href = '/login';
  };

  const handleProfileClick = () => {
    setInternalIsOpen(false);
    if (onProfileClick) onProfileClick();
    else if (profilePath && typeof window !== 'undefined') window.location.href = profilePath;
  };

  return (
    <div className="relative inline-block text-left font-sans" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="user-menu-button"
        aria-haspopup="menu"
        aria-expanded={isDropdownOpen}
        onClick={() => setInternalIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1 rounded-full sm:rounded-lg hover:bg-[#F6F3EA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B5C63] cursor-pointer"
      >
        {/* Avatar circle with online status indicator */}
        <div className="relative shrink-0">
          {actor.avatarUrl ? (
            <img
              src={actor.avatarUrl}
              alt={actor.fullName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#0B5C63]/25 shadow-xs"
            />
          ) : showEmail ? (
            <div className="w-8 h-8 rounded-full bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center text-xs font-semibold shadow-xs">
              <User className="w-4.5 h-4.5 text-[#9CA3AF]" />
              <span className="sr-only">{initials}</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#0B5C63] text-[#F6F3EA] flex items-center justify-center text-xs font-bold ring-1 ring-[#0B5C63]/25 shadow-xs">
              {initials}
            </div>
          )}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] ring-2 ring-white" />
        </div>

        {/* Actor Info (Hidden on small mobile) */}
        <div className="hidden sm:flex flex-col text-left max-w-[180px] md:max-w-[220px]">
          <span className="text-xs sm:text-sm font-semibold text-[#10201F] leading-tight truncate">
            {actor.fullName}
          </span>
          <span className="text-[11px] text-[#10201F]/60 font-medium leading-tight mt-0.5 truncate">
            {showEmail && actor.email ? actor.email : actor.designation}
          </span>
          {showEmail && actor.email && actor.designation && (
            <span className="sr-only">{actor.designation}</span>
          )}
        </div>

        {showChevron && (
          <ChevronDown
            className={`w-4 h-4 text-[#10201F]/50 transition-transform duration-150 hidden sm:block ${
              isDropdownOpen ? 'rotate-180 text-[#0B5C63]' : ''
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu Panel */}
      {isDropdownOpen && (
        <div
          role="menu"
          aria-labelledby="user-menu-button"
          className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl bg-white border border-[#D9D3C0] shadow-lg py-2 z-50 animate-fade-in focus:outline-none"
        >
          {/* Header Profile Section */}
          <div className="px-4 py-3.5 border-b border-[#E5E0D0] bg-[#F9F7F1]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0B5C63] text-[#F6F3EA] flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#10201F] truncate">{actor.fullName}</p>
                <p className="text-xs text-[#10201F]/70 truncate">{actor.email}</p>
              </div>
            </div>

            {/* Designation / Role Badge */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-[#0B5C63]/10 text-[#0B5C63] border border-[#0B5C63]/20">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B5C63]" />
                {actor.roleBadge || actor.designation}
              </span>
            </div>

            {/* Optional Tenant & Branch */}
            {(actor.tenantName || actor.branchName) && (
              <div className="mt-2.5 pt-2 border-t border-[#E5E0D0]/60 space-y-1 text-xs text-[#10201F]/80">
                {actor.tenantName && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-[#A9501A] shrink-0" />
                    <span className="truncate">{actor.tenantName}</span>
                  </div>
                )}
                {actor.branchName && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#0B5C63] shrink-0" />
                    <span className="truncate">{actor.branchName}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Links */}
          <div className="py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleProfileClick}
              className="w-full text-left px-4 py-2.5 text-sm text-[#10201F] hover:bg-[#F6F3EA] flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
            >
              <User className="w-4 h-4 text-[#0B5C63]" />
              <span>Profile Details</span>
            </button>
          </div>

          {/* Sign Out Action */}
          <div className="pt-1.5 border-t border-[#E5E0D0]">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOutClick}
              className="w-full text-left px-4 py-2.5 text-sm text-[#B3261E] hover:bg-[#FDF2F2] flex items-center gap-2.5 transition-colors cursor-pointer font-semibold"
            >
              <LogOut className="w-4 h-4 text-[#B3261E]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
