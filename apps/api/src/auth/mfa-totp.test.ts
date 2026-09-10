import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildTotpUri,
  generateTotpCode,
  generateTotpSecret,
  verifyTotpCode,
} from './mfa-totp.js';

const RFC_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

const rfcVectors = [
  [59_000, '94287082'],
  [1_111_111_106_000, '07081804'],
  [1_111_111_111_000, '14050471'],
  [1_234_567_890_000, '89005924'],
  [2_000_000_000_000, '69279037'],
  [2_000_000_000_000_000_000, '65353130'],
] as const;

test('generates RFC 6238 SHA-1 vectors with six digits', () => {
  for (const [timestamp, expectedEightDigitCode] of rfcVectors) {
    const code = generateTotpCode(RFC_SECRET, timestamp).slice(-6);
    assert.equal(code, expectedEightDigitCode.slice(-6));
  }
});

test('accepts the current TOTP step and one adjacent step', () => {
  const timestamp = 1_700_000_000_000;
  const current = generateTotpCode(RFC_SECRET, timestamp);
  const previous = generateTotpCode(RFC_SECRET, timestamp - 30_000);
  const next = generateTotpCode(RFC_SECRET, timestamp + 30_000);

  assert.equal(verifyTotpCode(RFC_SECRET, current, timestamp), true);
  assert.equal(verifyTotpCode(RFC_SECRET, previous, timestamp), true);
  assert.equal(verifyTotpCode(RFC_SECRET, next, timestamp), true);
  assert.equal(verifyTotpCode(RFC_SECRET, generateTotpCode(RFC_SECRET, timestamp + 60_000), timestamp), false);
});

test('rejects malformed codes and secrets', () => {
  assert.equal(verifyTotpCode(RFC_SECRET, '12345', 59_000), false);
  assert.equal(verifyTotpCode(RFC_SECRET, '1234567', 59_000), false);
  assert.equal(verifyTotpCode('not-a-secret', '123456', 59_000), false);
  assert.throws(() => generateTotpCode('not-a-secret', 59_000));
});

test('generates valid high-entropy base32 secrets', () => {
  const secret = generateTotpSecret();
  assert.match(secret, /^[A-Z2-7]{32}$/);
  assert.equal(new Set(secret).size > 1, true);
});

test('builds standards-compatible otpauth URI', () => {
  const uri = buildTotpUri(RFC_SECRET, 'user@example.com', 'TaxOne');
  assert.equal(
    uri,
    'otpauth://totp/TaxOne%3Auser%40example.com?secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ&issuer=TaxOne&algorithm=SHA1&digits=6&period=30',
  );
});
