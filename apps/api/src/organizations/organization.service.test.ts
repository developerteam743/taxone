import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { createOrganizationForUser, createOrganizationInvitationForUser, encodeOrganizationCursor, findOrganizationForUser, listOrganizationMembersForUser, listOrganizationsForUser, normalizeOrganizationPageSize, updateOrganizationForUser } from './organization.service.js';

function prismaFor(result: unknown) {
  return {
    organization: {
      findFirst: async (args: unknown) => { assert.deepEqual(args, { where: { id: 'org-1', memberships: { some: { userId: 'user-1' } } }, select: { id: true, name: true, createdAt: true, updatedAt: true } }); return result; },
      findUnique: async (args: unknown) => { assert.deepEqual(args, { where: { id: 'org-1' }, select: { id: true, name: true, createdAt: true, updatedAt: true } }); return result; },
      update: async (args: unknown) => { assert.deepEqual(args, { where: { id: 'org-1' }, data: { name: 'Updated Firm' }, select: { id: true, name: true, createdAt: true, updatedAt: true } }); return result; },
    },
    membership: {
      findFirst: async (args: unknown) => { assert.deepEqual(args, { where: { organizationId: 'org-1', userId: 'user-1' }, select: { id: true } }); return result; },
      findMany: async (args: unknown) => { assert.deepEqual(args, { where: { organizationId: 'org-1' }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { id: true, userId: true, role: true, createdAt: true, user: { select: { id: true, email: true, name: true } } } }); return result; },
    },
  };
}

test('returns an organization only when the authenticated user is a member', async () => {
  const createdAt = new Date('2026-09-10T00:00:00.000Z');
  const organization = { id: 'org-1', name: 'TaxOne Firm', createdAt, updatedAt: createdAt };
  assert.deepEqual(await findOrganizationForUser(prismaFor(organization) as never, 'org-1', 'user-1'), organization);
});
test('does not disclose organizations outside the authenticated membership boundary', async () => { await assert.rejects(() => findOrganizationForUser(prismaFor(null) as never, 'org-1', 'user-1'), NotFoundException); });
test('lists only members from an organization the authenticated user belongs to', async () => {
  const createdAt = new Date('2026-09-10T00:00:00.000Z');
  const members = [{ id: 'membership-1', userId: 'user-1', role: 'OWNER', createdAt, user: { id: 'user-1', email: 'owner@example.test', name: 'Owner' } }];
  assert.deepEqual(await listOrganizationMembersForUser(prismaFor(members) as never, 'org-1', 'user-1'), members);
});
test('does not list members when the authenticated user is outside the organization', async () => { await assert.rejects(() => listOrganizationMembersForUser(prismaFor(null) as never, 'org-1', 'user-1'), NotFoundException); });
test('lists organizations only for the authenticated user with a bounded page', async () => {
  const organizations = [{ id: 'org-1', name: 'One', createdAt: new Date('2026-09-10T00:00:00.000Z'), updatedAt: new Date('2026-09-10T00:00:00.000Z') }, { id: 'org-2', name: 'Two', createdAt: new Date('2026-09-11T00:00:00.000Z'), updatedAt: new Date('2026-09-11T00:00:00.000Z') }];
  const calls: unknown[] = [];
  const prisma = { membership: { findFirst: async (args: unknown) => { calls.push(args); return null; }, findMany: async (args: unknown) => { calls.push(args); return [{ id: 'membership-1', organization: organizations[0] }, { id: 'membership-2', organization: organizations[1] }]; } }, organization: { findFirst: async () => null } };
  assert.deepEqual(await listOrganizationsForUser(prisma as never, 'user-1', 1), { items: [organizations[0]], nextCursor: encodeOrganizationCursor('membership-1') });
  assert.deepEqual(calls, [{ where: { userId: 'user-1' }, take: 2, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { id: true, organization: { select: { id: true, name: true, createdAt: true, updatedAt: true } } } }]);
});
test('organization list cursor is scoped to the authenticated user', async () => {
  let findManyCalled = false;
  const prisma = { membership: { findFirst: async (args: unknown) => { assert.deepEqual(args, { where: { id: 'membership-other', userId: 'user-1' }, select: { id: true } }); return null; }, findMany: async () => { findManyCalled = true; return []; } }, organization: { findFirst: async () => null } };
  await assert.rejects(() => listOrganizationsForUser(prisma as never, 'user-1', 20, encodeOrganizationCursor('membership-other')), BadRequestException); assert.equal(findManyCalled, false);
});
test('organization list rejects malformed cursor and page size', async () => { await assert.rejects(() => listOrganizationsForUser(prismaFor(null) as never, 'user-1', 20, 'not-a-valid-cursor'), BadRequestException); assert.equal(normalizeOrganizationPageSize(undefined), 20); assert.equal(normalizeOrganizationPageSize('100'), 100); assert.throws(() => normalizeOrganizationPageSize('101'), BadRequestException); assert.throws(() => normalizeOrganizationPageSize('0'), BadRequestException); assert.throws(() => normalizeOrganizationPageSize('abc'), BadRequestException); });
test('creates an organization, owner membership, and audit record in one transaction', async () => {
  const calls: string[] = []; const organization = { id: 'org-2', name: 'New Firm', createdAt: new Date('2026-09-10T00:00:00.000Z'), updatedAt: new Date('2026-09-10T00:00:00.000Z') };
  const tx = { organization: { create: async (args: unknown) => { calls.push(`organization:${JSON.stringify(args)}`); return organization; } }, membership: { create: async (args: unknown) => { calls.push(`membership:${JSON.stringify(args)}`); return { id: 'membership-2' }; } }, auditLog: { create: async (args: unknown) => { calls.push(`audit:${JSON.stringify(args)}`); return { id: 'audit-2' }; } } };
  const prisma = { $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx) }; const result = await createOrganizationForUser(prisma as never, { name: 'New Firm' }, 'user-2', 'req-2');
  assert.deepEqual(result, organization); assert.equal(calls.length, 3); assert.match(calls[1]!, /organizationId.*org-2.*userId.*user-2.*OWNER/); assert.match(calls[2]!, /ORGANIZATION_CREATED.*org-2.*req-2/);
});
test('updates a member organization and audits the name change transactionally', async () => {
  const before = { id: 'org-1', name: 'Old Firm', createdAt: new Date('2026-09-10T00:00:00.000Z'), updatedAt: new Date('2026-09-10T00:00:00.000Z') };
  const after = { ...before, name: 'Updated Firm' }; const calls: string[] = [];
  const tx = { membership: { findFirst: async (args: unknown) => { assert.deepEqual(args, { where: { organizationId: 'org-1', userId: 'user-1' }, select: { id: true } }); return { id: 'membership-1' }; } }, organization: { findUnique: async (args: unknown) => { assert.deepEqual(args, { where: { id: 'org-1' }, select: { id: true, name: true, createdAt: true, updatedAt: true } }); return before; }, update: async (args: unknown) => { assert.deepEqual(args, { where: { id: 'org-1' }, data: { name: 'Updated Firm' }, select: { id: true, name: true, createdAt: true, updatedAt: true } }); calls.push('update'); return after; } }, auditLog: { create: async (args: unknown) => { assert.deepEqual(args, { data: { organizationId: 'org-1', actorUserId: 'user-1', action: 'ORGANIZATION_UPDATED', entityType: 'Organization', entityId: 'org-1', requestId: 'req-3', metadata: { before: { name: 'Old Firm' }, after: { name: 'Updated Firm' } } } }); calls.push('audit'); return { id: 'audit-1' }; } } };
  const prisma = { $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx) }; assert.deepEqual(await updateOrganizationForUser(prisma as never, 'org-1', { name: 'Updated Firm' }, 'user-1', 'req-3'), after); assert.deepEqual(calls, ['update', 'audit']);
});
test('does not update an organization outside the authenticated membership boundary', async () => {
  const tx = { membership: { findFirst: async () => null }, organization: { findUnique: async () => { throw new Error('must not query organization'); } } };
  const prisma = { $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx) };
  await assert.rejects(() => updateOrganizationForUser(prisma as never, 'org-1', { name: 'Updated Firm' }, 'user-1', 'req-3'), NotFoundException);
});
test('does not create an audit record when organization name is unchanged', async () => {
  const organization = { id: 'org-1', name: 'Same Firm', createdAt: new Date('2026-09-10T00:00:00.000Z'), updatedAt: new Date('2026-09-10T00:00:00.000Z') }; let auditCalled = false;
  const tx = { membership: { findFirst: async () => ({ id: 'membership-1' }) }, organization: { findUnique: async () => organization }, auditLog: { create: async () => { auditCalled = true; return {}; } } };
  const prisma = { $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx) };
  assert.deepEqual(await updateOrganizationForUser(prisma as never, 'org-1', { name: 'Same Firm' }, 'user-1', 'req-4'), organization); assert.equal(auditCalled, false);
});
test('creates a tenant-scoped invitation with a hashed token and audit record', async () => {
  const now = new Date('2026-09-10T00:00:00.000Z'); const calls: unknown[] = [];
  const invitation = { id: 'inv-1', email: 'invitee@example.test', role: 'CA', expiresAt: new Date('2026-09-17T00:00:00.000Z') };
  const tx = { membership: { findFirst: async (args: unknown) => { assert.deepEqual(args, { where: { organizationId: 'org-1', userId: 'user-1' }, select: { id: true } }); return { id: 'membership-1' }; } }, user: { findUnique: async (args: unknown) => { assert.deepEqual(args, { where: { email: 'invitee@example.test' }, select: { id: true } }); return null; } }, organizationInvitation: { create: async (args: unknown) => { calls.push(args); return invitation; } }, auditLog: { create: async (args: unknown) => { calls.push(args); return { id: 'audit-1' }; } } };
  const prisma = { $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx) };
  const result = await createOrganizationInvitationForUser(prisma as never, 'org-1', { email: 'invitee@example.test', role: 'CA' }, 'user-1', 'req-5', now);
  assert.equal(result.id, invitation.id); assert.equal(result.email, invitation.email); assert.equal(result.role, invitation.role); assert.equal(result.expiresAt.getTime(), invitation.expiresAt.getTime()); assert.match(result.token, /^[A-Za-z0-9_-]{43}$/);
  const createArgs = calls[0] as { data: { tokenHash: string; email: string; role: string; organizationId: string; inviterUserId: string; expiresAt: Date } };
  assert.equal(createArgs.data.tokenHash.length, 64); assert.notEqual(createArgs.data.tokenHash, result.token); assert.equal(createArgs.data.email, 'invitee@example.test'); assert.equal(createArgs.data.organizationId, 'org-1'); assert.equal(createArgs.data.inviterUserId, 'user-1'); assert.equal(createArgs.data.expiresAt.getTime(), invitation.expiresAt.getTime());
  const auditArgs = calls[1] as { data: { action: string; entityType: string; metadata: Record<string, unknown> } }; assert.equal(auditArgs.data.action, 'ORGANIZATION_INVITATION_CREATED'); assert.equal(auditArgs.data.entityType, 'OrganizationInvitation'); assert.equal('token' in auditArgs.data.metadata, false);
});
test('does not create an invitation outside the authenticated membership boundary', async () => {
  const tx = { membership: { findFirst: async () => null }, user: { findUnique: async () => { throw new Error('must not query user'); } }, organizationInvitation: { create: async () => { throw new Error('must not create invitation'); } }, auditLog: { create: async () => { throw new Error('must not audit invitation'); } } };
  const prisma = { $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx) };
  await assert.rejects(() => createOrganizationInvitationForUser(prisma as never, 'org-other', { email: 'invitee@example.test', role: 'MEMBER' }, 'user-1', 'req-6'), NotFoundException);
});
test('does not invite a user who is already a member of the organization', async () => {
  const calls: string[] = [];
  const tx = {
    membership: { findFirst: async (args: unknown) => { calls.push(JSON.stringify(args)); return JSON.stringify(args).includes('user-2') ? { id: 'existing-membership' } : { id: 'membership-inviter' }; } },
    user: { findUnique: async () => ({ id: 'user-2' }) },
    organizationInvitation: { create: async () => { throw new Error('must not create invitation'); } },
    auditLog: { create: async () => { throw new Error('must not audit invitation'); } },
  };
  const prisma = { $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx) };
  await assert.rejects(() => createOrganizationInvitationForUser(prisma as never, 'org-1', { email: 'member@example.test', role: 'MEMBER' }, 'user-1', 'req-7'), ConflictException);
  assert.equal(calls.length, 2);
});
