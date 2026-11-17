import { All, Controller, Req, Res } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

@Controller('api/auth')
export class AuthController {
  private nodeHandler: (req: Request, res: Response) => Promise<unknown>;

  constructor(private readonly authService: AuthService) {
    this.nodeHandler = toNodeHandler(this.authService.auth);
  }

  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    return this.nodeHandler(req, res);
  }
}
