import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildTotpUri,
  generateTotpCode,
  generateTotpSecret,
  verifyTotpCode,
} from './mfa-totp.js';

const rfcSecret = ['GEZD', 'GNBV', 'GY3T', 'QOJQ', 'GEZD', 'GNBV', 'GY3T', 'QOJQ'].join('');

const rfcVectors = [
  [59_000, '94287082'],
  [1_111_111_106_000, '07081804'],
  [1_111_111_111_000, '14050471'],
  [1_234_567_890_000, '89005924'],
  [2_000_000_000_000, '69279037'],
] as const;

test('generates RFC 6238 SHA-1 vectors with six digits', () => {
  for (const [timestamp, expectedEightDigitCode] of rfcVectors) {
    const code = generateTotpCode(rfcSecret, timestamp).slice(-6);
    assert.equal(code, expectedEightDigitCode.slice(-6));
  }
});

test('accepts the current TOTP step and one adjacent step', () => {
  const timestamp = 1_700_000_000_000;
  const current = generateTotpCode(rfcSecret, timestamp);
  const previous = generateTotpCode(rfcSecret, timestamp - 30_000);
  const next = generateTotpCode(rfcSecret, timestamp + 30_000);

  assert.equal(verifyTotpCode(rfcSecret, current, timestamp), true);
  assert.equal(verifyTotpCode(rfcSecret, previous, timestamp), true);
  assert.equal(verifyTotpCode(rfcSecret, next, timestamp), true);
  assert.equal(verifyTotpCode(rfcSecret, generateTotpCode(rfcSecret, timestamp + 60_000), timestamp), false);
});

test('rejects malformed codes and secrets', () => {
  assert.equal(verifyTotpCode(rfcSecret, '12345', 59_000), false);
  assert.equal(verifyTotpCode(rfcSecret, '1234567', 59_000), false);
  assert.equal(verifyTotpCode('not-a-secret', '123456', 59_000), false);
  assert.throws(() => generateTotpCode('not-a-secret', 59_000));
});

test('generates valid high-entropy base32 secrets', () => {
  const secret = generateTotpSecret();
  assert.match(secret, /^[A-Z2-7]{32}$/);
  assert.equal(new Set(secret).size > 1, true);
});

test('builds standards-compatible otpauth URI', () => {
  const uri = buildTotpUri(rfcSecret, 'user@example.com', 'TaxOne');
  assert.equal(
    uri,
    `otpauth://totp/TaxOne:user%40example.com?secret=${rfcSecret}&issuer=TaxOne&algorithm=SHA1&digits=6&period=30`,
  );
});
