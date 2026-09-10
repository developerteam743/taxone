import assert from 'node:assert/strict';
import test from 'node:test';
import { validateCreateOrganizationInvitationRequest, validateCreateOrganizationRequest, validateUpdateOrganizationRequest } from './organization.contract.js';

test('validates and normalizes an organization name', () => {
  assert.deepEqual(validateCreateOrganizationRequest({ name: '  TaxOne Firm  ' }), { success: true, data: { name: 'TaxOne Firm' } });
});

test('rejects missing organization names', () => {
  assert.equal(validateCreateOrganizationRequest({}).success, false);
});

test('rejects organization names over the maximum length', () => {
  assert.deepEqual(validateCreateOrganizationRequest({ name: 'x'.repeat(201) }), { success: false, errors: [{ field: 'name', message: 'Organization name is too long' }] });
});

test('validates and normalizes organization update names', () => {
  assert.deepEqual(validateUpdateOrganizationRequest({ name: '  Updated Firm  ' }), { success: true, data: { name: 'Updated Firm' } });
});

test('rejects malformed organization update input', () => {
  assert.deepEqual(validateUpdateOrganizationRequest({ name: ' ' }), { success: false, errors: [{ field: 'name', message: 'Organization name is required' }] });
});

test('validates and normalizes organization invitation email and role', () => {
  assert.deepEqual(validateCreateOrganizationInvitationRequest({ email: '  Invitee@Example.Test ', role: 'CA' }), { success: true, data: { email: 'invitee@example.test', role: 'CA' } });
  assert.deepEqual(validateCreateOrganizationInvitationRequest({ email: 'member@example.test' }), { success: true, data: { email: 'member@example.test', role: 'MEMBER' } });
});

test('rejects malformed organization invitation input', () => {
  const result = validateCreateOrganizationInvitationRequest({ email: 'not-an-email', role: 'OWNER' });
  assert.deepEqual(result, { success: false, errors: [{ field: 'email', message: 'Email is invalid' }, { field: 'role', message: 'Role is invalid' }] });
});
