import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiCookieAuth,
} from '@nestjs/swagger';
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

/**
 * Controller exposing identity and active operational context discovery.
 */
@ApiTags('Identity')
@ApiCookieAuth('better-auth.session_token')
@Controller('me')
@UseGuards(SessionGuard)
export class MeController {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  /**
   * Resolves the authenticated caller's profile, tenant memberships, and active context.
   *
   * @param req - Request object containing authenticated user credentials.
   * @returns Object containing user profile, array of memberships, and primary activeContext.
   */
  @Get()
  @ApiOperation({
    summary: 'Discover authenticated identity and scopes',
    description:
      'Resolves the authenticated user, active tenant memberships, roles, and effective permissions without leaking sensitive secrets.',
  })
  @ApiOkResponse({
    description: 'Identity and scopes summary successfully resolved.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  async getMe(
    @Req() req: Request & { user: { id: string; email: string; name: string } },
  ) {
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
      permissions = basePerms.filter(
        (p) => VALID_PERMISSIONS.has(p) && ceiling.has(p),
      );
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
