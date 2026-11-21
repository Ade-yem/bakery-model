import { StaffState } from './features/staff-workspace/StaffState';
/**
 * @file Application router root for Cadence app & authentication portal.
 */

import React from 'react';
import type { WorkspaceAdapter } from './features/integration/workspace';
import type { AuthClient } from './features/integration/auth';
import { AuthProvider } from './features/integration/AuthProvider';
import { SyncProvider } from './features/sync/SyncProvider';
import type { SyncAdapter } from './features/sync/types';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceRoute } from './features/staff-workspace/WorkspaceRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

/**
 * @description Main app router hosting authentication and authenticated portal.
 * @returns {React.ReactElement} The rendered React tree.
 */
export function App({
  syncAdapter,
  authClient,
  workspaceAdapter,
}: {
  syncAdapter?: SyncAdapter;
  authClient?: AuthClient;
  workspaceAdapter?: WorkspaceAdapter;
} = {}): React.ReactElement {
  return (
    <AuthProvider client={authClient}>
      <SyncProvider adapter={syncAdapter}>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-flour text-oven-black selection:bg-verdigris selection:text-flour font-sans antialiased">
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/workspace/*"
                  element={<WorkspaceRoute adapter={workspaceAdapter} />}
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route
                  path="*"
                  element={
                    <StaffState
                      title="Page not found"
                      description="The requested page is unavailable."
                      to="/workspace"
                      action="Return to my workspace"
                    />
                  }
                />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </SyncProvider>
    </AuthProvider>
  );
}

export default App;
