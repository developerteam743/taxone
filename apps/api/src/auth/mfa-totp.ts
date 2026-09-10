import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const TOTP_DIGITS = 6;
export const TOTP_PERIOD_SECONDS = 30;
export const TOTP_WINDOW_STEPS = 1;
export const TOTP_SECRET_BYTES = 20;

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateTotpSecret(): string {
  return encodeBase32(randomBytes(TOTP_SECRET_BYTES));
}

export function buildTotpUri(secret: string, accountName: string, issuer: string): string {
  const normalizedSecret = normalizeSecret(secret);
  if (!isValidBase32(normalizedSecret)) {
    throw new Error('Invalid TOTP secret');
  }
  if (!accountName.trim() || !issuer.trim()) {
    throw new Error('TOTP account name and issuer are required');
  }

  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${normalizedSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD_SECONDS}`;
}

export function generateTotpCode(secret: string, timestampMs = Date.now()): string {
  const normalizedSecret = normalizeSecret(secret);
  const key = decodeBase32(normalizedSecret);
  if (key.length === 0) {
    throw new Error('Invalid TOTP secret');
  }
  if (!Number.isFinite(timestampMs) || timestampMs < 0) {
    throw new RangeError('Timestamp must be a non-negative finite number');
  }

  const counter = Math.floor(timestampMs / 1000 / TOTP_PERIOD_SECONDS);
  return generateCodeForCounter(key, counter);
}

export function verifyTotpCode(
  secret: string,
  code: string,
  timestampMs = Date.now(),
  windowSteps = TOTP_WINDOW_STEPS,
): boolean {
  if (!/^\d{6}$/.test(code) || !Number.isInteger(windowSteps) || windowSteps < 0 || windowSteps > 5) {
    return false;
  }

  const normalizedSecret = normalizeSecret(secret);
  let key: Buffer;
  try {
    key = decodeBase32(normalizedSecret);
  } catch {
    return false;
  }
  if (key.length === 0 || !Number.isFinite(timestampMs) || timestampMs < 0) {
    return false;
  }

  const counter = Math.floor(timestampMs / 1000 / TOTP_PERIOD_SECONDS);
  for (let offset = -windowSteps; offset <= windowSteps; offset += 1) {
    const candidate = generateCodeForCounter(key, counter + offset);
    const expected = Buffer.from(candidate, 'ascii');
    const supplied = Buffer.from(code, 'ascii');
    if (expected.length === supplied.length && timingSafeEqual(expected, supplied)) {
      return true;
    }
  }
  return false;
}

function generateCodeForCounter(key: Buffer, counter: number): string {
  if (!Number.isSafeInteger(counter) || counter < 0) {
    throw new RangeError('TOTP counter must be a non-negative safe integer');
  }

  const message = Buffer.allocUnsafe(8);
  message.writeBigInt64BE(BigInt(counter), 0);
  const digest = createHmac('sha1', key).update(message).digest();
  const offset = digest[digest.length - 1]! & 0x0f;
  const binary = ((digest[offset]! & 0x7f) << 24)
    | ((digest[offset + 1]! & 0xff) << 16)
    | ((digest[offset + 2]! & 0xff) << 8)
    | (digest[offset + 3]! & 0xff);
  return String(binary % 1_000_000).padStart(TOTP_DIGITS, '0');
}

function normalizeSecret(secret: string): string {
  return secret.replace(/\s+/g, '').replace(/=+$/g, '').toUpperCase();
}

function isValidBase32(secret: string): boolean {
  return /^[A-Z2-7]+$/.test(secret) && secret.length >= 16;
}

function encodeBase32(input: Buffer): string {
  let output = '';
  let buffer = 0;
  let bits = 0;
  for (const byte of input) {
    buffer = (buffer * 256) + byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += BASE32_ALPHABET[Math.floor(buffer / (2 ** bits)) & 31];
      buffer %= 2 ** bits;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(buffer * (2 ** (5 - bits))) & 31];
  }
  return output;
}

function decodeBase32(input: string): Buffer {
  if (!isValidBase32(input)) {
    throw new Error('Invalid TOTP secret');
  }

  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const character of input) {
    const value = BASE32_ALPHABET.indexOf(character);
    if (value < 0) throw new Error('Invalid TOTP secret');
    buffer = (buffer * 32) + value;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push(Math.floor(buffer / (2 ** bits)) & 0xff);
      buffer %= 2 ** bits;
    }
  }
  return Buffer.from(bytes);
}
