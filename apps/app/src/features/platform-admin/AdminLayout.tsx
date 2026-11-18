/**
 * @file Main responsive shell layout for the TallyBakery Platform Admin interface.
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import type { AuthenticatedActor } from '../../components/layout/types';

export interface AdminLayoutProps {
  /** Optional authenticated actor holding platform permissions. */
  actor?: AuthenticatedActor;
  /** Optional nested children (or defaults to React Router <Outlet />). */
  children?: React.ReactNode;
}

/**
 * @description Master wrapper component managing collapsible navigation sidebar, topbar, and page content frame.
 * @param {AdminLayoutProps} props - Layout child components.
 * @returns {React.ReactElement} Master admin layout frame.
 * @example
 * ```tsx
 * <AdminLayout actor={actor}>
 *   <AdminDashboard />
 * </AdminLayout>
 * ```
 */
const SIDEBAR_STORAGE_KEY = 'tb_sidebar_collapsed';

export function AdminLayout({ actor, children }: AdminLayoutProps): React.ReactElement {
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

  return (
    <div className="flex h-screen bg-[#F6F3EA] text-[#10201F] overflow-hidden font-sans">
      {/* Sidebar (Desktop pinned & Mobile drawer) */}
      <AdminSidebar
        actor={actor}
        isCollapsed={isCollapsed}
        onToggle={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-y-auto overflow-x-hidden">
        <AdminTopbar
          actor={actor}
          onToggleSidebar={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
