import assert from 'node:assert/strict';
import test from 'node:test';
import { NotFoundException } from '@nestjs/common';
import { findOrganizationForUser } from './organization.service.js';

function prismaFor(result: unknown) {
  return {
    organization: {
      findFirst: async (args: unknown) => {
        assert.deepEqual(args, {
          where: { id: 'org-1', memberships: { some: { userId: 'user-1' } } },
          select: { id: true, name: true, createdAt: true, updatedAt: true },
        });
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
  await assert.rejects(
    () => findOrganizationForUser(prismaFor(null) as never, 'org-1', 'user-1'),
    NotFoundException,
  );
});
