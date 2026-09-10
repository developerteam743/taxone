export const ACCESS_TOKEN_COOKIE = 'taxone_access';
export const REFRESH_TOKEN_COOKIE = 'taxone_refresh';

export type LoginRequest = { email: string; password: string };

export type LoginResponse = {
  user: { id: string; email: string; name: string };
  organizationId: string | null;
  expiresIn: number;
};

export type MfaLoginResponse = {
  mfaRequired: true;
  challengeToken: string;
  user: LoginResponse['user'];
  organizationId: string | null;
  expiresIn: number;
};

export type MfaChallengeRequest = { challengeToken: string; code: string };
export type AuthValidationError = { field: 'email' | 'password'; message: string };

export function validateLoginRequest(input: unknown): { success: true; data: LoginRequest } | { success: false; errors: AuthValidationError[] } {
  if (!input || typeof input !== 'object') return { success: false, errors: [{ field: 'email', message: 'Request body must be an object' }] };
  const candidate = input as Record<string, unknown>;
  const errors: AuthValidationError[] = [];
  if (typeof candidate.email !== 'string' || candidate.email.trim().length === 0) errors.push({ field: 'email', message: 'Email is required' });
  else if (candidate.email.length > 320) errors.push({ field: 'email', message: 'Email is too long' });
  if (typeof candidate.password !== 'string' || candidate.password.length === 0) errors.push({ field: 'password', message: 'Password is required' });
  else if (candidate.password.length > 1024) errors.push({ field: 'password', message: 'Password is too long' });
  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: { email: (candidate.email as string).trim().toLowerCase(), password: candidate.password as string } };
}

export function validateMfaChallengeRequest(input: unknown): { success: true; data: MfaChallengeRequest } | { success: false; message: string } {
  if (!input || typeof input !== 'object') return { success: false, message: 'Request body must be an object' };
  const candidate = input as Record<string, unknown>;
  if (typeof candidate.challengeToken !== 'string' || candidate.challengeToken.length < 32 || candidate.challengeToken.length > 256) return { success: false, message: 'Challenge token is invalid' };
  if (typeof candidate.code !== 'string' || !/^\d{6}$/.test(candidate.code)) return { success: false, message: 'MFA code must be six digits' };
  return { success: true, data: { challengeToken: candidate.challengeToken, code: candidate.code } };
}
