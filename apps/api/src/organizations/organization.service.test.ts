import assert from 'node:assert/strict';
import test from 'node:test';
import { NotFoundException } from '@nestjs/common';
import { createOrganizationForUser, findOrganizationForUser, listOrganizationMembersForUser } from './organization.service.js';

function prismaFor(result: unknown) {
  return {
    organization: {
      findFirst: async (args: unknown) => {
        assert.deepEqual(args, { where: { id: 'org-1', memberships: { some: { userId: 'user-1' } } }, select: { id: true, name: true, createdAt: true, updatedAt: true } });
        return result;
      },
    },
    membership: {
      findFirst: async (args: unknown) => {
        assert.deepEqual(args, { where: { organizationId: 'org-1', userId: 'user-1' }, select: { id: true } });
        return result;
      },
      findMany: async (args: unknown) => {
        assert.deepEqual(args, { where: { organizationId: 'org-1' }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { id: true, userId: true, role: true, createdAt: true, user: { select: { id: true, email: true, name: true } } } });
        return result;
      },
    },
  };
}

test('returns an organization only when the authenticated user is a member', async () => {
  const createdAt = new Date('2026-09-10T00:00:00.000Z');
  const organization = { id: 'org-1', name: 'TaxOne Firm', createdAt, updatedAt: createdAt };
  const result = await findOrganizationForUser(prismaFor(organization) as never, 'org-1', 'user-1');
  assert.deepEqual(result, organization);
});

test('does not disclose organizations outside the authenticated membership boundary', async () => {
  await assert.rejects(() => findOrganizationForUser(prismaFor(null) as never, 'org-1', 'user-1'), NotFoundException);
});

test('lists only members from an organization the authenticated user belongs to', async () => {
  const createdAt = new Date('2026-09-10T00:00:00.000Z');
  const members = [{ id: 'membership-1', userId: 'user-1', role: 'OWNER', createdAt, user: { id: 'user-1', email: 'owner@example.test', name: 'Owner' } }];
  const result = await listOrganizationMembersForUser(prismaFor(members) as never, 'org-1', 'user-1');
  assert.deepEqual(result, members);
});

test('does not list members when the authenticated user is outside the organization', async () => {
  await assert.rejects(() => listOrganizationMembersForUser(prismaFor(null) as never, 'org-1', 'user-1'), NotFoundException);
});

test('creates an organization, owner membership, and audit record in one transaction', async () => {
  const calls: string[] = [];
  const organization = { id: 'org-2', name: 'New Firm', createdAt: new Date('2026-09-10T00:00:00.000Z'), updatedAt: new Date('2026-09-10T00:00:00.000Z') };
  const tx = {
    organization: { create: async (args: unknown) => { calls.push(`organization:${JSON.stringify(args)}`); return organization; } },
    membership: { create: async (args: unknown) => { calls.push(`membership:${JSON.stringify(args)}`); return { id: 'membership-2' }; } },
    auditLog: { create: async (args: unknown) => { calls.push(`audit:${JSON.stringify(args)}`); return { id: 'audit-2' }; } },
  };
  const prisma = { $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx) };
  const result = await createOrganizationForUser(prisma as never, { name: 'New Firm' }, 'user-2', 'req-2');
  assert.deepEqual(result, organization);
  assert.equal(calls.length, 3);
  assert.match(calls[0]!, /organization.*New Firm/);
  assert.match(calls[1]!, /organizationId.*org-2.*userId.*user-2.*OWNER/);
  assert.match(calls[2]!, /ORGANIZATION_CREATED.*org-2.*req-2/);
});
