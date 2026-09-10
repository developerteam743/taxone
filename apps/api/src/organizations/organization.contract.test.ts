import assert from 'node:assert/strict';
import test from 'node:test';
import { validateCreateOrganizationRequest } from './organization.contract.js';

test('validates and normalizes an organization name', () => {
  assert.deepEqual(validateCreateOrganizationRequest({ name: '  TaxOne Firm  ' }), { success: true, data: { name: 'TaxOne Firm' } });
});

test('rejects missing organization names', () => {
  const result = validateCreateOrganizationRequest({});
  assert.equal(result.success, false);
});

test('rejects organization names over the maximum length', () => {
  const result = validateCreateOrganizationRequest({ name: 'x'.repeat(201) });
  assert.deepEqual(result, { success: false, errors: [{ field: 'name', message: 'Organization name is too long' }] });
});
