import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  createOpaqueToken,
  expiresAtFromSeconds,
  hashToken,
} from './session-token.js';

test('opaque tokens are high-entropy URL-safe values', () => {
  const token = createOpaqueToken();
  assert.equal(token.length >= 43, true);
  assert.match(token, /^[A-Za-z0-9_-]+$/);
  assert.equal(hashToken(token), hashToken(token));
  assert.notEqual(hashToken(token), hashToken(createOpaqueToken()));
});

test('token lifetime constants and expiry calculation are deterministic', () => {
  const now = new Date('2026-09-10T00:00:00.000Z');
  assert.equal(ACCESS_TOKEN_TTL_SECONDS, 900);
  assert.equal(REFRESH_TOKEN_TTL_SECONDS, 2_592_000);
  assert.equal(
    expiresAtFromSeconds(900, now).toISOString(),
    '2026-09-10T00:15:00.000Z',
  );
});

test('token byte length is bounded', () => {
  assert.throws(() => createOpaqueToken(31), RangeError);
  assert.throws(() => createOpaqueToken(129), RangeError);
});
