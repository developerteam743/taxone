import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthService } from './auth.service.js';
import { hashToken } from './session-token.js';

const metadata = { requestId: 'req-test', userAgent: 'test-agent', ipHash: 'test-ip-hash' };

function session(overrides: Record<string, unknown> = {}) {
  return {
    id: 'session-1',
    userId: 'user-1',
    organizationId: 'org-1',
    accessTokenHash: 'old-access-hash',
    refreshTokenHash: hashToken('a'.repeat(64)),
    refreshFamilyId: 'family-1',
    accessExpiresAt: new Date(Date.now() + 60_000),
    refreshExpiresAt: new Date(Date.now() + 86_400_000),
    lastUsedAt: null,
    rotatedAt: null,
    revokedAt: null,
    userAgent: 'old-agent',
    ipHash: 'old-ip',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeService(config: {
  currentSession: Record<string, unknown> | null;
  consumeCount?: number;
  userExists?: boolean;
}) {
  const created: Array<Record<string, unknown>> = [];
  const audits: Array<Record<string, unknown>> = [];
  const familyRevocations: Array<Record<string, unknown>> = [];
  const service = Object.create(AuthService.prototype) as AuthService;
  const authSession = {
    findUnique: async () => config.currentSession,
    updateMany: async (args: Record<string, unknown>) => {
      const where = args.where as Record<string, unknown>;
      if (where.refreshFamilyId) {
        familyRevocations.push(args);
        return { count: 1 };
      }
      return { count: config.consumeCount ?? 1 };
    },
    create: async (args: Record<string, unknown>) => {
      created.push(args.data as Record<string, unknown>);
      return args.data;
    },
  };
  const auditLog = {
    create: async (args: Record<string, unknown>) => {
      audits.push(args.data as Record<string, unknown>);
      return args.data;
    },
  };
  const prisma = {
    authSession,
    auditLog,
    user: {
      findUnique: async () => config.userExists
        ? { id: 'user-1', email: 'user@example.com', name: 'Test User' }
        : null,
    },
    $transaction: async (callback: (tx: typeof authSession & { auditLog: typeof auditLog }) => Promise<unknown>) =>
      callback({ ...authSession, auditLog }),
  };
  (service as unknown as { prisma: typeof prisma }).prisma = prisma;
  return { service, created, audits, familyRevocations };
}

test('refresh rotates a valid token and preserves its refresh family and expiry', async () => {
  const refreshToken = 'a'.repeat(64);
  const existing = session({ refreshTokenHash: hashToken(refreshToken) });
  const { service, created, audits } = makeService({ currentSession: existing, userExists: true });

  const result = await service.refresh(refreshToken, metadata);

  assert.equal(result.user.id, 'user-1');
  assert.equal(result.organizationId, 'org-1');
  assert.equal(result.accessToken.length >= 43, true);
  assert.equal(result.refreshToken.length >= 43, true);
  assert.notEqual(result.refreshToken, refreshToken);
  assert.equal(created.length, 1);
  assert.equal(created[0]?.refreshFamilyId, 'family-1');
  assert.deepEqual(created[0]?.refreshExpiresAt, existing.refreshExpiresAt);
  assert.equal(created[0]?.userAgent, metadata.userAgent);
  assert.equal(created[0]?.ipHash, metadata.ipHash);
  assert.equal(audits[0]?.action, 'AUTH_REFRESH_ROTATED');
});

test('refresh rejects an already rotated token and revokes its family', async () => {
  const refreshToken = 'b'.repeat(64);
  const existing = session({ refreshTokenHash: hashToken(refreshToken), rotatedAt: new Date() });
  const { service, familyRevocations, audits } = makeService({ currentSession: existing });

  await assert.rejects(() => service.refresh(refreshToken, metadata), /Invalid refresh token/);

  assert.equal(familyRevocations.length, 1);
  assert.deepEqual(familyRevocations[0]?.where, { refreshFamilyId: 'family-1', revokedAt: null });
  assert.equal(audits[0]?.action, 'AUTH_REFRESH_REUSE_DETECTED');
});

test('refresh rejects an expired token without creating a replacement', async () => {
  const refreshToken = 'c'.repeat(64);
  const existing = session({
    refreshTokenHash: hashToken(refreshToken),
    refreshExpiresAt: new Date(Date.now() - 1_000),
  });
  const { service, created, audits } = makeService({ currentSession: existing });

  await assert.rejects(() => service.refresh(refreshToken, metadata), /Invalid refresh token/);

  assert.equal(created.length, 0);
  assert.equal(audits.length, 0);
});

test('refresh rejects a revoked token and revokes the entire family', async () => {
  const refreshToken = 'd'.repeat(64);
  const existing = session({ refreshTokenHash: hashToken(refreshToken), revokedAt: new Date() });
  const { service, familyRevocations, audits } = makeService({ currentSession: existing });

  await assert.rejects(() => service.refresh(refreshToken, metadata), /Invalid refresh token/);

  assert.equal(familyRevocations.length, 1);
  assert.equal(audits[0]?.action, 'AUTH_REFRESH_REUSE_DETECTED');
});

test('refresh fails closed when the token is unknown', async () => {
  const { service, created, audits } = makeService({ currentSession: null });

  await assert.rejects(() => service.refresh('e'.repeat(64), metadata), /Invalid refresh token/);

  assert.equal(created.length, 0);
  assert.equal(audits.length, 0);
});
