import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { OrganizationController } from './organization.controller.js';

test('organization list uses authenticated user context and pagination inputs', async () => {
  const calls: Array<{ userId: string; limit: number; cursor?: string }> = [];
  const service = { listForUser: async (userId: string, limit: number, cursor?: string) => { calls.push({ userId, limit, ...(cursor ? { cursor } : {}) }); return { items: [], nextCursor: null }; } };
  const controller = new OrganizationController(service as never); const request = { user: { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' } };
  assert.deepEqual(await controller.listOrganizations(request as never, '25', 'cursor-1'), { items: [], nextCursor: null }); assert.deepEqual(calls, [{ userId: 'user-1', limit: 25, cursor: 'cursor-1' }]);
});
test('organization list rejects invalid page size before calling the service', async () => {
  let called = false; const controller = new OrganizationController({ listForUser: async () => { called = true; } } as never); const request = { user: { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' } };
  await assert.rejects(() => controller.listOrganizations(request as never, '101', undefined), BadRequestException); assert.equal(called, false);
});
test('organization lookup uses the authenticated user context', async () => {
  const calls: Array<{ organizationId: string; userId: string }> = []; const service = { getByIdForUser: async (organizationId: string, userId: string) => { calls.push({ organizationId, userId }); return { id: organizationId, name: 'TaxOne Firm' }; } };
  const controller = new OrganizationController(service as never); const request = { user: { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' } }; assert.deepEqual(await controller.getOrganization('org-1', request as never), { id: 'org-1', name: 'TaxOne Firm' }); assert.deepEqual(calls, [{ organizationId: 'org-1', userId: 'user-1' }]);
});
test('member listing uses the authenticated user context', async () => {
  const calls: Array<{ organizationId: string; userId: string }> = []; const members = [{ id: 'membership-1', userId: 'user-1', role: 'MEMBER' }]; const service = { listMembersForUser: async (organizationId: string, userId: string) => { calls.push({ organizationId, userId }); return members; } };
  const controller = new OrganizationController(service as never); const request = { user: { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' } }; assert.deepEqual(await controller.listMembers('org-1', request as never), members); assert.deepEqual(calls, [{ organizationId: 'org-1', userId: 'user-1' }]);
});
test('organization creation uses authenticated user context and request id', async () => {
  const calls: Array<{ name: string; userId: string; requestId: string }> = []; const service = { createForUser: async (input: { name: string }, userId: string, requestId: string) => { calls.push({ name: input.name, userId, requestId }); return { id: 'org-2', name: input.name }; } };
  const controller = new OrganizationController(service as never); const request = { user: { userId: 'user-2', organizationId: 'org-1', sessionId: 'session-2' } }; assert.deepEqual(await controller.createOrganization({ name: '  New Firm  ' }, request as never, 'req-2'), { id: 'org-2', name: 'New Firm' }); assert.deepEqual(calls, [{ name: 'New Firm', userId: 'user-2', requestId: 'req-2' }]);
});
test('organization creation rejects malformed input before calling the service', async () => {
  let called = false; const controller = new OrganizationController({ createForUser: async () => { called = true; } } as never); const request = { user: { userId: 'user-2', organizationId: null, sessionId: 'session-2' } }; await assert.rejects(() => controller.createOrganization({ name: ' ' }, request as never, 'req-2'), BadRequestException); assert.equal(called, false);
});
test('organization update uses authenticated user context and request id', async () => {
  const calls: Array<{ organizationId: string; name: string; userId: string; requestId: string }> = []; const service = { updateForUser: async (organizationId: string, input: { name: string }, userId: string, requestId: string) => { calls.push({ organizationId, name: input.name, userId, requestId }); return { id: organizationId, name: input.name }; } };
  const controller = new OrganizationController(service as never); const request = { user: { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' } }; assert.deepEqual(await controller.updateOrganization('org-1', { name: '  Updated Firm  ' }, request as never, 'req-3'), { id: 'org-1', name: 'Updated Firm' }); assert.deepEqual(calls, [{ organizationId: 'org-1', name: 'Updated Firm', userId: 'user-1', requestId: 'req-3' }]);
});
test('organization update rejects malformed input before calling the service', async () => {
  let called = false; const controller = new OrganizationController({ updateForUser: async () => { called = true; } } as never); const request = { user: { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' } }; await assert.rejects(() => controller.updateOrganization('org-1', { name: ' ' }, request as never, 'req-3'), BadRequestException); assert.equal(called, false);
});
test('organization invitation uses authenticated user context and request id', async () => {
  const calls: Array<{ organizationId: string; email: string; role: string; userId: string; requestId: string }> = []; const service = { createInvitationForUser: async (organizationId: string, input: { email: string; role: 'CA' | 'MEMBER' }, userId: string, requestId: string) => { calls.push({ organizationId, email: input.email, role: input.role, userId, requestId }); return { id: 'inv-1', email: input.email, role: input.role, expiresAt: new Date('2026-09-17T00:00:00.000Z'), token: 'opaque-token' }; } };
  const controller = new OrganizationController(service as never); const request = { user: { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' } }; assert.deepEqual(await controller.createInvitation('org-1', { email: '  Invitee@Example.Test ', role: 'CA' }, request as never, 'req-4'), { id: 'inv-1', email: 'invitee@example.test', role: 'CA', expiresAt: new Date('2026-09-17T00:00:00.000Z'), token: 'opaque-token' }); assert.deepEqual(calls, [{ organizationId: 'org-1', email: 'invitee@example.test', role: 'CA', userId: 'user-1', requestId: 'req-4' }]);
});
test('organization invitation rejects malformed input before calling the service', async () => {
  let called = false; const controller = new OrganizationController({ createInvitationForUser: async () => { called = true; } } as never); const request = { user: { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' } }; await assert.rejects(() => controller.createInvitation('org-1', { email: 'not-an-email', role: 'OWNER' }, request as never, 'req-4'), BadRequestException); assert.equal(called, false);
});
