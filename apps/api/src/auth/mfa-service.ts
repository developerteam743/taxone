import { randomBytes, randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@taxone/database';
import { hashPassword, verifyPassword } from './password.js';
import { buildTotpUri, generateTotpSecret, verifyTotpCode } from './mfa-totp.js';
import { createOpaqueToken, expiresAtFromSeconds, hashToken, ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from './session-token.js';
import { decryptMfaSecret, encryptMfaSecret } from './mfa-crypto.js';
import type { LoginMetadata, LoginResult } from './auth.service.js';

export const MFA_CHALLENGE_TTL_SECONDS = 5 * 60;
export const MFA_RECOVERY_CODE_COUNT = 10;

export type MfaEnrollment = {
  secret: string;
  otpauthUri: string;
  recoveryCodes: string[];
};

export type MfaChallengeResult = {
  mfaRequired: true;
  challengeToken: string;
  user: { id: string; email: string; name: string };
  organizationId: string | null;
  expiresIn: number;
};

@Injectable()
export class MfaService {
  private readonly prisma = new PrismaClient();

  async beginEnrollment(userId: string): Promise<MfaEnrollment> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const existing = await this.prisma.mfaCredential.findUnique({ where: { userId: user.id } });
    if (existing?.enabledAt && !existing.disabledAt) {
      throw new UnauthorizedException('MFA is already enabled');
    }

    const secret = generateTotpSecret();
    const recoveryCodes = Array.from({ length: MFA_RECOVERY_CODE_COUNT }, () => generateRecoveryCode());
    await this.prisma.mfaCredential.upsert({
      where: { userId: user.id },
      create: { userId: user.id, encryptedSecret: encryptMfaSecret(secret) },
      update: { encryptedSecret: encryptMfaSecret(secret), enabledAt: null, disabledAt: null, recoveryCodes: { deleteMany: {} } },
    });

    const credential = await this.prisma.mfaCredential.findUniqueOrThrow({ where: { userId: user.id } });
    await this.prisma.mfaRecoveryCode.createMany({
      data: await Promise.all(recoveryCodes.map(async (code) => ({ credentialId: credential.id, codeHash: await hashPassword(code) }))),
    });

    return { secret, otpauthUri: buildTotpUri(secret, user.email, 'TaxOne'), recoveryCodes };
  }

  async confirmEnrollment(userId: string, code: string, metadata: LoginMetadata): Promise<void> {
    const credential = await this.prisma.mfaCredential.findUnique({ where: { userId } });
    if (!credential || credential.disabledAt || credential.enabledAt) throw new UnauthorizedException('MFA enrollment is not pending');
    let secret: string;
    try { secret = decryptMfaSecret(credential.encryptedSecret); } catch { throw new UnauthorizedException('MFA enrollment is unavailable'); }
    if (!verifyTotpCode(secret, code)) throw new UnauthorizedException('Invalid MFA code');

    const enabledAt = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.mfaCredential.update({ where: { id: credential.id }, data: { enabledAt, disabledAt: null } });
      const membership = await tx.membership.findFirst({ where: { userId }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
      if (membership) {
        await tx.auditLog.create({
          data: { organizationId: membership.organizationId, actorUserId: userId, action: 'AUTH_MFA_ENABLED', entityType: 'MfaCredential', entityId: credential.id, requestId: metadata.requestId },
        });
      }
    });
  }

  async createChallenge(userId: string): Promise<string> {
    const token = createOpaqueToken();
    await this.prisma.mfaChallenge.create({
      data: { userId, tokenHash: hashToken(token), expiresAt: expiresAtFromSeconds(MFA_CHALLENGE_TTL_SECONDS) },
    });
    return token;
  }

  async completeChallenge(challengeToken: string, code: string, metadata: LoginMetadata): Promise<LoginResult> {
    if (typeof challengeToken !== 'string' || challengeToken.length < 32 || !/^\d{6}$/.test(code)) {
      throw new UnauthorizedException('Invalid MFA challenge');
    }
    const challenge = await this.prisma.mfaChallenge.findUnique({ where: { tokenHash: hashToken(challengeToken) } });
    if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date()) throw new UnauthorizedException('Invalid MFA challenge');

    const credential = await this.prisma.mfaCredential.findUnique({ where: { userId: challenge.userId } });
    if (!credential?.enabledAt || credential.disabledAt) throw new UnauthorizedException('MFA is not enabled');
    let secret: string;
    try { secret = decryptMfaSecret(credential.encryptedSecret); } catch { throw new UnauthorizedException('MFA is unavailable'); }
    const totpValid = verifyTotpCode(secret, code);
    let recoveryId: string | undefined;
    if (!totpValid) {
      const candidates = await this.prisma.mfaRecoveryCode.findMany({ where: { credentialId: credential.id, consumedAt: null } });
      for (const candidate of candidates) {
        if (await verifyPassword(code, candidate.codeHash)) { recoveryId = candidate.id; break; }
      }
    }
    if (!totpValid && !recoveryId) throw new UnauthorizedException('Invalid MFA code');

    const now = new Date();
    const user = await this.prisma.user.findUnique({ where: { id: challenge.userId }, include: { memberships: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: 1 } } });
    if (!user) throw new UnauthorizedException('Invalid MFA challenge');
    const organizationId = user.memberships[0]?.organizationId ?? null;
    const accessToken = createOpaqueToken();
    const refreshToken = createOpaqueToken();
    const refreshFamilyId = randomUUID();

    await this.prisma.$transaction(async (tx) => {
      const consumed = await tx.mfaChallenge.updateMany({ where: { id: challenge.id, consumedAt: null, expiresAt: { gt: now } }, data: { consumedAt: now } });
      if (consumed.count !== 1) throw new UnauthorizedException('Invalid MFA challenge');
      if (recoveryId) {
        const used = await tx.mfaRecoveryCode.updateMany({ where: { id: recoveryId, consumedAt: null }, data: { consumedAt: now } });
        if (used.count !== 1) throw new UnauthorizedException('Invalid MFA code');
      }
      await tx.authSession.create({
        data: { userId: user.id, organizationId, accessTokenHash: hashToken(accessToken), refreshTokenHash: hashToken(refreshToken), refreshFamilyId, accessExpiresAt: expiresAtFromSeconds(ACCESS_TOKEN_TTL_SECONDS, now), refreshExpiresAt: expiresAtFromSeconds(REFRESH_TOKEN_TTL_SECONDS, now), ...(metadata.userAgent !== undefined ? { userAgent: metadata.userAgent } : {}), ...(metadata.ipHash !== undefined ? { ipHash: metadata.ipHash } : {}) },
      });
      if (organizationId) {
        await tx.auditLog.create({ data: { organizationId, actorUserId: user.id, action: recoveryId ? 'AUTH_MFA_RECOVERY_USED' : 'AUTH_MFA_CHALLENGE_SUCCESS', entityType: 'MfaChallenge', entityId: challenge.id, requestId: metadata.requestId, metadata: { sessionFamilyId: refreshFamilyId } } });
      }
    });

    return { user: { id: user.id, email: user.email, name: user.name }, organizationId, expiresIn: ACCESS_TOKEN_TTL_SECONDS, accessToken, refreshToken };
  }

  async onModuleDestroy(): Promise<void> { await this.prisma.$disconnect(); }
}

function generateRecoveryCode(): string {
  return randomBytes(9).toString('base64url').toUpperCase().slice(0, 12);
}
