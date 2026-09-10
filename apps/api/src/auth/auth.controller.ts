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
const COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: 'strict' as const };

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

    const result = await this.authService.login(validation.data, this.metadata(response, requestId, userAgent));
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return {
      user: result.user,
      organizationId: result.organizationId,
      expiresIn: result.expiresIn,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Headers('x-request-id') requestId: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.readRefreshCookie(response);
    if (!refreshToken) {
      throw new BadRequestException('Refresh token cookie is required');
    }

    const result = await this.authService.refresh(refreshToken, this.metadata(response, requestId, userAgent));
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return {
      user: result.user,
      organizationId: result.organizationId,
      expiresIn: result.expiresIn,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Headers('x-request-id') requestId: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = this.readRefreshCookie(response);
    await this.authService.logout(refreshToken, this.metadata(response, requestId, userAgent));
    this.clearAuthCookies(response);
  }

  private metadata(response: Response, requestId: string | undefined, userAgent: string | undefined) {
    const forwardedFor = response.req.headers['x-forwarded-for'];
    const remoteAddress = response.req.socket.remoteAddress;
    const clientAddress = typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]?.trim()
      : remoteAddress;
    const ipHash = clientAddress
      ? createHash('sha256').update(clientAddress, 'utf8').digest('hex')
      : undefined;

    return {
      requestId: requestId ?? 'unknown',
      ...(userAgent ? { userAgent } : {}),
      ...(ipHash ? { ipHash } : {}),
    };
  }

  private readRefreshCookie(response: Response): string | undefined {
    const cookieHeader = response.req.headers.cookie;
    if (typeof cookieHeader !== 'string') return undefined;
    for (const part of cookieHeader.split(';')) {
      const separator = part.indexOf('=');
      if (separator < 0) continue;
      const name = part.slice(0, separator).trim();
      if (name !== REFRESH_TOKEN_COOKIE) continue;
      const value = part.slice(separator + 1).trim();
      if (!value) return undefined;
      try {
        return decodeURIComponent(value);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  private setAuthCookies(response: Response, accessToken: string, refreshToken: string): void {
    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_COOKIE_MAX_AGE,
      path: '/',
    });
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: '/api/v1/auth',
    });
  }

  private clearAuthCookies(response: Response): void {
    response.clearCookie(ACCESS_TOKEN_COOKIE, {
      ...COOKIE_OPTIONS,
      path: '/',
    });
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...COOKIE_OPTIONS,
      path: '/api/v1/auth',
    });
  }
}
