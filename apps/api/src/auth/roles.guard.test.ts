import assert from 'node:assert/strict';
import test from 'node:test';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard.js';

function executionContext(user: Record<string, unknown> | undefined) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as never;
}

test('allows requests when no roles are required', async () => {
  const guard = new RolesGuard({ getAllAndOverride: () => undefined } as never, { getOrganizationRole: async () => 'MEMBER' } as never);
  assert.equal(await guard.canActivate(executionContext(undefined)), true);
});

test('allows a role that meets the required minimum role', async () => {
  const guard = new RolesGuard({ getAllAndOverride: () => ['CA'] } as never, { getOrganizationRole: async (userId: string, organizationId: string) => { assert.equal(userId, 'user-1'); assert.equal(organizationId, 'org-1'); return 'ADMIN'; } } as never);
  assert.equal(await guard.canActivate(executionContext({ userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' })), true);
});

test('denies a role below the required minimum', async () => {
  const guard = new RolesGuard({ getAllAndOverride: () => ['ADMIN'] } as never, { getOrganizationRole: async () => 'CA' } as never);
  await assert.rejects(() => guard.canActivate(executionContext({ userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' })), ForbiddenException);
});

test('denies requests without an organization membership context', async () => {
  const guard = new RolesGuard({ getAllAndOverride: () => ['MEMBER'] } as never, { getOrganizationRole: async () => 'MEMBER' } as never);
  await assert.rejects(() => guard.canActivate(executionContext({ userId: 'user-1', organizationId: null, sessionId: 'session-1' })), ForbiddenException);
});

test('denies users who are not a member of the session organization', async () => {
  const guard = new RolesGuard({ getAllAndOverride: () => ['MEMBER'] } as never, { getOrganizationRole: async () => null } as never);
  await assert.rejects(() => guard.canActivate(executionContext({ userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' })), ForbiddenException);
});
