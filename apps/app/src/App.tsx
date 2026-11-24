/**
 * @file Application router root for Cadence app & authentication portal.
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import type { ApiClient } from './features/api/http';
import type { WorkspaceAdapter } from './features/integration/workspace';
import type { AuthClient } from './features/integration/auth';
import { AuthProvider } from './features/integration/AuthProvider';
import { SyncProvider } from './features/sync/SyncProvider';
import type { SyncAdapter } from './features/sync/types';
import { AppRoutes } from './AppRoutes';

/**
 * @description Main app router hosting authentication and authenticated portal.
 * @returns {React.ReactElement} The rendered React tree.
 */
export function App({
  syncAdapter,
  authClient,
  workspaceAdapter,
  api,
}: {
  syncAdapter?: SyncAdapter;
  authClient?: AuthClient;
  workspaceAdapter?: WorkspaceAdapter;
  api?: ApiClient;
} = {}): React.ReactElement {
  return (
    <AuthProvider client={authClient}>
      <SyncProvider adapter={syncAdapter}>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-flour text-oven-black selection:bg-verdigris selection:text-flour font-sans antialiased">
            <main className="flex-1">
              <AppRoutes workspaceAdapter={workspaceAdapter} api={api} />
            </main>
          </div>
        </BrowserRouter>
      </SyncProvider>
    </AuthProvider>
  );
}

export default App;