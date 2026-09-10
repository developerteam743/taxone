import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { validateCreateClientRequest, validateUpdateClientRequest } from './client.contract.js';

test('normalizes a valid client payload', () => {
  assert.deepEqual(validateCreateClientRequest({ name: '  Acme  ', email: ' Owner@Acme.Test ', phone: ' +91 9999999999 ', pan: 'abcde1234f' }), { success: true, data: { name: 'Acme', email: 'owner@acme.test', phone: '+91 9999999999', pan: 'ABCDE1234F' } });
});

test('rejects invalid client fields', () => {
  const result = validateCreateClientRequest({ name: '', email: 'bad', phone: 'x', pan: 'bad' });
  assert.equal(result.success, false);
  if (!result.success) assert.deepEqual(result.errors.map((error) => error.field), ['name', 'email', 'phone', 'pan']);
});

test('supports partial PATCH payloads but rejects an empty patch', () => {
  assert.deepEqual(validateUpdateClientRequest({ phone: '+919999999999' }), { success: true, data: { phone: '+919999999999' } });
  const result = validateUpdateClientRequest({});
  assert.equal(result.success, false);
});

test('rejects non-object input', () => { const result = validateCreateClientRequest(null); assert.equal(result.success, false); assert.throws(() => { throw new BadRequestException(result); }, BadRequestException); });
