/**
 * @file Collapsible and responsive navigation sidebar for the Client Admin Dashboard,
 * adopting the Platform Admin clean white rail with hover-expansion and mobile drawer.
 */

import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Store,
  FolderTree,
  Sliders,
  Users,
  ShieldCheck,
  CalendarClock,
  Package,
  BadgePercent,
  ShoppingCart,
  Truck,
  Flame,
  CreditCard,
  Wallet,
  FileBarChart,
  Settings,
  PanelLeftClose,
  X,
} from 'lucide-react';
import type { LayoutNavGroup } from '../../../components/layout/types';
import { useTenant } from '../context/TenantContext';

export interface BusinessAdminSidebarProps {
  groups: LayoutNavGroup[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const ICON_MAP: Record<string, React.ReactElement> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5 shrink-0" />,
  Building2: <Building2 className="w-5 h-5 shrink-0" />,
  Store: <Store className="w-5 h-5 shrink-0" />,
  FolderTree: <FolderTree className="w-5 h-5 shrink-0" />,
  Sliders: <Sliders className="w-5 h-5 shrink-0" />,
  Users: <Users className="w-5 h-5 shrink-0" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 shrink-0" />,
  CalendarClock: <CalendarClock className="w-5 h-5 shrink-0" />,
  Package: <Package className="w-5 h-5 shrink-0" />,
  BadgePercent: <BadgePercent className="w-5 h-5 shrink-0" />,
  ShoppingCart: <ShoppingCart className="w-5 h-5 shrink-0" />,
  Truck: <Truck className="w-5 h-5 shrink-0" />,
  Flame: <Flame className="w-5 h-5 shrink-0" />,
  CreditCard: <CreditCard className="w-5 h-5 shrink-0" />,
  Wallet: <Wallet className="w-5 h-5 shrink-0" />,
  FileBarChart: <FileBarChart className="w-5 h-5 shrink-0" />,
  Settings: <Settings className="w-5 h-5 shrink-0" />,
};

interface SidebarBodyProps {
  groups: LayoutNavGroup[];
  isExpanded: boolean;
  isMobile: boolean;
  isCollapsed: boolean;
  onToggle?: () => void;
  onCloseMobile?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  isFloatingHover?: boolean;
}

function SidebarBody({
  groups,
  isExpanded,
  isMobile,
  isCollapsed,
  onToggle,
  onCloseMobile,
  onHoverStart,
  onHoverEnd,
  isFloatingHover = false,
}: SidebarBodyProps): React.ReactElement {
  const { currentBusiness, subscription } = useTenant();

  return (
    <div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={`flex flex-col h-full bg-white text-[#10201F] border-r border-[#D9D3C0] font-sans select-none ${isMobile
        ? 'w-full rounded-none'
        : 'rounded-t-2xl md:rounded-tr-2xl md:rounded-br-2xl transition-all duration-200'
        } overflow-hidden ${isFloatingHover ? 'shadow-2xl ring-1 ring-[#10201F]/10' : 'shadow-xs'}`}
    >
      {/* Brand Header */}
      <div
        className={`h-[52px] flex items-center ${!isExpanded ? 'justify-center' : 'justify-between px-4'
          } border-b border-[#E5E0D0] shrink-0`}
      >
        <Link
          to="/business/dashboard"
          onClick={isMobile ? onCloseMobile : undefined}
          className="flex items-center gap-2.5 overflow-hidden"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0B5C63] text-[#F6F3EA] shadow-xs shrink-0">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 15C4 10.5 7.5 7 12 7C16.5 7 20 10.5 20 15C20 16 19 17 18 17H6C5 17 4 16 4 15Z"
                fill="#F6F3EA"
              />
              <path
                d="M9 13V10M12 13V9M15 13V10"
                stroke="#A9501A"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {isExpanded && (
            <div className="flex flex-col leading-none truncate">
              <div className="flex items-center tracking-tight font-extrabold text-sm uppercase">
                <span className="text-[#0B5C63]">CADENCE</span>
                <span className="text-[#A9501A] ml-1">OPS</span>
              </div>
              <span className="text-[9px] font-bold tracking-wider uppercase text-[#0B5C63] bg-[#0B5C63]/10 px-1.5 py-0.5 rounded mt-0.5 inline-block w-fit truncate">
                {currentBusiness.name.split(' ')[0]} Admin
              </span>
            </div>
          )}
        </Link>

        {isExpanded && (
          <div className="flex items-center gap-1">
            {!isMobile && onToggle && (
              <button
                type="button"
                onClick={onToggle}
                title={isCollapsed ? 'Pin expanded' : 'Collapse sidebar'}
                aria-label={isCollapsed ? 'Pin expanded' : 'Collapse sidebar'}
                className="p-1.5 text-[#10201F]/50 hover:text-[#10201F] hover:bg-[#F6F3EA] rounded-lg transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
            {isMobile && onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation"
                className="p-1.5 text-[#10201F]/60 hover:text-[#10201F] hover:bg-[#F6F3EA] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-4">
        {groups.map((group, groupIdx) => (
          <div key={group.groupTitle} className="space-y-1">
            {groupIdx > 0 && <div className="border-t border-[#E5E0D0] my-2.5 mx-1.5" />}
            {isExpanded && (
              <h2 className="px-3 pt-1 pb-1 text-xs font-bold uppercase tracking-wider text-[#10201F]/50">
                {group.groupTitle}
              </h2>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={() => {
                      if (isMobile && onCloseMobile) onCloseMobile();
                      if (onHoverEnd) onHoverEnd();
                    }}
                    title={!isExpanded ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${!isExpanded
                        ? 'justify-center w-11 h-11 mx-auto'
                        : 'justify-between px-3.5 py-2.5'
                      } rounded-xl text-[15px] transition-all ${isActive
                        ? 'bg-[#EFEBDB] text-[#10201F] font-semibold shadow-2xs'
                        : 'text-[#10201F]/80 font-medium hover:text-[#10201F] hover:bg-[#F6F3EA]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {ICON_MAP[typeof item.icon === 'string' ? item.icon : 'LayoutDashboard'] || (
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                      )}
                      {isExpanded && <span className="truncate">{item.label}</span>}
                    </div>
                    {isExpanded && item.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#10201F]/10 text-[#10201F] shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer info in expanded mode */}
      {isExpanded && (
        <div className="p-3 border-t border-[#E5E0D0] bg-[#F6F3EA]/30 text-xs text-[#10201F]/60 flex items-center justify-between">
          <div className="flex flex-col truncate pr-2">
            <span className="truncate font-semibold text-[#10201F]">{currentBusiness.name}</span>
            <span className="font-mono text-[11px] text-[#10201F]/50">{currentBusiness.id} • {subscription.planName}</span>
          </div>
          <span className="font-bold text-[#0B5C63] uppercase tracking-wider text-[10px] bg-[#0B5C63]/10 px-2 py-0.5 rounded-full shrink-0">
            {subscription.tier}
          </span>
        </div>
      )}
    </div>
  );
}

export function BusinessAdminSidebar({
  groups,
  isCollapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: BusinessAdminSidebarProps): React.ReactElement {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onCloseMobile) {
        onCloseMobile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen, onCloseMobile]);

  const isDesktopExpanded = !isCollapsed || isHovered;
  const isFloatingHover = isCollapsed && isHovered;
  const sidebarWidth = isDesktopExpanded ? 'w-64' : 'w-16';

  return (
    <>
      {/* Desktop Sticky Rail (Hidden on mobile) */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 z-30 sticky top-0 h-screen ${sidebarWidth}`}
      >
        <SidebarBody
          groups={groups}
          isExpanded={isDesktopExpanded}
          isMobile={false}
          isCollapsed={isCollapsed}
          onToggle={onToggleCollapse}
          onCloseMobile={onCloseMobile}
          onHoverStart={() => {
            if (isCollapsed) setIsHovered(true);
          }}
          onHoverEnd={() => {
            if (isCollapsed) setIsHovered(false);
          }}
          isFloatingHover={isFloatingHover}
        />
      </aside>

      {/* Mobile Drawer (Hidden on desktop) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10">
            <SidebarBody
              groups={groups}
              isExpanded={true}
              isMobile={true}
              isCollapsed={false}
              onCloseMobile={onCloseMobile}
            />
          </div>
        </div>
      )}
    </>
  );
}
