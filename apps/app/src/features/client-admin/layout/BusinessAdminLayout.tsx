/**
 * @file Master layout shell for the Cadence Client Admin Dashboard,
 * wiring dynamic navigation, stateful sidebar collapsing, and the main page content frame.
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BusinessAdminSidebar } from './BusinessAdminSidebar';
import { BusinessAdminTopbar } from './BusinessAdminTopbar';
import { getClientAdminNavGroups } from './nav-config';
import { useTenant } from '../context/TenantContext';

export interface BusinessAdminLayoutProps {
  children?: React.ReactNode;
}

const SIDEBAR_STORAGE_KEY = 'cadence_biz_sidebar_collapsed';

export function BusinessAdminLayout({ children }: BusinessAdminLayoutProps): React.ReactElement {
  const { subscription, actor } = useTenant();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const navGroups = getClientAdminNavGroups({
    subscription,
    permissions: actor.permissions,
  });

  return (
    <div className="flex h-screen bg-[#F6F3EA] text-[#10201F] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <BusinessAdminSidebar
        groups={navGroups}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-y-auto overflow-x-hidden">
        <BusinessAdminTopbar onToggleSidebar={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
