import type { ReactNode } from 'react';
import { useStaffActions } from './policy';
export function Allowed({ action, children }: { action: string; children: ReactNode }) {
  return useStaffActions().allowed(action) ? children : null;
}
