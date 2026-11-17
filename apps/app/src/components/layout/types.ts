/**
 * @file Contracts and interfaces for the shared authenticated application layout system.
 */

import type { ReactNode } from 'react';

/**
 * Normalized representation of an authenticated actor across all roles.
 */
export interface AuthenticatedActor {
  /** Unique actor identifier. */
  id: string;
  /** Full display name. */
  fullName: string;
  /** User business or personal email address. */
  email: string;
  /** Primary operational designation (e.g., "Platform Super Admin", "Bakery Owner"). */
  designation: string;
  /** Optional visual role tag (e.g., "Super Admin", "Owner", "Manager", "Staff"). */
  roleBadge?: string;
  /** Optional profile image URL. */
  avatarUrl?: string;
  /** Two-letter avatar initials fallback. */
  initials?: string;
  /** Backend-resolved action permissions held by the actor. */
  permissions: readonly string[];
  /** Optional associated bakery tenant name. */
  tenantName?: string;
  /** Optional associated branch location. */
  branchName?: string;
}

/**
 * Individual navigation link descriptor.
 */
export interface LayoutNavItem {
  /** Navigation item label. */
  label: string;
  /** Target link path. */
  path: string;
  /** Lucide icon name or component element. */
  icon: string | ReactNode;
  /** Optional badge indicator count or label. */
  badge?: string | number;
  /** Specific permissions required to view this item. */
  requiredPermissions?: readonly string[];
  /** Exact route matching flag. */
  end?: boolean;
}

/**
 * Grouped navigation section descriptor.
 */
export interface LayoutNavGroup {
  /** Visual header for the group. */
  groupTitle: string;
  /** Permissions required to view this group. */
  requiredPermissions?: readonly string[];
  /** Child navigation links. */
  items: LayoutNavItem[];
}

/**
 * User account dropdown properties.
 */
export interface UserAccountDropdownProps {
  /** The currently authenticated actor. */
  actor: AuthenticatedActor;
  /** Sign out callback. */
  onSignOut?: () => void;
  /** Profile navigation or dialog callback. */
  onProfileClick?: () => void;
  /** Profile route link fallback. */
  profilePath?: string;
  /** Controlled open state for testing or external overrides. */
  isOpen?: boolean;
}

/**
 * Shared sidebar properties.
 */
export interface AuthenticatedSidebarProps {
  /** The authenticated actor holding permissions. */
  actor: AuthenticatedActor;
  /** Navigation groups to render. */
  groups: LayoutNavGroup[];
  /** Desktop rail collapsed state. */
  isCollapsed: boolean;
  /** Toggle desktop collapsed state. */
  onToggleCollapse: () => void;
  /** Mobile drawer open state. */
  mobileOpen?: boolean;
  /** Close mobile drawer callback. */
  onCloseMobile?: () => void;
  /** Primary brand mark title. */
  brandTitle?: string;
  /** Subtitle or workspace descriptor below brand mark. */
  brandSubtitle?: string;
  /** Brand home link target. */
  brandHomeHref?: string;
  /** Optional footer content slot inside sidebar. */
  footerSlot?: ReactNode;
}

/**
 * Shared topbar properties.
 */
export interface AuthenticatedTopbarProps {
  /** The authenticated actor. */
  actor: AuthenticatedActor;
  /** Callback to trigger mobile sidebar opening. */
  onToggleMobileSidebar: () => void;
  /** Active page title. */
  title?: string;
  /** Optional breadcrumbs path. */
  breadcrumbs?: Array<{ label: string; to?: string }>;
  /** Optional topbar right action controls slot. */
  actions?: ReactNode;
  /** Sign out callback. */
  onSignOut?: () => void;
  /** Profile click callback. */
  onProfileClick?: () => void;
  /** Profile path override. */
  profilePath?: string;
}

/**
 * Shared master application layout properties.
 */
export interface AuthenticatedAppLayoutProps {
  /** Authenticated actor with resolved permissions. */
  actor: AuthenticatedActor;
  /** Role-specific navigation groups. */
  navGroups: LayoutNavGroup[];
  /** Main page content. */
  children?: ReactNode;
  /** Topbar title override. */
  title?: string;
  /** Breadcrumb items. */
  breadcrumbs?: Array<{ label: string; to?: string }>;
  /** Brand header title override. */
  brandTitle?: string;
  /** Brand header subtitle override. */
  brandSubtitle?: string;
  /** Brand home link target. */
  brandHomeHref?: string;
  /** Topbar actions slot. */
  topbarActions?: ReactNode;
  /** Sidebar footer slot. */
  sidebarFooterSlot?: ReactNode;
  /** Sign out action handler. */
  onSignOut?: () => void;
  /** Profile click action handler. */
  onProfileClick?: () => void;
  /** Profile path link. */
  profilePath?: string;
}
