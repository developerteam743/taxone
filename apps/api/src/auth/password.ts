import argon2 from 'argon2';

const ARGON2_MEMORY_COST_KIB = 19_456;
const ARGON2_TIME_COST = 2;
const ARGON2_PARALLELISM = 1;

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 256) {
    throw new RangeError('Password must be between 12 and 256 characters');
  }

  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: ARGON2_MEMORY_COST_KIB,
    timeCost: ARGON2_TIME_COST,
    parallelism: ARGON2_PARALLELISM,
  });
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  if (password.length < 1 || password.length > 256 || !passwordHash.startsWith('$argon2id$')) {
    return false;
  }

  try {
    return await argon2.verify(passwordHash, password);
  } catch {
    return false;
  }
}
