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
