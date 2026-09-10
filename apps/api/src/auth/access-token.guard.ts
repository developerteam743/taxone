import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from './auth-contract.js';
import { AuthService, type AuthenticatedUser } from './auth.service.js';

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = readAccessToken(request);
    request.user = await this.authService.authenticateAccessToken(token);
    return true;
  }
}

function readAccessToken(request: Request): string | undefined {
  const authorization = request.headers.authorization;
  if (typeof authorization === 'string') {
    if (!/^Bearer\s+/i.test(authorization)) throw new UnauthorizedException('Authentication required');
    const token = authorization.slice(7).trim();
    if (!token) throw new UnauthorizedException('Authentication required');
    return token;
  }

  const cookieHeader = request.headers.cookie;
  if (typeof cookieHeader !== 'string') throw new UnauthorizedException('Authentication required');
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== ACCESS_TOKEN_COOKIE) continue;
    const value = part.slice(separator + 1).trim();
    if (!value) break;
    try { return decodeURIComponent(value); } catch { break; }
  }
  throw new UnauthorizedException('Authentication required');
}
