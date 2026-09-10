import assert from 'node:assert/strict';
import test from 'node:test';
import { decryptMfaSecret, encryptMfaSecret } from './mfa-crypto.js';

const originalKey = process.env.MFA_ENCRYPTION_KEY;
const testKey = Buffer.alloc(32, 7).toString('base64url');

test.before(() => { process.env.MFA_ENCRYPTION_KEY = testKey; });
test.after(() => {
  if (originalKey === undefined) delete process.env.MFA_ENCRYPTION_KEY;
  else process.env.MFA_ENCRYPTION_KEY = originalKey;
});

test('encrypts and decrypts MFA secrets without storing plaintext', () => {
  const secret = 'JBSWY3DPEHPK3PXP';
  const encrypted = encryptMfaSecret(secret);
  assert.notEqual(encrypted, secret);
  assert.equal(decryptMfaSecret(encrypted), secret);
  assert.equal(encryptMfaSecret(secret) === encrypted, false);
});

test('rejects missing or malformed encryption keys', () => {
  process.env.MFA_ENCRYPTION_KEY = Buffer.alloc(31, 1).toString('base64url');
  assert.throws(() => encryptMfaSecret('secret'));
  process.env.MFA_ENCRYPTION_KEY = testKey;
  assert.throws(() => decryptMfaSecret('bad-payload'));
});
