/**
 * @file Platform Admin route definitions and layout mapping.
 */

import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminPlaceholderPage } from './AdminPlaceholderPage';
import { BusinessesManagementPage } from './businesses/BusinessesManagementPage';
import { BusinessDetailsPage } from './businesses/BusinessDetailsPage';
import { ClientAdminsPage } from './client-admins/ClientAdminsPage';
import { PlansOverviewPage } from './plans/PlansOverviewPage';
import { PlanDetailsPage } from './plans/PlanDetailsPage';
import { CreatePlanPage } from './plans/CreatePlanPage';
import { EditPlanPage } from './plans/EditPlanPage';
import { SubscriptionsDirectoryPage } from './subscriptions/SubscriptionsDirectoryPage';
import { SubscriptionDetailsPage } from './subscriptions/SubscriptionDetailsPage';
import { AuditOverviewPage } from './audit/AuditOverviewPage';
import { PlatformSettingsPage } from './settings/PlatformSettingsPage';
import { NotFound } from '../../pages/NotFound';
import { PLATFORM_PERMISSIONS, hasPlatformPermission } from './permissions';
import type { AuthenticatedActor } from '../../components/layout/types';

const DEFAULT_SUPER_ADMIN: AuthenticatedActor = {
  id: 'admin-super-default',
  fullName: 'Amara Okafor',
  email: 'admin@tallybakery.app',
  designation: 'Platform Super Admin',
  roleBadge: 'Super Admin',
  initials: 'AO',
  permissions: Object.values(PLATFORM_PERMISSIONS),
};

export interface AdminRoutesProps {
  /** Optional authenticated actor override for permission evaluation. */
  actor?: AuthenticatedActor;
}

/**
 * Access restricted notice rendered when an actor lacks route-level permission.
 */
function AdminAccessRestricted({ permission }: { permission: string }): React.ReactElement {
  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto my-8">
      <div className="p-6 bg-white border border-[#D9D3C0] rounded-2xl shadow-xs space-y-4 font-sans">
        <div className="p-4 bg-status-unbalanced/8 border-l-4 border-status-unbalanced text-[#8C1D18] rounded-r text-sm">
          <div className="font-bold text-base mb-1">Access Restricted</div>
          <p className="leading-relaxed">
            Your administrator account lacks the required permission (
            <code className="font-mono bg-[#8C1D18]/10 px-1.5 py-0.5 rounded text-xs font-semibold">
              {permission}
            </code>
            ) to access this platform module.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0B5C63] hover:bg-[#0F7480] text-[#F6F3EA] font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Route-level permission gate.
 */
function AdminRouteGate({
  actor,
  permission,
  children,
}: {
  actor: AuthenticatedActor;
  permission: string;
  children: React.ReactElement;
}): React.ReactElement {
  if (!hasPlatformPermission(actor, permission)) {
    return <AdminAccessRestricted permission={permission} />;
  }
  return children;
}

/**
 * @description Routing sub-tree for Platform Admin with permission-based route protection.
 * @param {AdminRoutesProps} props - Routing configurations and actor.
 * @returns {React.ReactElement} Route elements for all platform admin sections.
 * @example
 * ```tsx
 * <Route path="/admin/*" element={<AdminRoutes />} />
 * ```
 */
export function AdminRoutes({ actor = DEFAULT_SUPER_ADMIN }: AdminRoutesProps): React.ReactElement {
  return (
    <AdminLayout actor={actor}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.DASHBOARD_VIEW}>
              <AdminDashboard actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="businesses"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.BUSINESSES_VIEW}>
              <BusinessesManagementPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="businesses/:id"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.BUSINESSES_VIEW}>
              <BusinessDetailsPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="client-admins"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.CLIENT_ADMINS_VIEW}>
              <ClientAdminsPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="users"
          element={
            <Navigate to="../client-admins" replace />
          }
        />
        <Route
          path="plans"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.PLANS_VIEW}>
              <PlansOverviewPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="plans/new"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.PLANS_MANAGE}>
              <CreatePlanPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="plans/:id"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.PLANS_VIEW}>
              <PlanDetailsPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="plans/:id/edit"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.PLANS_MANAGE}>
              <EditPlanPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="subscriptions"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW}>
              <SubscriptionsDirectoryPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="subscriptions/:id"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW}>
              <SubscriptionDetailsPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="audit"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.AUDIT_VIEW}>
              <AuditOverviewPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="transactions"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW}>
              <AdminPlaceholderPage
                title="Transactions"
                description="Audit platform-wide billing records, payment gateway settlements, and invoices."
              />
            </AdminRouteGate>
          }
        />
        <Route
          path="support"
          element={
            <AdminPlaceholderPage
              title="Support"
              description="Track customer support inquiries, tenant escalations, and incident resolutions."
            />
          }
        />
        <Route
          path="notifications"
          element={
            <AdminPlaceholderPage
              title="Notifications"
              description="Broadcast system announcements and configure automated operational alerts."
            />
          }
        />
        <Route
          path="analytics"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.DASHBOARD_VIEW}>
              <AdminPlaceholderPage
                title="Analytics"
                description="Examine growth, recurring revenue, offline sync performance, and platform adoption."
              />
            </AdminRouteGate>
          }
        />
        <Route
          path="settings"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.SETTINGS_VIEW}>
              <PlatformSettingsPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="settings/profile"
          element={
            <AdminRouteGate actor={actor} permission={PLATFORM_PERMISSIONS.SETTINGS_VIEW}>
              <PlatformSettingsPage actor={actor} />
            </AdminRouteGate>
          }
        />
        <Route
          path="*"
          element={
            <NotFound
              homePath="/admin/dashboard"
              homeLabel="Back to Admin Dashboard"
              isNested={true}
            />
          }
        />
      </Routes>
    </AdminLayout>
  );
}
