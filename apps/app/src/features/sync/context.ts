/** @file Global controller context; absent integration exposes an honest unavailable state. */
import { createContext } from 'react';
import { createSyncController } from './controller';
export const unconfiguredSync = createSyncController();
export const SyncContext = createContext(unconfiguredSync);
