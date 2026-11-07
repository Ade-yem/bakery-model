import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { ActorContext } from '../actor-context.js';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator.js';
import type { PermissionKey } from '../../access-control/permissions.js';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<
      PermissionKey | undefined
    >(REQUIRE_PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermission) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { actorContext?: ActorContext }>();
    const actorContext = request.actorContext;

    if (!actorContext || !actorContext.permissions.has(requiredPermission)) {
      throw new ForbiddenException({
        code: 'SCOPE_FORBIDDEN',
        message: `Missing required permission: ${requiredPermission}`,
      });
    }

    return true;
  }
}
