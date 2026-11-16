import { RoleKey } from '@repo/shared';
import { PermissionKey } from '../access-control/permissions.js';

export interface ActorContext {
  requestId: string;
  authUserId: string;
  membershipId: string;
  tenantId: string;
  role: RoleKey;
  branchIds: readonly string[];
  departmentIds: readonly string[];
  activeBranchId?: string;
  activeDepartmentId?: string;
  permissions: ReadonlySet<PermissionKey>;
}
