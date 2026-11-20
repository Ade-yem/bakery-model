/**
 * @file Master routing tree for the Cadence Client Admin Dashboard,
 * wrapped in the multi-tenant context provider and layout shell.
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import { BusinessAdminLayout } from './layout/BusinessAdminLayout';
import { RouteSkeleton } from '../../components/loading/RouteSkeleton';

// Lazy-loaded Client Admin Views
const BusinessOverviewPage = lazy(() =>
  import('./overview/BusinessOverviewPage').then((m) => ({ default: m.BusinessOverviewPage }))
);
const BusinessProfilePage = lazy(() =>
  import('./profile/BusinessProfilePage').then((m) => ({ default: m.BusinessProfilePage }))
);
const BranchManagementPage = lazy(() =>
  import('./branches/BranchManagementPage').then((m) => ({ default: m.BranchManagementPage }))
);
const DepartmentBuilderPage = lazy(() =>
  import('./departments/DepartmentBuilderPage').then((m) => ({ default: m.DepartmentBuilderPage }))
);
const DepartmentConfigPage = lazy(() =>
  import('./departments/DepartmentConfigPage').then((m) => ({ default: m.DepartmentConfigPage }))
);
const StaffManagementPage = lazy(() =>
  import('./staff/StaffManagementPage').then((m) => ({ default: m.StaffManagementPage }))
);
const RolesPermissionsPage = lazy(() =>
  import('./roles/RolesPermissionsPage').then((m) => ({ default: m.RolesPermissionsPage }))
);
const ShiftSchedulingPage = lazy(() =>
  import('./shifts/ShiftSchedulingPage').then((m) => ({ default: m.ShiftSchedulingPage }))
);
const BusinessOperationsPage = lazy(() =>
  import('./operations/BusinessOperationsPage').then((m) => ({ default: m.BusinessOperationsPage }))
);
const ReportsHistoryPage = lazy(() =>
  import('./reports/ReportsHistoryPage').then((m) => ({ default: m.ReportsHistoryPage }))
);
const BusinessSettingsPage = lazy(() =>
  import('./settings/BusinessSettingsPage').then((m) => ({ default: m.BusinessSettingsPage }))
);

/**
 * Nested 404 notice within the Client Admin workspace layout.
 */
function BusinessNotFound(): React.ReactElement {
  return (
    <div className="p-8 max-w-xl mx-auto my-12 text-center bg-white rounded-3xl border border-[#D9D3C0] shadow-xs space-y-4 font-sans">
      <h2 className="text-xl font-extrabold text-[#10201F]">
        Workspace Page Not Found
      </h2>
      <p className="text-xs text-[#10201F]/70">
        The requested business administration section does not exist or has been relocated.
      </p>
      <div className="pt-2">
        <Link
          to="/business/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#0B5C63] text-white text-xs font-bold shadow-xs hover:bg-[#0F7480] transition-colors"
        >
          Return to Business Overview
        </Link>
      </div>
    </div>
  );
}

export function BusinessAdminRoutes(): React.ReactElement {
  return (
    <TenantProvider>
      <BusinessAdminLayout>
        <Suspense fallback={<RouteSkeleton variant="dashboard" />}>
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BusinessOverviewPage />} />
            <Route path="profile" element={<BusinessProfilePage />} />
            <Route path="branches" element={<BranchManagementPage />} />
            <Route path="departments" element={<DepartmentBuilderPage />} />
            <Route path="departments/config" element={<DepartmentConfigPage />} />
            <Route path="staff" element={<StaffManagementPage />} />
            <Route path="roles" element={<RolesPermissionsPage />} />
            <Route path="shifts" element={<ShiftSchedulingPage />} />
            <Route path="operations/:moduleKey" element={<BusinessOperationsPage />} />
            <Route path="reports" element={<ReportsHistoryPage />} />
            <Route path="settings" element={<BusinessSettingsPage />} />
            <Route path="*" element={<BusinessNotFound />} />
          </Routes>
        </Suspense>
      </BusinessAdminLayout>
    </TenantProvider>
  );
}
