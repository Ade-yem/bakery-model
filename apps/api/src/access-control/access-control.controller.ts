import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import {
  ALL_PERMISSIONS,
  ROLE_CEILINGS,
  PERMISSION_KEYS,
  type PermissionKey,
  type RoleKey,
} from './permissions.js';

@Controller()
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class AccessControlController {
  @Get('permissions')
  @RequirePermission(PERMISSION_KEYS.ROLES_READ)
  async listPermissions() {
    return { permissions: ALL_PERMISSIONS };
  }

  @Get('roles')
  @RequirePermission(PERMISSION_KEYS.ROLES_READ)
  async listRoles() {
    const rolesObj: Record<string, string[]> = {};
    for (const [key, permSet] of Object.entries(ROLE_CEILINGS)) {
      rolesObj[key] = Array.from(permSet);
    }
    return { roles: rolesObj };
  }

  @Put('roles/:roleKey/permissions')
  @RequirePermission(PERMISSION_KEYS.ROLES_MANAGE)
  async updateRolePermissions(
    @Param('roleKey') roleKey: RoleKey,
    @Body() body: { permissions: PermissionKey[] },
  ) {
    const ceiling = ROLE_CEILINGS[roleKey];
    if (!ceiling) {
      throw new ForbiddenException('Unknown role key');
    }
    const invalid = body.permissions.filter((p) => !ceiling.has(p));
    if (invalid.length > 0) {
      throw new ForbiddenException(
        'Permissions exceed ceiling for role: ' + invalid.join(', '),
      );
    }
    return { roleKey, permissions: body.permissions };
  }
}
