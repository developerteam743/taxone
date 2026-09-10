import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './access-token.guard.js';
import { AuthService } from './auth.service.js';
import { ROLES_KEY } from './roles.decorator.js';

const ROLE_RANK: Record<string, number> = {
  CLIENT: 10,
  MEMBER: 20,
  CA: 30,
  ADMIN: 40,
  OWNER: 50,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authenticated = request.user;
    if (!authenticated?.userId || !authenticated.organizationId) throw new ForbiddenException('Organization membership is required');

    const role = await this.authService.getOrganizationRole(authenticated.userId, authenticated.organizationId);
    if (!role) throw new ForbiddenException('Organization membership is required');

    const roleRank = ROLE_RANK[role];
    if (roleRank === undefined) throw new ForbiddenException('Access denied');
    const allowed = requiredRoles.some((requiredRole) => {
      const requiredRank = ROLE_RANK[requiredRole];
      return requiredRank !== undefined && roleRank >= requiredRank;
    });
    if (!allowed) throw new ForbiddenException('Access denied');
    return true;
  }
}
