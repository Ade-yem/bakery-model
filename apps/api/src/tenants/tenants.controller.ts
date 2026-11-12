import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantsService } from './tenants.service.js';
import { OnboardTenantDto } from './dto/onboard-tenant.dto.js';

interface AuthenticatedRequest extends Request {
  session?: {
    userId: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Controller managing tenant onboarding and business registration.
 */
@ApiTags('Tenants')
@ApiCookieAuth('better-auth.session_token')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * Onboards a new bakery business / tenant organization.
   *
   * Provisions default baseline departments (Reception, Production, Dispatch, Store),
   * seeds default roles (OWNER, MANAGER, RECEPTIONIST, PRODUCTION_SUPERVISOR, DISPATCH_OFFICER),
   * creates the primary branch, and assigns the authenticated caller as the organization OWNER.
   *
   * @param req - Authenticated request context containing session and user identity.
   * @param body - Onboarding parameters including tenant and branch titles.
   * @returns Newly created tenant, primary branch, seeded departments, and owner membership.
   */
  @Post()
  @UseGuards(SessionGuard)
  @ApiOperation({
    summary: 'Onboard a new tenant business',
    description:
      'Creates a new tenant with default STANDARD tier, provisions primary branch, seeds baseline departments and roles, and assigns the caller as OWNER.',
  })
  @ApiCreatedResponse({
    description:
      'Tenant successfully onboarded with baseline departments and owner membership.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required. Caller must be signed in.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input parameters or validation failed.',
  })
  async createTenant(
    @Req() req: AuthenticatedRequest,
    @Body() body: OnboardTenantDto,
  ) {
    const session = req.session!;
    const user = req.user!;
    return this.tenantsService.onboardTenant({
      tenantName: body.name,
      branchName: body.branchName,
      departmentName: body.departmentName,
      actorAuthUserId: session.userId,
      userEmail: user.email,
      userName: user.name,
    });
  }
}
