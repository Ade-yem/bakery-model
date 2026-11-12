import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { AuthService } from '../auth.service.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { session?: unknown; user?: unknown }>();

    const sessionData = await this.authService.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!sessionData || !sessionData.session || !sessionData.user) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication is required to access this resource',
      });
    }

    request.session = sessionData.session;
    request.user = sessionData.user;
    return true;
  }
}
