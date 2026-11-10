import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { ActorContext } from '../actor-context.js';

export const CurrentActor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ActorContext => {
    const request = ctx.switchToHttp().getRequest<Request & { actorContext?: ActorContext }>();
    return request.actorContext as ActorContext;
  },
);
