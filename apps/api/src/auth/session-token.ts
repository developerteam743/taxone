import { createHash, randomBytes } from 'node:crypto';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export function createOpaqueToken(byteLength = 32): string {
  if (!Number.isInteger(byteLength) || byteLength < 32 || byteLength > 128) {
    throw new RangeError('Token byte length must be between 32 and 128');
  }
  return randomBytes(byteLength).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function expiresAtFromSeconds(seconds: number, now = new Date()): Date {
  if (!Number.isInteger(seconds) || seconds <= 0) {
    throw new RangeError('Token lifetime must be a positive integer');
  }
  return new Date(now.getTime() + seconds * 1000);
}
