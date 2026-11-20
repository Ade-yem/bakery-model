/**
 * @file Application router root for Cadence app & authentication portal.
 */

import React from 'react';
import { SyncProvider } from './features/sync/SyncProvider';
import type { SyncAdapter } from './features/sync/types';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ReceptionWorkspace } from './features/staff-workspace/reception/ReceptionWorkspace';
import { ProcurementWorkspace } from './features/staff-workspace/procurement/ProcurementWorkspace';
import { StaffWorkspace } from './features/staff-workspace/StaffWorkspace';
import { ForgotPassword } from './pages/ForgotPassword';

/**
 * @description Main app router hosting authentication and authenticated portal.
 * @returns {React.ReactElement} The rendered React tree.
 */
export function App({ syncAdapter }: { syncAdapter?: SyncAdapter } = {}): React.ReactElement {
  return (
    <SyncProvider adapter={syncAdapter}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-flour text-oven-black selection:bg-verdigris selection:text-flour font-sans antialiased">
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/workspace-preview/reception/*" element={<ReceptionWorkspace />} />
              <Route path="/workspace-preview/procurement/*" element={<ProcurementWorkspace />} />
              <Route path="/workspace-preview/*" element={<StaffWorkspace preview />} />
              <Route path="/workspace/*" element={<StaffWorkspace />} />
              {/* Fallback to Login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SyncProvider>
  );
}

export default App;
