import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantsService } from './tenants.service.js';

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

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(SessionGuard)
  async createTenant(
    @Req() req: AuthenticatedRequest,
    @Body() body: { name: string; branchName?: string; departmentName?: string },
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
