import assert from 'node:assert/strict';
import test from 'node:test';
import { validateLoginRequest } from './auth-contract.js';

test('login validation normalizes email and preserves password', () => {
  const result = validateLoginRequest({ email: '  User@Example.COM ', password: 'secret' });

  assert.deepEqual(result, {
    success: true,
    data: { email: 'user@example.com', password: 'secret' },
  });
});

test('login validation rejects missing credentials', () => {
  const result = validateLoginRequest({});

  assert.equal(result.success, false);
  if (!result.success) {
    assert.deepEqual(result.errors, [
      { field: 'email', message: 'Email is required' },
      { field: 'password', message: 'Password is required' },
    ]);
  }
});

test('login validation rejects oversized credentials', () => {
  const result = validateLoginRequest({ email: `${'a'.repeat(321)}@example.com`, password: 'x'.repeat(1025) });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.deepEqual(result.errors, [
      { field: 'email', message: 'Email is too long' },
      { field: 'password', message: 'Password is too long' },
    ]);
  }
});

test('login validation rejects non-object input', () => {
  const result = validateLoginRequest(null);

  assert.deepEqual(result, {
    success: false,
    errors: [{ field: 'email', message: 'Request body must be an object' }],
  });
});
