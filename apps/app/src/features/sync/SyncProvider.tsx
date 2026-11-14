/** @file Browser network lifecycle and authenticated queue status subscription. */
import { useEffect, useMemo, type ReactNode } from 'react';
import { createSyncController } from './controller';
import { SyncContext } from './context';
import type { SyncAdapter } from './types';
interface Props {
  children: ReactNode;
  adapter?: SyncAdapter;
}
/**
 * @description Shares one controller across the app; reconnect refreshes status without auto-posting mutations.
 * @param props Children and an optional session-scoped durable queue adapter. Replace adapter on scope change/logout.
 * @returns Global sync context with event/transport subscriptions cleaned up on unmount or adapter change.
 */
export function SyncProvider({ children, adapter }: Props) {
  const controller = useMemo(
    () => createSyncController(adapter, typeof navigator === 'undefined' ? true : navigator.onLine),
    [adapter]
  );
  useEffect(() => {
    /**
     * @description Applies the browser network hint and refreshes local queue/service status without posting events.
     * @returns Nothing.
     */
    function updateNetwork(): void {
      controller.setNetworkOnline(navigator.onLine);
      void controller.refresh();
    }
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    const unsubscribe = adapter?.subscribe?.(() => {
      void controller.refresh();
    });
    updateNetwork();
    return () => {
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
      unsubscribe?.();
      controller.dispose();
    };
  }, [adapter, controller]);
  return <SyncContext.Provider value={controller}>{children}</SyncContext.Provider>;
}
