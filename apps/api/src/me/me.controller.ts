import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import { eq } from 'drizzle-orm';
import type { Request } from 'express';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { SessionGuard } from '../auth/guards/session.guard.js';
import {
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_CEILINGS,
  VALID_PERMISSIONS,
} from '../access-control/permissions.js';

@ApiTags('me')
@Controller('me')
@UseGuards(SessionGuard)
export class MeController {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Discover authenticated identity and scopes',
    description:
      'Resolves the authenticated user, active tenant memberships, roles, and effective permissions.',
  })
  @ApiResponse({ status: 200, description: 'Identity and scopes summary.' })
  async getMe(@Req() req: Request & { user: { id: string; email: string; name: string } }) {
    const userId = req.user.id;

    // Fetch memberships for this user
    const memberships = await this.db
      .select()
      .from(schema.tenantMemberships)
      .where(eq(schema.tenantMemberships.authUserId, userId));

    const activeMemberships = memberships.filter((m) => m.status === 'ACTIVE');
    const primaryMembership = activeMemberships[0];

    let permissions: string[] = [];
    if (primaryMembership) {
      const ceiling = ROLE_CEILINGS[primaryMembership.roleKey] || new Set();
      const basePerms =
        DEFAULT_ROLE_PERMISSIONS[primaryMembership.roleKey] || [];
      permissions = basePerms.filter((p) => VALID_PERMISSIONS.has(p) && ceiling.has(p));
    }

    return {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
      },
      memberships: memberships.map((m) => ({
        id: m.id,
        tenantId: m.tenantId,
        role: m.roleKey,
        status: m.status,
      })),
      activeContext: primaryMembership
        ? {
            tenantId: primaryMembership.tenantId,
            membershipId: primaryMembership.id,
            role: primaryMembership.roleKey,
            permissions,
          }
        : null,
    };
  }
}
