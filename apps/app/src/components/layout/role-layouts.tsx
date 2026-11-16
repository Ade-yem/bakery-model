/**
 * @file Role-specific layout wrappers inheriting the shared authenticated layout architecture.
 */

import React, { type ReactNode } from 'react';
import { CheckCircle2, Bell } from 'lucide-react';
import { AuthenticatedAppLayout } from './AuthenticatedAppLayout';
import {
  PLATFORM_ADMIN_NAV_GROUPS,
  BUSINESS_OWNER_NAV_GROUPS,
  MANAGER_NAV_GROUPS,
  STAFF_NAV_GROUPS,
} from './role-nav-configs';
import type { AuthenticatedActor } from './types';

const DEFAULT_ADMIN_ACTOR: AuthenticatedActor = {
  id: 'admin-default',
  fullName: 'Amara Okafor',
  email: 'admin@tallybakery.app',
  designation: 'Platform Super Admin',
  roleBadge: 'Super Admin',
  initials: 'AO',
  permissions: [
    'admin:dashboard:view',
    'admin:businesses:view',
    'admin:users:view',
    'admin:plans:view',
    'admin:subscriptions:view',
    'admin:transactions:view',
    'admin:support:view',
    'admin:notifications:view',
    'admin:analytics:view',
    'admin:settings:view',
  ],
};

const DEFAULT_OWNER_ACTOR: AuthenticatedActor = {
  id: 'owner-default',
  fullName: 'Babajide Adeleke',
  email: 'adeleke@grandflour.com',
  designation: 'Bakery Owner',
  roleBadge: 'Owner',
  initials: 'BA',
  tenantName: 'Grand Flourish Bakeries',
  permissions: [
    'owner:dashboard:view',
    'owner:branches:view',
    'owner:finances:view',
    'owner:staff:view',
    'owner:inventory:view',
    'owner:reports:view',
    'owner:settings:view',
  ],
};

const DEFAULT_MANAGER_ACTOR: AuthenticatedActor = {
  id: 'manager-default',
  fullName: 'Chioma Nwosu',
  email: 'chioma.mgr@grandflour.com',
  designation: 'Branch Manager',
  roleBadge: 'Manager',
  initials: 'CN',
  tenantName: 'Grand Flourish Bakeries',
  branchName: 'Ikeja Branch',
  permissions: [
    'manager:dashboard:view',
    'manager:shifts:view',
    'manager:production:view',
    'manager:reception:view',
    'manager:inventory:view',
    'manager:staff:view',
  ],
};

const DEFAULT_STAFF_ACTOR: AuthenticatedActor = {
  id: 'staff-default',
  fullName: 'Danladi Bello',
  email: 'danladi@grandflour.com',
  designation: 'Production Supervisor',
  roleBadge: 'Staff',
  initials: 'DB',
  tenantName: 'Grand Flourish Bakeries',
  branchName: 'Ikeja Branch',
  permissions: [
    'staff:dashboard:view',
    'production:view',
    'records:view',
    'history:view',
    'schedule:view',
  ],
};

export interface RoleLayoutProps {
  /** Optional authenticated actor override. */
  actor?: AuthenticatedActor;
  /** Child view content. */
  children?: ReactNode;
  /** Topbar title override. */
  title?: string;
  /** Optional breadcrumbs path. */
  breadcrumbs?: Array<{ label: string; to?: string }>;
  /** Sign out callback. */
  onSignOut?: () => void;
}

/**
 * @description Platform Administrator master layout implementing shared layout primitives.
 * @param {RoleLayoutProps} props - Role layout properties.
 * @returns {React.ReactElement} Admin layout element.
 */
export function PlatformAdminLayout({
  actor = DEFAULT_ADMIN_ACTOR,
  children,
  title = 'Platform Overview',
  breadcrumbs,
  onSignOut,
}: RoleLayoutProps): React.ReactElement {
  return (
    <AuthenticatedAppLayout
      actor={actor}
      navGroups={PLATFORM_ADMIN_NAV_GROUPS}
      title={title}
      breadcrumbs={breadcrumbs}
      brandSubtitle="Platform Admin"
      brandHomeHref="/admin/dashboard"
      topbarActions={
        <div className="flex items-center gap-2">
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF3E8] text-[#3F7A2A] border border-[#CBE2C4]"
            title="All systems operational and database gateways connected"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7A2A]" />
            <span>Platform Healthy</span>
          </div>
          <button
            type="button"
            aria-label="View notifications"
            className="relative p-2 rounded-lg text-[#10201F]/70 hover:text-[#10201F] hover:bg-[#F6F3EA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B5C63] cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#A9501A] text-[10px] font-bold text-white shadow-xs">
              3
            </span>
          </button>
        </div>
      }
      onSignOut={onSignOut}
    >
      {children}
    </AuthenticatedAppLayout>
  );
}

/**
 * @description Commercial Bakery Owner master layout implementing shared layout primitives.
 * @param {RoleLayoutProps} props - Role layout properties.
 * @returns {React.ReactElement} Owner layout element.
 */
export function BusinessOwnerLayout({
  actor = DEFAULT_OWNER_ACTOR,
  children,
  title = 'Executive Dashboard',
  breadcrumbs,
  onSignOut,
}: RoleLayoutProps): React.ReactElement {
  return (
    <AuthenticatedAppLayout
      actor={actor}
      navGroups={BUSINESS_OWNER_NAV_GROUPS}
      title={title}
      breadcrumbs={breadcrumbs}
      brandSubtitle="Bakery Owner"
      brandHomeHref="/owner/dashboard"
      onSignOut={onSignOut}
    >
      {children}
    </AuthenticatedAppLayout>
  );
}

/**
 * @description Branch Operations Manager master layout implementing shared layout primitives.
 * @param {RoleLayoutProps} props - Role layout properties.
 * @returns {React.ReactElement} Manager layout element.
 */
export function ManagerLayout({
  actor = DEFAULT_MANAGER_ACTOR,
  children,
  title = 'Branch Management',
  breadcrumbs,
  onSignOut,
}: RoleLayoutProps): React.ReactElement {
  return (
    <AuthenticatedAppLayout
      actor={actor}
      navGroups={MANAGER_NAV_GROUPS}
      title={title}
      breadcrumbs={breadcrumbs}
      brandSubtitle="Branch Manager"
      brandHomeHref="/manager/dashboard"
      onSignOut={onSignOut}
    >
      {children}
    </AuthenticatedAppLayout>
  );
}

/**
 * @description Production and Operations Staff master layout implementing shared layout primitives.
 * @param {RoleLayoutProps} props - Role layout properties.
 * @returns {React.ReactElement} Staff layout element.
 */
export function StaffLayout({
  actor = DEFAULT_STAFF_ACTOR,
  children,
  title = 'Staff Workspace',
  breadcrumbs,
  onSignOut,
}: RoleLayoutProps): React.ReactElement {
  return (
    <AuthenticatedAppLayout
      actor={actor}
      navGroups={STAFF_NAV_GROUPS}
      title={title}
      breadcrumbs={breadcrumbs}
      brandSubtitle="Staff Workspace"
      brandHomeHref="/workspace"
      onSignOut={onSignOut}
    >
      {children}
    </AuthenticatedAppLayout>
  );
}
