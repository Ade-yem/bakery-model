/**
 * @file Master authenticated application layout unifying sidebar, topbar, and page content frame.
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthenticatedSidebar } from './AuthenticatedSidebar';
import { AuthenticatedTopbar } from './AuthenticatedTopbar';
import type { AuthenticatedAppLayoutProps } from './types';

/**
 * @description Master authenticated application shell coordinating responsive sidebar collapsing, topbar, and viewport scrolling.
 * @param {AuthenticatedAppLayoutProps} props - Layout child components and configuration.
 * @returns {React.ReactElement} Master application layout element.
 * @example
 * ```tsx
 * <AuthenticatedAppLayout actor={user} navGroups={OWNER_NAV_GROUPS}>
 *   <DashboardView />
 * </AuthenticatedAppLayout>
 * ```
 */
const SIDEBAR_STORAGE_KEY = 'tb_sidebar_collapsed';

export function AuthenticatedAppLayout({
  actor,
  navGroups,
  children,
  title,
  breadcrumbs,
  brandTitle = 'TALLYBAKERY',
  brandSubtitle,
  brandHomeHref = '/',
  topbarActions,
  sidebarFooterSlot,
  onSignOut,
  onProfileClick,
  profilePath,
}: AuthenticatedAppLayoutProps): React.ReactElement {
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
      {/* Shared Responsive Sidebar */}
      <AuthenticatedSidebar
        actor={actor}
        groups={navGroups}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
        brandHomeHref={brandHomeHref}
        footerSlot={sidebarFooterSlot}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-y-auto overflow-x-hidden">
        <AuthenticatedTopbar
          actor={actor}
          title={title}
          breadcrumbs={breadcrumbs}
          actions={topbarActions}
          onToggleMobileSidebar={() => setMobileOpen(true)}
          onSignOut={onSignOut}
          onProfileClick={onProfileClick}
          profilePath={profilePath}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
