import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const KEY_BYTES = 32;

function encryptionKey(): Buffer {
  const encoded = process.env.MFA_ENCRYPTION_KEY;
  if (!encoded) throw new Error('MFA_ENCRYPTION_KEY is required for MFA secret encryption');
  const key = Buffer.from(encoded, 'base64url');
  if (key.length !== KEY_BYTES) throw new Error('MFA_ENCRYPTION_KEY must encode exactly 32 bytes');
  return key;
}

export function encryptMfaSecret(secret: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString('base64url')).join('.');
}

export function decryptMfaSecret(payload: string): string {
  const parts = payload.split('.');
  if (parts.length !== 3) throw new Error('Invalid encrypted MFA secret');
  const [ivEncoded, tagEncoded, ciphertextEncoded] = parts;
  const iv = Buffer.from(ivEncoded!, 'base64url');
  const tag = Buffer.from(tagEncoded!, 'base64url');
  const ciphertext = Buffer.from(ciphertextEncoded!, 'base64url');
  if (iv.length !== IV_BYTES || tag.length !== 16 || ciphertext.length === 0) {
    throw new Error('Invalid encrypted MFA secret');
  }
  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
