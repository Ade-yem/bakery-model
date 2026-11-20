/**
 * @file Master application route declarations with lazy loading, top-level skeletons, and error boundary protection.
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { RouteSkeleton } from './components/loading/RouteSkeleton';
import { NotFound } from './pages/NotFound';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })));
const ReceptionWorkspace = lazy(() =>
  import('./features/staff-workspace/reception/ReceptionWorkspace').then((m) => ({
    default: m.ReceptionWorkspace,
  }))
);
const StaffWorkspace = lazy(() =>
  import('./features/staff-workspace/StaffWorkspace').then((m) => ({
    default: m.StaffWorkspace,
  }))
);
const AdminRoutes = lazy(() =>
  import('./features/platform-admin/AdminRoutes').then((m) => ({
    default: m.AdminRoutes,
  }))
);
const BusinessAdminRoutes = lazy(() =>
  import('./features/client-admin/BusinessAdminRoutes').then((m) => ({
    default: m.BusinessAdminRoutes,
  }))
);

/**
 * Component used to simulate an intentional render crash for testing ErrorBoundary.
 */
function BuggyCrashComponent(): React.ReactElement {
  throw new Error('Intentional rendering error for testing ErrorBoundary');
}

/**
 * Preview showcase page for testing all RouteSkeleton variants.
 */
function SkeletonPreviewPage(): React.ReactElement {
  const [selectedVariant, setSelectedVariant] = React.useState<'dashboard' | 'management' | 'detail' | 'general'>('dashboard');

  return (
    <div className="min-h-screen bg-flour text-oven-black p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-rule shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-oven-black">Route Loading Skeletons Preview</h1>
            <p className="text-sm text-oven-black/70">Interactive showcase of all 4 TallyBakery loading skeleton variations.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['dashboard', 'management', 'detail', 'general'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedVariant === v
                    ? 'bg-verdigris text-flour shadow-xs'
                    : 'bg-ledger text-oven-black hover:bg-ledger/80 border border-rule'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-rule shadow-sm">
          <RouteSkeleton variant={selectedVariant} />
        </div>
      </div>
    </div>
  );
}

/**
 * @description Master router tree with Suspense loading states and ErrorBoundary protection.
 * @returns {React.ReactElement} Application routes tree.
 */
export function AppRoutes(): React.ReactElement {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteSkeleton variant="general" />}>
        <Routes>
          {/* Public & Authentication Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Staff Workspace Routes */}
          <Route
            path="/workspace-preview/reception/*"
            element={
              <Suspense fallback={<RouteSkeleton variant="management" />}>
                <ReceptionWorkspace />
              </Suspense>
            }
          />
          <Route
            path="/workspace-preview/*"
            element={
              <Suspense fallback={<RouteSkeleton variant="dashboard" />}>
                <StaffWorkspace preview />
              </Suspense>
            }
          />
          <Route
            path="/workspace/*"
            element={
              <Suspense fallback={<RouteSkeleton variant="dashboard" />}>
                <StaffWorkspace />
              </Suspense>
            }
          />

          {/* Platform Admin Sub-Tree */}
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<RouteSkeleton variant="dashboard" />}>
                <AdminRoutes />
              </Suspense>
            }
          />

          {/* Client Business Admin Sub-Tree */}
          <Route
            path="/business/*"
            element={
              <Suspense fallback={<RouteSkeleton variant="dashboard" />}>
                <BusinessAdminRoutes />
              </Suspense>
            }
          />

          {/* Dev Preview Routes (for visual testing) */}
          <Route path="/dev/skeletons" element={<SkeletonPreviewPage />} />
          <Route
            path="/dev/error"
            element={
              <ErrorBoundary>
                <BuggyCrashComponent />
              </ErrorBoundary>
            }
          />
          <Route path="/404" element={<NotFound />} />

          {/* Top-Level Catch-All 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
