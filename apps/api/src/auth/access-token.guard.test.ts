import assert from 'node:assert/strict';
import test from 'node:test';
import { UnauthorizedException } from '@nestjs/common';
import { AccessTokenGuard, type AuthenticatedRequest } from './access-token.guard.js';

function contextFor(request: Partial<AuthenticatedRequest>) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as never;
}

test('authenticates a bearer access token and attaches user context', async () => {
  const expected = { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' } as const;
  const service = { authenticateAccessToken: async (token: string | undefined) => { assert.equal(token, 'a'.repeat(32)); return expected; } };
  const request = { headers: { authorization: `Bearer ${'a'.repeat(32)}` } } as Partial<AuthenticatedRequest>;
  const guard = new AccessTokenGuard(service as never);

  assert.equal(await guard.canActivate(contextFor(request)), true);
  assert.deepEqual(request.user, expected);
});

test('accepts the HttpOnly access-token cookie when no bearer token is supplied', async () => {
  const service = { authenticateAccessToken: async (token: string | undefined) => { assert.equal(token, 'b'.repeat(32)); return { userId: 'user-2', organizationId: null, sessionId: 'session-2' }; } };
  const request = { headers: { cookie: `other=x; taxone_access=${'b'.repeat(32)}` } } as Partial<AuthenticatedRequest>;
  const guard = new AccessTokenGuard(service as never);

  assert.equal(await guard.canActivate(contextFor(request)), true);
  assert.equal(request.user?.userId, 'user-2');
});

test('rejects requests without an access token', async () => {
  const service = { authenticateAccessToken: async () => { throw new Error('must not be called'); } };
  const request = { headers: {} } as Partial<AuthenticatedRequest>;
  const guard = new AccessTokenGuard(service as never);

  await assert.rejects(() => guard.canActivate(contextFor(request)), UnauthorizedException);
});

test('rejects malformed bearer authorization and does not fall back to a cookie', async () => {
  const service = { authenticateAccessToken: async () => { throw new Error('must not be called'); } };
  const request = { headers: { authorization: 'Basic abc', cookie: `taxone_access=${'c'.repeat(32)}` } } as Partial<AuthenticatedRequest>;
  const guard = new AccessTokenGuard(service as never);

  await assert.rejects(() => guard.canActivate(contextFor(request)), UnauthorizedException);
});
