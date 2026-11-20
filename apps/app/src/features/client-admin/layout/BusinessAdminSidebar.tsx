/**
 * @file Collapsible sidebar navigation for the Cadence Client Admin Dashboard,
 * supporting desktop rail collapse, mobile drawer, and dynamic permission/subscription filtering.
 */

import React from 'react';
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
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import type { LayoutNavGroup, LayoutNavItem } from '../../../components/layout/types';
import { useTenant } from '../context/TenantContext';

export interface BusinessAdminSidebarProps {
  groups: LayoutNavGroup[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
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
};

export function BusinessAdminSidebar({
  groups,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: BusinessAdminSidebarProps): React.ReactElement {
  const { currentBusiness, subscription } = useTenant();

  const renderIcon = (iconName: string | React.ReactNode) => {
    if (typeof iconName === 'string') {
      const Comp = ICON_MAP[iconName] || LayoutDashboard;
      return <Comp size={18} className="shrink-0" />;
    }
    return iconName;
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#10201F] text-[#F6F3EA] select-none font-sans">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
        <Link
          to="/business/dashboard"
          className="flex items-center gap-2.5 min-w-0"
          onClick={onCloseMobile}
        >
          <div className="w-8 h-8 rounded-lg bg-[#0B5C63] text-white flex items-center justify-center font-black text-sm tracking-wider shadow-xs shrink-0">
            C
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm tracking-wider text-white uppercase leading-none">
                CADENCE
              </span>
              <span className="text-3xs tracking-widest text-white/50 uppercase mt-0.5">
                Client Admin
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.groupTitle} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-3xs font-bold uppercase tracking-wider text-white/40 mb-1.5">
                {group.groupTitle}
              </h3>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-[#0B5C63] text-white shadow-xs font-bold'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    {renderIcon(item.icon)}
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-3xs font-bold bg-white/10 text-white">
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

      {/* Desktop Collapse Footer Button */}
      <div className="hidden lg:flex items-center justify-between p-3 border-t border-white/10 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-2xs text-white/60 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="truncate">{subscription.tier} Workspace</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
            isCollapsed ? 'mx-auto' : ''
          }`}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Rail */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-[#10201F]/10 transition-all duration-200 z-20 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          role="presentation"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 z-50 lg:hidden transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </div>
    </>
  );
}
