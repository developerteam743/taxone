import { randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@taxone/database';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  createOpaqueToken,
  expiresAtFromSeconds,
  hashToken,
} from './session-token.js';
import { verifyPassword } from './password.js';
import type { LoginRequest, LoginResponse, MfaLoginResponse } from './auth-contract.js';
import { MfaService } from './mfa-service.js';

export type LoginMetadata = { requestId: string; userAgent?: string; ipHash?: string };
export type LoginResult = LoginResponse & { accessToken: string; refreshToken: string };
export type AuthLoginResult = LoginResult | MfaLoginResponse;
export type AuthenticatedUser = { userId: string; organizationId: string | null; sessionId: string };

@Injectable()
export class AuthService {
  private readonly prisma = new PrismaClient();
  private dummyPasswordHashPromise?: Promise<string>;

  constructor(private readonly mfaService: MfaService) {}

  async login(credentials: LoginRequest, metadata: LoginMetadata): Promise<AuthLoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email },
      include: {
        memberships: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: 1 },
        mfaCredential: { select: { enabledAt: true, disabledAt: true } },
      },
    });
    const passwordHash = user?.passwordHash ?? await this.getDummyPasswordHash();
    const passwordValid = await verifyPassword(credentials.password, passwordHash);
    if (!user || !passwordValid) throw new UnauthorizedException('Invalid email or password');

    const membership = user.memberships[0];
    const organizationId = membership?.organizationId ?? null;
    if (user.mfaCredential?.enabledAt && !user.mfaCredential.disabledAt) {
      const challengeToken = await this.mfaService.createChallenge(user.id);
      return { mfaRequired: true, challengeToken, user: { id: user.id, email: user.email, name: user.name }, organizationId, expiresIn: 5 * 60 };
    }
    return this.createSession(user.id, user.email, user.name, organizationId, metadata, 'AUTH_LOGIN');
  }

  async authenticateAccessToken(accessToken: string | undefined): Promise<AuthenticatedUser> {
    if (typeof accessToken !== 'string' || accessToken.length < 32 || accessToken.length > 256) throw new UnauthorizedException('Authentication required');
    const now = new Date();
    const session = await this.prisma.authSession.findUnique({ where: { accessTokenHash: hashToken(accessToken) }, select: { id: true, userId: true, organizationId: true, accessExpiresAt: true, revokedAt: true } });
    if (!session || session.revokedAt || session.accessExpiresAt <= now) throw new UnauthorizedException('Authentication required');
    const user = await this.prisma.user.findUnique({ where: { id: session.userId }, select: { id: true } });
    if (!user) throw new UnauthorizedException('Authentication required');
    return { userId: user.id, organizationId: session.organizationId, sessionId: session.id };
  }

  async getOrganizationRole(userId: string, organizationId: string): Promise<string | null> {
    const membership = await this.prisma.membership.findUnique({ where: { organizationId_userId: { organizationId, userId } }, select: { role: true } });
    return membership?.role ?? null;
  }

  async refresh(refreshToken: string, metadata: LoginMetadata): Promise<LoginResult> {
    if (typeof refreshToken !== 'string' || refreshToken.length < 32) throw new UnauthorizedException('Invalid refresh token');
    const tokenHash = hashToken(refreshToken);
    const session = await this.prisma.authSession.findUnique({ where: { refreshTokenHash: tokenHash } });
    if (!session) throw new UnauthorizedException('Invalid refresh token');
    const now = new Date();
    if (session.revokedAt || session.rotatedAt || session.refreshExpiresAt <= now) {
      if (session.revokedAt || session.rotatedAt) await this.revokeRefreshFamily(session.refreshFamilyId, session.organizationId, session.userId, metadata, 'AUTH_REFRESH_REUSE_DETECTED');
      else await this.prisma.authSession.updateMany({ where: { id: session.id, revokedAt: null }, data: { revokedAt: now } });
      throw new UnauthorizedException('Invalid refresh token');
    }
    const nextAccessToken = createOpaqueToken();
    const nextRefreshToken = createOpaqueToken();
    const nextAccessExpiresAt = expiresAtFromSeconds(ACCESS_TOKEN_TTL_SECONDS, now);
    const rotated = await this.prisma.$transaction(async (tx) => {
      const consumed = await tx.authSession.updateMany({ where: { id: session.id, revokedAt: null, rotatedAt: null, refreshExpiresAt: { gt: now } }, data: { rotatedAt: now, revokedAt: now, lastUsedAt: now } });
      if (consumed.count !== 1) {
        await tx.authSession.updateMany({ where: { refreshFamilyId: session.refreshFamilyId, revokedAt: null }, data: { revokedAt: now } });
        if (session.organizationId) await tx.auditLog.create({ data: { organizationId: session.organizationId, actorUserId: session.userId, action: 'AUTH_REFRESH_REUSE_DETECTED', entityType: 'AuthSession', entityId: session.id, requestId: metadata.requestId, metadata: { sessionFamilyId: session.refreshFamilyId } } });
        return false;
      }
      await tx.authSession.create({ data: { userId: session.userId, organizationId: session.organizationId, accessTokenHash: hashToken(nextAccessToken), refreshTokenHash: hashToken(nextRefreshToken), refreshFamilyId: session.refreshFamilyId, accessExpiresAt: nextAccessExpiresAt, refreshExpiresAt: session.refreshExpiresAt, ...(metadata.userAgent !== undefined ? { userAgent: metadata.userAgent } : {}), ...(metadata.ipHash !== undefined ? { ipHash: metadata.ipHash } : {}) } });
      if (session.organizationId) await tx.auditLog.create({ data: { organizationId: session.organizationId, actorUserId: session.userId, action: 'AUTH_REFRESH_ROTATED', entityType: 'AuthSession', entityId: session.id, requestId: metadata.requestId, metadata: { sessionFamilyId: session.refreshFamilyId } } });
      return true;
    });
    if (!rotated) throw new UnauthorizedException('Invalid refresh token');
    const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) throw new UnauthorizedException('Invalid refresh token');
    return { user: { id: user.id, email: user.email, name: user.name }, organizationId: session.organizationId, expiresIn: ACCESS_TOKEN_TTL_SECONDS, accessToken: nextAccessToken, refreshToken: nextRefreshToken };
  }

  async logout(refreshToken: string | undefined, metadata: LoginMetadata): Promise<void> {
    if (typeof refreshToken !== 'string' || refreshToken.length < 32) return;
    const session = await this.prisma.authSession.findUnique({ where: { refreshTokenHash: hashToken(refreshToken) } });
    if (!session) return;
    await this.revokeRefreshFamily(session.refreshFamilyId, session.organizationId, session.userId, metadata, 'AUTH_LOGOUT');
  }

  async onModuleDestroy(): Promise<void> { await this.prisma.$disconnect(); }

  private async createSession(userId: string, email: string, name: string, organizationId: string | null, metadata: LoginMetadata, action: 'AUTH_LOGIN'): Promise<LoginResult> {
    const accessToken = createOpaqueToken();
    const refreshToken = createOpaqueToken();
    const refreshFamilyId = randomUUID();
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.authSession.create({ data: { userId, organizationId, accessTokenHash: hashToken(accessToken), refreshTokenHash: hashToken(refreshToken), refreshFamilyId, accessExpiresAt: expiresAtFromSeconds(ACCESS_TOKEN_TTL_SECONDS, now), refreshExpiresAt: expiresAtFromSeconds(REFRESH_TOKEN_TTL_SECONDS, now), ...(metadata.userAgent !== undefined ? { userAgent: metadata.userAgent } : {}), ...(metadata.ipHash !== undefined ? { ipHash: metadata.ipHash } : {}) } });
      if (organizationId) await tx.auditLog.create({ data: { organizationId, actorUserId: userId, action, entityType: 'AuthSession', requestId: metadata.requestId, metadata: { sessionFamilyId: refreshFamilyId } } });
    });
    return { user: { id: userId, email, name }, organizationId, expiresIn: ACCESS_TOKEN_TTL_SECONDS, accessToken, refreshToken };
  }

  private async revokeRefreshFamily(refreshFamilyId: string, organizationId: string | null, userId: string, metadata: LoginMetadata, action: 'AUTH_REFRESH_REUSE_DETECTED' | 'AUTH_LOGOUT'): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.authSession.updateMany({ where: { refreshFamilyId, revokedAt: null }, data: { revokedAt: new Date() } });
      if (organizationId) await tx.auditLog.create({ data: { organizationId, actorUserId: userId, action, entityType: 'AuthSession', requestId: metadata.requestId, metadata: { sessionFamilyId: refreshFamilyId } } });
    });
  }

  private async getDummyPasswordHash(): Promise<string> {
    this.dummyPasswordHashPromise ??= import('./password.js').then(({ hashPassword }) => hashPassword('TaxOne dummy password value 2026'));
    return this.dummyPasswordHashPromise;
  }
}
