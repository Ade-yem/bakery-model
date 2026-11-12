import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import crypto from 'node:crypto';
import { ERROR_CODES } from '@repo/shared';

/**
 * @description Guard validating incoming Flutterwave webhook authenticity via the 'verif-hash' header.
 * Uses timing-safe constant-time string comparison to prevent side-channel timing attacks.
 */
@Injectable()
export class FlutterwaveSignatureGuard implements CanActivate {
  /**
   * @description Validates the verif-hash header against the configured FLW_WEBHOOK_HASH environment variable.
   * @param context NestJS execution context.
   * @returns true if the hash matches.
   * @throws {HttpException} 401 if secret or header is missing; 403 if signature does not match.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const incomingHash =
      request.headers['verif-hash'] || request.headers['Verif-Hash'];
    const secretHash = process.env.FLW_WEBHOOK_HASH;

    if (!incomingHash || !secretHash) {
      throw new HttpException(
        {
          code: ERROR_CODES.AUTH_REQUIRED,
          message: 'Unauthorized: Missing webhook verification signature',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const incomingBuffer = Buffer.from(String(incomingHash), 'utf8');
    const secretBuffer = Buffer.from(String(secretHash), 'utf8');

    if (
      incomingBuffer.length !== secretBuffer.length ||
      !crypto.timingSafeEqual(incomingBuffer, secretBuffer)
    ) {
      throw new HttpException(
        {
          code: ERROR_CODES.INVALID_WEBHOOK_SIGNATURE,
          message: 'Forbidden: Invalid webhook verification signature',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
