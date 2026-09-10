import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { createHash } from 'node:crypto';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  validateLoginRequest,
} from './auth-contract.js';
import { AuthService } from './auth.service.js';

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: unknown,
    @Headers('x-request-id') requestId: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const validation = validateLoginRequest(body);
    if (!validation.success) {
      throw new BadRequestException({
        message: 'Request validation failed.',
        issues: validation.errors,
      });
    }

    const forwardedFor = response.req.headers['x-forwarded-for'];
    const remoteAddress = response.req.socket.remoteAddress;
    const clientAddress = typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]?.trim()
      : remoteAddress;
    const ipHash = clientAddress
      ? createHash('sha256').update(clientAddress, 'utf8').digest('hex')
      : undefined;

    const result = await this.authService.login(validation.data, {
      requestId: requestId ?? 'unknown',
      ...(userAgent ? { userAgent } : {}),
      ...(ipHash ? { ipHash } : {}),
    });

    response.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: ACCESS_COOKIE_MAX_AGE,
      path: '/',
    });
    response.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: '/api/v1/auth',
    });

    return {
      user: result.user,
      organizationId: result.organizationId,
      expiresIn: result.expiresIn,
    };
  }
}
