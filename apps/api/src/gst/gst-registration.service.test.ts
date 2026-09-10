import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { createGstRegistrationForOrganization, encodeGstRegistrationCursor, listGstRegistrationsForOrganization, normalizeGstRegistrationPageSize } from './gst-registration.service.js';

const registration = { id: 'gst-1', organizationId: 'org-1', businessId: 'business-1', gstin: '24ABCDE1234F1Z5', legalName: 'Acme Retail Private Limited', registrationType: 'REGULAR', status: 'ACTIVE', effectiveFrom: new Date('2026-04-01T00:00:00.000Z'), createdAt: new Date('2026-09-10T00:00:00.000Z'), updatedAt: new Date('2026-09-10T00:00:00.000Z') };
const select = { id: true, organizationId: true, businessId: true, gstin: true, legalName: true, registrationType: true, status: true, effectiveFrom: true, createdAt: true, updatedAt: true };

test('lists registrations inside the organization and supports business filtering', async () => {
  let args: unknown;
  const prisma = { gstRegistration: { findMany: async (value: unknown) => { args = value; return [registration, { ...registration, id: 'gst-2' }]; } } };
  assert.deepEqual(await listGstRegistrationsForOrganization(prisma as never, 'org-1', 1, undefined, 'business-1'), { items: [registration], nextCursor: encodeGstRegistrationCursor('gst-1') });
  assert.deepEqual(args, { where: { organizationId: 'org-1', businessId: 'business-1' }, take: 2, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select });
});

test('rejects a cursor outside the organization', async () => {
  let findManyCalled = false;
  const prisma = { gstRegistration: { findFirst: async (args: unknown) => { assert.deepEqual(args, { where: { id: 'gst-other', organizationId: 'org-1' }, select: { id: true } }); return null; }, findMany: async () => { findManyCalled = true; return []; } } };
  await assert.rejects(() => listGstRegistrationsForOrganization(prisma as never, 'org-1', 20, encodeGstRegistrationCursor('gst-other')), BadRequestException);
  assert.equal(findManyCalled, false);
});

test('creates a registration only for a business in the same organization and audits it', async () => {
  const calls: unknown[] = [];
  const tx = { business: { findFirst: async (args: unknown) => { calls.push(args); return { id: 'business-1' }; } }, gstRegistration: { create: async (args: unknown) => { calls.push(args); return registration; } }, auditLog: { create: async (args: unknown) => { calls.push(args); return {}; } } };
  const prisma = { $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx) };
  assert.deepEqual(await createGstRegistrationForOrganization(prisma as never, 'org-1', { businessId: 'business-1', gstin: registration.gstin, legalName: registration.legalName }, 'user-1', 'req-1'), { ...registration, registrationType: 'REGULAR', status: 'ACTIVE' });
  assert.match(JSON.stringify(calls[0]), /org-1/); assert.match(JSON.stringify(calls[1]), /GST_REGISTRATION_CREATED/);
});

test('rejects a cross-tenant business', async () => {
  const tx = { business: { findFirst: async () => null }, gstRegistration: { create: async () => { throw new Error('must not create'); } }, auditLog: { create: async () => { throw new Error('must not audit'); } } };
  const prisma = { $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx) };
  await assert.rejects(() => createGstRegistrationForOrganization(prisma as never, 'org-1', { businessId: 'other', gstin: registration.gstin, legalName: registration.legalName }, 'user-1', 'req-2'), NotFoundException);
});

test('maps duplicate GSTIN to conflict', async () => {
  const tx = { business: { findFirst: async () => ({ id: 'business-1' }) }, gstRegistration: { create: async () => { throw { code: 'P2002' }; } }, auditLog: { create: async () => ({}) } };
  const prisma = { $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx) };
  await assert.rejects(() => createGstRegistrationForOrganization(prisma as never, 'org-1', { businessId: 'business-1', gstin: registration.gstin, legalName: registration.legalName }, 'user-1', 'req-3'), ConflictException);
});

test('normalizes and bounds pagination', () => { assert.equal(normalizeGstRegistrationPageSize(undefined), 20); assert.equal(normalizeGstRegistrationPageSize('100'), 100); assert.throws(() => normalizeGstRegistrationPageSize('0'), BadRequestException); assert.throws(() => normalizeGstRegistrationPageSize('101'), BadRequestException); });
