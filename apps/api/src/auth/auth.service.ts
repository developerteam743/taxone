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
import type { LoginRequest, LoginResponse } from './auth-contract.js';

export type LoginMetadata = {
  requestId: string;
  userAgent?: string;
  ipHash?: string;
};

export type LoginResult = LoginResponse & {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private readonly prisma = new PrismaClient();
  private dummyPasswordHashPromise?: Promise<string>;

  async login(credentials: LoginRequest, metadata: LoginMetadata): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email },
      include: {
        memberships: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          take: 1,
        },
      },
    });

    const passwordHash = user?.passwordHash ?? await this.getDummyPasswordHash();
    const passwordValid = await verifyPassword(credentials.password, passwordHash);

    if (!user || !passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const membership = user.memberships[0];
    const organizationId = membership?.organizationId ?? null;
    const accessToken = createOpaqueToken();
    const refreshToken = createOpaqueToken();
    const refreshFamilyId = randomUUID();
    const now = new Date();
    const accessExpiresAt = expiresAtFromSeconds(ACCESS_TOKEN_TTL_SECONDS, now);
    const refreshExpiresAt = expiresAtFromSeconds(REFRESH_TOKEN_TTL_SECONDS, now);

    await this.prisma.$transaction(async (tx) => {
      await tx.authSession.create({
        data: {
          userId: user.id,
          organizationId,
          accessTokenHash: hashToken(accessToken),
          refreshTokenHash: hashToken(refreshToken),
          refreshFamilyId,
          accessExpiresAt,
          refreshExpiresAt,
          ...(metadata.userAgent !== undefined ? { userAgent: metadata.userAgent } : {}),
          ...(metadata.ipHash !== undefined ? { ipHash: metadata.ipHash } : {}),
        },
      });

      if (organizationId) {
        await tx.auditLog.create({
          data: {
            organizationId,
            actorUserId: user.id,
            action: 'AUTH_LOGIN',
            entityType: 'AuthSession',
            requestId: metadata.requestId,
            metadata: { sessionFamilyId: refreshFamilyId },
          },
        });
      }
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      organizationId,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      accessToken,
      refreshToken,
    };
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }

  private async getDummyPasswordHash(): Promise<string> {
    this.dummyPasswordHashPromise ??= import('./password.js').then(({ hashPassword }) =>
      hashPassword('TaxOne dummy password value 2026'),
    );
    return this.dummyPasswordHashPromise;
  }
}
