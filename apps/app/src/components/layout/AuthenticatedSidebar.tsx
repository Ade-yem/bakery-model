/**
 * @file Reusable authenticated application sidebar with clean minimal white styling, hover-to-expand rail on desktop, and dedicated slide-in drawer on mobile.
 */

import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  CreditCard,
  Layers,
  Receipt,
  Users,
  LifeBuoy,
  Bell,
  Settings,
  PanelLeftClose,
  X,
  ClipboardList,
  Files,
  History,
  CalendarDays,
  UserRound,
  Store,
  DollarSign,
  Package,
  FileText,
  Clock,
  Sparkles,
  Shield,
  Lock,
} from 'lucide-react';
import { filterNavGroupsByPermissions } from './permission-filter';
import type { AuthenticatedSidebarProps, LayoutNavItem } from './types';

const ICON_REGISTRY: Record<string, React.ReactElement> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5 shrink-0" />,
  TrendingUp: <TrendingUp className="w-5 h-5 shrink-0" />,
  Building2: <Building2 className="w-5 h-5 shrink-0" />,
  CreditCard: <CreditCard className="w-5 h-5 shrink-0" />,
  Layers: <Layers className="w-5 h-5 shrink-0" />,
  Receipt: <Receipt className="w-5 h-5 shrink-0" />,
  Users: <Users className="w-5 h-5 shrink-0" />,
  LifeBuoy: <LifeBuoy className="w-5 h-5 shrink-0" />,
  Bell: <Bell className="w-5 h-5 shrink-0" />,
  Settings: <Settings className="w-5 h-5 shrink-0" />,
  ClipboardList: <ClipboardList className="w-5 h-5 shrink-0" />,
  Files: <Files className="w-5 h-5 shrink-0" />,
  History: <History className="w-5 h-5 shrink-0" />,
  CalendarDays: <CalendarDays className="w-5 h-5 shrink-0" />,
  UserRound: <UserRound className="w-5 h-5 shrink-0" />,
  Store: <Store className="w-5 h-5 shrink-0" />,
  DollarSign: <DollarSign className="w-5 h-5 shrink-0" />,
  Package: <Package className="w-5 h-5 shrink-0" />,
  FileText: <FileText className="w-5 h-5 shrink-0" />,
  Clock: <Clock className="w-5 h-5 shrink-0" />,
  Sparkles: <Sparkles className="w-5 h-5 shrink-0" />,
  Shield: <Shield className="w-5 h-5 shrink-0" />,
  Lock: <Lock className="w-5 h-5 shrink-0" />,
};

function renderItemIcon(icon: LayoutNavItem['icon']): React.ReactElement {
  if (React.isValidElement(icon)) return icon;
  if (typeof icon === 'string' && ICON_REGISTRY[icon]) return ICON_REGISTRY[icon];
  return <Sparkles className="w-5 h-5 shrink-0" />;
}

interface SidebarBodyProps {
  actor: AuthenticatedSidebarProps['actor'];
  visibleGroups: ReturnType<typeof filterNavGroupsByPermissions>;
  isExpanded: boolean;
  isMobile: boolean;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  brandTitle: string;
  brandSubtitle?: string;
  brandHomeHref: string;
  footerSlot?: React.ReactNode;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  isFloatingHover?: boolean;
}

/**
 * @description Renders internal sidebar brand, scope badge, and navigation items.
 * @param {SidebarBodyProps} props - Internal sidebar properties.
 * @returns {React.ReactElement} Internal sidebar element.
 */
function SidebarBody({
  actor,
  visibleGroups,
  isExpanded,
  isMobile,
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
  brandTitle,
  brandSubtitle,
  brandHomeHref,
  footerSlot,
  onHoverStart,
  onHoverEnd,
  isFloatingHover = false,
}: SidebarBodyProps): React.ReactElement {
  return (
    <div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={`flex flex-col h-full bg-white text-[#10201F] border-r border-[#D9D3C0] font-sans select-none ${
        isMobile
          ? 'w-full rounded-none'
          : 'rounded-t-2xl md:rounded-tr-2xl md:rounded-br-2xl transition-all duration-200'
      } overflow-hidden ${
        isFloatingHover ? 'shadow-2xl ring-1 ring-[#10201F]/10' : 'shadow-xs'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center ${
          !isExpanded ? 'justify-center' : 'justify-between px-4'
        } border-b border-[#E5E0D0] shrink-0`}
      >
        <Link
          to={brandHomeHref}
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
            <div className="flex flex-col leading-none">
              <div className="flex items-center tracking-tight font-extrabold text-sm uppercase">
                <span className="sr-only">{brandTitle}</span>
                <span className="text-[#0B5C63]">TALLY</span>
                <span className="text-[#A9501A] ml-1">BAKERY</span>
              </div>
              {brandSubtitle && (
                <span className="text-[9px] font-bold tracking-wider uppercase text-[#0B5C63] bg-[#0B5C63]/10 px-1.5 py-0.5 rounded mt-0.5 inline-block w-fit">
                  {brandSubtitle}
                </span>
              )}
            </div>
          )}
        </Link>

        {isExpanded && (
          <div className="flex items-center gap-1">
            {!isMobile && onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
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
                aria-label="Close navigation"
                onClick={onCloseMobile}
                className="p-1.5 text-[#10201F]/60 hover:text-[#10201F] hover:bg-[#F6F3EA] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tenant & Branch Scope Badge */}
      {isExpanded && (actor.tenantName || actor.branchName) && (
        <div className="px-4 py-2 bg-[#F9F7F1] border-b border-[#E5E0D0] text-xs shrink-0">
          {actor.tenantName && (
            <div className="font-bold text-[#10201F] truncate leading-tight">
              {actor.tenantName}
            </div>
          )}
          {actor.branchName && (
            <div className="text-[11px] text-[#0B5C63] font-semibold truncate mt-0.5">
              {actor.branchName}
            </div>
          )}
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-4">
        {visibleGroups.map((group, groupIdx) => (
          <div key={`${group.groupTitle}-${groupIdx}`} className="space-y-1">
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
                    title={!isExpanded ? item.label : undefined}
                    onClick={() => {
                      if (isMobile && onCloseMobile) onCloseMobile();
                      if (onHoverEnd) onHoverEnd();
                    }}
                    className={({ isActive }) =>
                      `flex items-center ${
                        !isExpanded ? 'justify-center w-11 h-11 mx-auto' : 'justify-between px-3.5 py-2.5'
                      } rounded-xl text-[15px] transition-all ${
                        isActive
                          ? 'bg-[#EFEBDB] text-[#10201F] font-semibold shadow-2xs'
                          : 'text-[#10201F]/80 font-medium hover:text-[#10201F] hover:bg-[#F6F3EA]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {renderItemIcon(item.icon)}
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

      {/* Optional Custom Footer Slot */}
      {footerSlot && (
        <div className="p-3 border-t border-[#E5E0D0] space-y-2 bg-[#F9F7F1]/40 shrink-0">
          {footerSlot}
        </div>
      )}
    </div>
  );
}

/**
 * @description Master authenticated sidebar with hover-expansion in collapsed rail mode, increased typography, and dedicated mobile drawer.
 * @param {AuthenticatedSidebarProps} props - Component properties.
 * @returns {React.ReactElement} Reusable sidebar component.
 */
export function AuthenticatedSidebar({
  actor,
  groups,
  isCollapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  brandTitle = 'TALLYBAKERY',
  brandSubtitle,
  brandHomeHref = '/',
  footerSlot,
}: AuthenticatedSidebarProps): React.ReactElement {
  const [isHovered, setIsHovered] = useState(false);
  const visibleGroups = filterNavGroupsByPermissions(groups, actor.permissions);

  // Background scroll lock and escape key dismissal for mobile drawer
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

  // Desktop hover expansion state
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
          actor={actor}
          visibleGroups={visibleGroups}
          isExpanded={isDesktopExpanded}
          isMobile={false}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
          brandTitle={brandTitle}
          brandSubtitle={brandSubtitle}
          brandHomeHref={brandHomeHref}
          footerSlot={footerSlot}
          onHoverStart={() => {
            if (isCollapsed) setIsHovered(true);
          }}
          onHoverEnd={() => {
            if (isCollapsed) setIsHovered(false);
          }}
          isFloatingHover={isFloatingHover}
        />
      </aside>

      {/* Dedicated Mobile Navigation Drawer (Hidden on desktop) */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
          className="md:hidden fixed inset-0 z-50 flex"
        >
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-[#10201F]/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-In Drawer Panel: always expanded with full icons and labels */}
          <div className="relative flex-1 flex flex-col w-72 sm:w-80 max-w-[85vw] bg-white z-50 shadow-2xl transition-transform duration-300 transform translate-x-0">
            <SidebarBody
              actor={actor}
              visibleGroups={visibleGroups}
              isExpanded={true}
              isMobile={true}
              isCollapsed={false}
              onCloseMobile={onCloseMobile}
              brandTitle={brandTitle}
              brandSubtitle={brandSubtitle}
              brandHomeHref={brandHomeHref}
              footerSlot={footerSlot}
            />
          </div>
        </div>
      )}
    </>
  );
}
