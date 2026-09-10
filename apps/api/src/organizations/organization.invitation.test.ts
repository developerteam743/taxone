import assert from 'node:assert/strict';
import test from 'node:test';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { createOrganizationInvitationForUser, ORGANIZATION_INVITATION_TTL_SECONDS } from './organization.service.js';

type InvitationCreateArgs = { data: { email: string; role: string; tokenHash: string; expiresAt: Date; organizationId: string; inviterUserId: string } };

function txFor(options: { membership?: unknown; existingUser?: unknown; existingMembership?: unknown }) {
  const calls: string[] = [];
  const tx = {
    membership: { findFirst: async (args: unknown) => { calls.push(`membership:${JSON.stringify(args)}`); return options.existingMembership ?? options.membership ?? null; } },
    user: { findUnique: async (args: unknown) => { calls.push(`user:${JSON.stringify(args)}`); return options.existingUser ?? null; } },
    organizationInvitation: { create: async (args: InvitationCreateArgs) => { calls.push(`invitation:${JSON.stringify(args)}`); return { id: 'inv-1', email: args.data.email, role: args.data.role, expiresAt: args.data.expiresAt }; } },
    auditLog: { create: async (args: unknown) => { calls.push(`audit:${JSON.stringify(args)}`); return { id: 'audit-1' }; } },
  };
  return { prisma: { $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx) }, calls };
}

test('creates a tenant-scoped invitation with a one-time plaintext token and audit record', async () => {
  const now = new Date('2026-09-10T00:00:00.000Z');
  const { prisma, calls } = txFor({ membership: { id: 'membership-1' } });
  const result = await createOrganizationInvitationForUser(prisma as never, 'org-1', { email: 'invitee@example.test', role: 'CA' }, 'user-1', 'req-1', now);
  assert.equal(result.id, 'inv-1');
  assert.equal(result.email, 'invitee@example.test');
  assert.equal(result.role, 'CA');
  assert.equal(result.expiresAt.toISOString(), new Date(now.getTime() + ORGANIZATION_INVITATION_TTL_SECONDS * 1000).toISOString());
  assert.ok(result.token.length >= 43);
  assert.equal(calls.length, 4);
  assert.match(calls[0]!, /org-1.*user-1/);
  assert.match(calls[1]!, /invitee@example.test/);
  assert.match(calls[2]!, /tokenHash/);
  assert.doesNotMatch(calls[2]!, new RegExp(result.token));
  assert.match(calls[3]!, /ORGANIZATION_INVITATION_CREATED.*invitee@example.test.*CA/);
});

test('does not create an invitation outside the authenticated organization membership boundary', async () => {
  const { prisma, calls } = txFor({ membership: null });
  await assert.rejects(() => createOrganizationInvitationForUser(prisma as never, 'org-other', { email: 'invitee@example.test', role: 'MEMBER' }, 'user-1', 'req-2'), NotFoundException);
  assert.equal(calls.length, 1);
});

test('does not invite an existing organization member', async () => {
  const { prisma } = txFor({ membership: { id: 'inviter-membership' }, existingUser: { id: 'user-2' }, existingMembership: { id: 'member-membership' } });
  await assert.rejects(() => createOrganizationInvitationForUser(prisma as never, 'org-1', { email: 'member@example.test', role: 'MEMBER' }, 'user-1', 'req-3'), ConflictException);
});
