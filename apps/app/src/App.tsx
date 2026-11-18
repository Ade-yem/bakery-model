/**
 * @file Application router root for Cadence app & authentication portal.
 */

import React from 'react';
import { SyncProvider } from './features/sync/SyncProvider';
import type { SyncAdapter } from './features/sync/types';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';

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
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </SyncProvider>
  );
}

export default App;
