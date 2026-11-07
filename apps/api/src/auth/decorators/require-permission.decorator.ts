import { SetMetadata } from '@nestjs/common';
import type { PermissionKey } from '../../access-control/permissions.js';

export const REQUIRE_PERMISSION_KEY = 'require_permission';
export const RequirePermission = (permission: PermissionKey) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permission);
