import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';
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

test('organization creation uses authenticated user context and request id', async () => {
  const calls: Array<{ name: string; userId: string; requestId: string }> = [];
  const service = { createForUser: async (input: { name: string }, userId: string, requestId: string) => { calls.push({ name: input.name, userId, requestId }); return { id: 'org-2', name: input.name }; } };
  const controller = new OrganizationController(service as never);
  const request = { user: { userId: 'user-2', organizationId: 'org-1', sessionId: 'session-2' } };
  const result = await controller.createOrganization({ name: '  New Firm  ' }, request as never, 'req-2');
  assert.deepEqual(calls, [{ name: 'New Firm', userId: 'user-2', requestId: 'req-2' }]);
  assert.deepEqual(result, { id: 'org-2', name: 'New Firm' });
});

test('organization creation rejects malformed input before calling the service', async () => {
  let called = false;
  const service = { createForUser: async () => { called = true; } };
  const controller = new OrganizationController(service as never);
  const request = { user: { userId: 'user-2', organizationId: null, sessionId: 'session-2' } };
  await assert.rejects(() => controller.createOrganization({ name: ' ' }, request as never, 'req-2'), BadRequestException);
  assert.equal(called, false);
});
