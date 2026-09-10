import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { createBusinessForOrganization, encodeBusinessCursor, getBusinessForOrganization, listBusinessesForOrganization, normalizeBusinessPageSize, updateBusinessForOrganization } from './business.service.js';

const business = { id: 'business-1', organizationId: 'org-1', clientId: 'client-1', name: 'Acme Retail', tradeName: 'Acme', pan: 'ABCDE1234F', gstin: '24ABCDE1234F1Z5', createdAt: new Date('2026-09-10T00:00:00.000Z'), updatedAt: new Date('2026-09-10T00:00:00.000Z') };
const select = { id: true, organizationId: true, clientId: true, name: true, tradeName: true, pan: true, gstin: true, createdAt: true, updatedAt: true };

test('lists businesses only inside the requested organization', async () => {
  let args: unknown;
  const prisma = { business: { findMany: async (value: unknown) => { args = value; return [business, { ...business, id: 'business-2' }]; } } };
  assert.deepEqual(await listBusinessesForOrganization(prisma as never, 'org-1', 1), { items: [business], nextCursor: encodeBusinessCursor('business-1') });
  assert.deepEqual(args, { where: { organizationId: 'org-1' }, take: 2, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select });
});

test('rejects a business cursor from another organization', async () => {
  let findManyCalled = false;
  const prisma = { business: { findFirst: async (args: unknown) => { assert.deepEqual(args, { where: { id: 'business-other', organizationId: 'org-1' }, select: { id: true } }); return null; }, findMany: async () => { findManyCalled = true; return []; } } };
  await assert.rejects(() => listBusinessesForOrganization(prisma as never, 'org-1', 20, encodeBusinessCursor('business-other')), BadRequestException);
  assert.equal(findManyCalled, false);
});

test('gets only a business owned by the organization', async () => {
  const prisma = { business: { findFirst: async (args: unknown) => { assert.deepEqual(args, { where: { id: 'business-1', organizationId: 'org-1' }, select }); return business; } } };
  assert.deepEqual(await getBusinessForOrganization(prisma as never, 'org-1', 'business-1'), business);
  await assert.rejects(() => getBusinessForOrganization({ business: { findFirst: async () => null } } as never, 'org-1', 'missing'), NotFoundException);
});

test('creates a business only for a client in the same organization and audits it', async () => {
  const calls: unknown[] = [];
  const tx = { client: { findFirst: async (args: unknown) => { calls.push(args); return { id: 'client-1' }; } }, business: { create: async (args: unknown) => { calls.push(args); return business; } }, auditLog: { create: async (args: unknown) => { calls.push(args); return {}; } } };
  const prisma = { $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx) };
  assert.deepEqual(await createBusinessForOrganization(prisma as never, 'org-1', { clientId: 'client-1', name: business.name, tradeName: business.tradeName!, pan: business.pan!, gstin: business.gstin! }, 'user-1', 'req-1'), business);
  assert.match(JSON.stringify(calls[0]), /client-1/); assert.match(JSON.stringify(calls[0]), /org-1/); assert.match(JSON.stringify(calls[2]), /BUSINESS_CREATED/);
});

test('rejects a cross-tenant client without creating a business', async () => {
  const tx = { client: { findFirst: async () => null }, business: { create: async () => { throw new Error('must not create'); } }, auditLog: { create: async () => { throw new Error('must not audit'); } } };
  const prisma = { $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx) };
  await assert.rejects(() => createBusinessForOrganization(prisma as never, 'org-1', { clientId: 'other-client', name: 'Nope' }, 'user-1', 'req-2'), NotFoundException);
});

test('maps duplicate GSTIN to a tenant-scoped conflict', async () => {
  const tx = { client: { findFirst: async () => ({ id: 'client-1' }) }, business: { create: async () => { throw { code: 'P2002' }; } }, auditLog: { create: async () => ({}) } };
  const prisma = { $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx) };
  await assert.rejects(() => createBusinessForOrganization(prisma as never, 'org-1', { clientId: 'client-1', name: 'Duplicate', gstin: business.gstin! }, 'user-1', 'req-3'), ConflictException);
});

test('updates a tenant business and audits before and after', async () => {
  const updated = { ...business, name: 'Acme Updated' }; const calls: unknown[] = [];
  const tx = { business: { findFirst: async () => business, update: async (args: unknown) => { calls.push(args); return updated; } }, auditLog: { create: async (args: unknown) => { calls.push(args); return {}; } } };
  const prisma = { $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx) };
  assert.deepEqual(await updateBusinessForOrganization(prisma as never, 'org-1', 'business-1', { name: 'Acme Updated' }, 'user-1', 'req-4'), updated);
  assert.deepEqual(calls[0], { where: { id: 'business-1' }, data: { name: 'Acme Updated' }, select });
  assert.match(JSON.stringify(calls[1]), /Acme Retail/); assert.match(JSON.stringify(calls[1]), /Acme Updated/);
});

test('does not update a cross-tenant business', async () => {
  const tx = { business: { findFirst: async () => null, update: async () => { throw new Error('must not update'); } }, auditLog: { create: async () => { throw new Error('must not audit'); } } };
  const prisma = { $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx) };
  await assert.rejects(() => updateBusinessForOrganization(prisma as never, 'org-1', 'other-business', { name: 'Nope' }, 'user-1', 'req-5'), NotFoundException);
});

test('normalizes and bounds business pagination', () => { assert.equal(normalizeBusinessPageSize(undefined), 20); assert.equal(normalizeBusinessPageSize('100'), 100); assert.throws(() => normalizeBusinessPageSize('0'), BadRequestException); assert.throws(() => normalizeBusinessPageSize('101'), BadRequestException); assert.throws(() => normalizeBusinessPageSize('nope'), BadRequestException); });
