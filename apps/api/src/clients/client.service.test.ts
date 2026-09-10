import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { createClientForOrganization, deleteClientForOrganization, encodeClientCursor, getClientForOrganization, listClientsForOrganization, normalizeClientPageSize, updateClientForOrganization } from './client.service.js';

const client = { id: 'client-1', organizationId: 'org-1', name: 'Acme Pvt Ltd', email: 'owner@acme.test', phone: '+919999999999', pan: 'ABCDE1234F', createdAt: new Date('2026-09-10T00:00:00.000Z'), updatedAt: new Date('2026-09-10T00:00:00.000Z') };
const select = { id: true, organizationId: true, name: true, email: true, phone: true, pan: true, createdAt: true, updatedAt: true };

type ClientTransactionMock = {
  client: { create: (args: unknown) => Promise<unknown>; findFirst: (args: unknown) => Promise<unknown>; update: (args: unknown) => Promise<unknown>; delete: (args: unknown) => Promise<unknown> };
  auditLog: { create: (args: unknown) => Promise<unknown> };
};

test('lists clients only inside the requested organization and returns a cursor', async () => {
  let findManyArgs: unknown;
  const prisma = { client: { findMany: async (args: unknown) => { findManyArgs = args; return [client, { ...client, id: 'client-2' }]; } } };
  assert.deepEqual(await listClientsForOrganization(prisma as never, 'org-1', 1), { items: [client], nextCursor: encodeClientCursor('client-1') });
  assert.deepEqual(findManyArgs, { where: { organizationId: 'org-1' }, take: 2, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select });
});

test('rejects a cursor belonging to another organization', async () => {
  let findManyCalled = false;
  const prisma = { client: { findFirst: async (args: unknown) => { assert.deepEqual(args, { where: { id: 'other-client', organizationId: 'org-1' }, select: { id: true } }); return null; }, findMany: async () => { findManyCalled = true; return []; } } };
  await assert.rejects(() => listClientsForOrganization(prisma as never, 'org-1', 20, encodeClientCursor('other-client')), BadRequestException); assert.equal(findManyCalled, false);
});

test('gets only a client owned by the organization', async () => {
  const prisma = { client: { findFirst: async (args: unknown) => { assert.deepEqual(args, { where: { id: 'client-1', organizationId: 'org-1' }, select }); return client; } } };
  assert.deepEqual(await getClientForOrganization(prisma as never, 'org-1', 'client-1'), client);
  await assert.rejects(() => getClientForOrganization({ client: { findFirst: async () => null } } as never, 'org-1', 'client-other'), NotFoundException);
});

test('creates a client and audit record transactionally', async () => {
  const calls: unknown[] = [];
  const tx: ClientTransactionMock = { client: { create: async (args: unknown) => { calls.push(args); return client; }, findFirst: async () => null, update: async () => client, delete: async () => client }, auditLog: { create: async (args: unknown) => { calls.push(args); return {}; } } };
  const prisma = { $transaction: async (callback: (transaction: ClientTransactionMock) => Promise<unknown>) => callback(tx) };
  assert.deepEqual(await createClientForOrganization(prisma as never, 'org-1', { name: client.name, email: client.email, phone: client.phone, pan: client.pan }, 'user-1', 'req-1'), client);
  assert.match(JSON.stringify(calls[0]), /org-1/); assert.match(JSON.stringify(calls[1]), /CLIENT_CREATED/); assert.match(JSON.stringify(calls[1]), /user-1/);
});

test('maps duplicate PAN to a tenant-scoped conflict', async () => {
  const tx: ClientTransactionMock = { client: { create: async () => { throw { code: 'P2002' }; }, findFirst: async () => null, update: async () => client, delete: async () => client }, auditLog: { create: async () => ({}) } };
  const prisma = { $transaction: async (callback: (transaction: ClientTransactionMock) => Promise<unknown>) => callback(tx) };
  await assert.rejects(() => createClientForOrganization(prisma as never, 'org-1', { name: 'Duplicate', pan: client.pan }, 'user-1', 'req-2'), ConflictException);
});

test('updates only supplied client fields and audits before/after', async () => {
  const updated = { ...client, name: 'Acme Updated' }; const calls: unknown[] = [];
  const tx: ClientTransactionMock = { client: { findFirst: async () => client, update: async (args: unknown) => { calls.push(args); return updated; }, create: async () => client, delete: async () => client }, auditLog: { create: async (args: unknown) => { calls.push(args); return {}; } } };
  const prisma = { $transaction: async (callback: (transaction: ClientTransactionMock) => Promise<unknown>) => callback(tx) };
  assert.deepEqual(await updateClientForOrganization(prisma as never, 'org-1', 'client-1', { name: 'Acme Updated' }, 'user-1', 'req-3'), updated);
  assert.deepEqual(calls[0], { where: { id: 'client-1' }, data: { name: 'Acme Updated' }, select });
  assert.match(JSON.stringify(calls[1]), /Acme Pvt Ltd/); assert.match(JSON.stringify(calls[1]), /Acme Updated/);
});

test('does not update a cross-tenant client', async () => {
  const tx: ClientTransactionMock = { client: { findFirst: async () => null, update: async () => { throw new Error('must not update'); }, create: async () => client, delete: async () => client }, auditLog: { create: async () => { throw new Error('must not audit'); } } };
  const prisma = { $transaction: async (callback: (transaction: ClientTransactionMock) => Promise<unknown>) => callback(tx) };
  await assert.rejects(() => updateClientForOrganization(prisma as never, 'org-1', 'other-client', { name: 'Nope' }, 'user-1', 'req-4'), NotFoundException);
});

test('deletes a tenant client and writes an audit record', async () => {
  const calls: unknown[] = [];
  const tx: ClientTransactionMock = { client: { findFirst: async () => client, delete: async (args: unknown) => { calls.push(args); return client; }, create: async () => client, update: async () => client }, auditLog: { create: async (args: unknown) => { calls.push(args); return {}; } } };
  const prisma = { $transaction: async (callback: (transaction: ClientTransactionMock) => Promise<unknown>) => callback(tx) };
  assert.deepEqual(await deleteClientForOrganization(prisma as never, 'org-1', 'client-1', 'user-1', 'req-5'), { deleted: true, id: 'client-1' });
  assert.deepEqual(calls[0], { where: { id: 'client-1' } }); assert.match(JSON.stringify(calls[1]), /CLIENT_DELETED/);
});

test('normalizes and bounds client pagination', () => { assert.equal(normalizeClientPageSize(undefined), 20); assert.equal(normalizeClientPageSize('100'), 100); assert.throws(() => normalizeClientPageSize('0'), BadRequestException); assert.throws(() => normalizeClientPageSize('101'), BadRequestException); assert.throws(() => normalizeClientPageSize('nope'), BadRequestException); });
