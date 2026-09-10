import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword } from './password.js';

test('passwords use Argon2id and verify correctly', async () => {
  const hash = await hashPassword('correct horse battery staple');
  assert.match(hash, /^\$argon2id\$/);
  assert.equal(await verifyPassword('correct horse battery staple', hash), true);
  assert.equal(await verifyPassword('wrong password', hash), false);
});

test('password hashing rejects unsafe lengths', async () => {
  await assert.rejects(() => hashPassword('short'), RangeError);
  await assert.rejects(() => hashPassword('x'.repeat(257)), RangeError);
});

test('password verification fails closed for malformed hashes', async () => {
  assert.equal(await verifyPassword('anything', 'not-a-password-hash'), false);
});
