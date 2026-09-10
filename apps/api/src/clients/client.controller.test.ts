import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ClientController } from './client.controller.js';

const user = { userId: 'user-1', organizationId: 'org-1', sessionId: 'session-1' };
const service = { list: async (...args: unknown[]) => args, get: async (...args: unknown[]) => args, create: async (...args: unknown[]) => args, update: async (...args: unknown[]) => args, delete: async (...args: unknown[]) => args };
const request = { user };

test('lists clients using the authenticated organization and pagination', async () => {
  const controller = new ClientController(service as never);
  assert.deepEqual(await controller.list(request as never, '25', 'cursor-1'), ['org-1', 25, 'cursor-1']);
});

test('rejects client list without an authenticated organization', async () => {
  const controller = new ClientController(service as never);
  await assert.rejects(() => controller.list({ user: { userId: 'user-1', organizationId: null } } as never, undefined, undefined), ForbiddenException);
});

test('gets a client using the authenticated organization', async () => {
  const controller = new ClientController(service as never);
  assert.deepEqual(await controller.get('client-1', request as never), ['org-1', 'client-1']);
});

test('validates create input before service call', async () => {
  const controller = new ClientController(service as never);
  await assert.rejects(() => controller.create({ name: '' }, request as never, 'req-1'), BadRequestException);
});

test('creates a client using authenticated actor and request id', async () => {
  const controller = new ClientController(service as never);
  assert.deepEqual(await controller.create({ name: 'Acme', email: 'Owner@Acme.Test', pan: 'abcde1234f' }, request as never, 'req-2'), ['org-1', { name: 'Acme', email: 'owner@acme.test', pan: 'ABCDE1234F' }, 'user-1', 'req-2']);
});

test('updates a client using authenticated organization and actor', async () => {
  const controller = new ClientController(service as never);
  assert.deepEqual(await controller.update('client-1', { name: 'Updated' }, request as never, 'req-3'), ['org-1', 'client-1', { name: 'Updated' }, 'user-1', 'req-3']);
});

test('deletes a client using authenticated organization and actor', async () => {
  const controller = new ClientController(service as never);
  assert.deepEqual(await controller.remove('client-1', request as never, 'req-4'), ['org-1', 'client-1', 'user-1', 'req-4']);
});
