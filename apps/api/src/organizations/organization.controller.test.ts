import assert from 'node:assert/strict';
import test from 'node:test';
import { OrganizationController } from './organization.controller.js';

test('organization lookup uses the authenticated user context', async () => {
  const calls: Array<{ organizationId: string; userId: string }> = [];
  const service = { getByIdForUser: async (organizationId: string, userId: string) => { calls.push({ organizationId, userId }); return { id: organizationId, name: 'TaxOne Firm' }; } };
  const controller = new OrganizationController(service as never);
  const request = { user: { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' } };
  const result = await controller.getOrganization('org-1', request as never);
  assert.deepEqual(calls, [{ organizationId: 'org-1', userId: 'user-1' }]);
  assert.deepEqual(result, { id: 'org-1', name: 'TaxOne Firm' });
});

test('member listing uses the authenticated user context', async () => {
  const calls: Array<{ organizationId: string; userId: string }> = [];
  const members = [{ id: 'membership-1', userId: 'user-1', role: 'MEMBER' }];
  const service = { listMembersForUser: async (organizationId: string, userId: string) => { calls.push({ organizationId, userId }); return members; } };
  const controller = new OrganizationController(service as never);
  const request = { user: { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' } };
  const result = await controller.listMembers('org-1', request as never);
  assert.deepEqual(calls, [{ organizationId: 'org-1', userId: 'user-1' }]);
  assert.deepEqual(result, members);
});
