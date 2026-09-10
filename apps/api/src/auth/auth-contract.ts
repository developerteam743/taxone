export const ACCESS_TOKEN_COOKIE = 'taxone_access';
export const REFRESH_TOKEN_COOKIE = 'taxone_refresh';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  organizationId: string | null;
  expiresIn: number;
};

export type AuthValidationError = {
  field: 'email' | 'password';
  message: string;
};

export function validateLoginRequest(input: unknown): {
  success: true;
  data: LoginRequest;
} | {
  success: false;
  errors: AuthValidationError[];
} {
  if (!input || typeof input !== 'object') {
    return { success: false, errors: [{ field: 'email', message: 'Request body must be an object' }] };
  }

  const candidate = input as Record<string, unknown>;
  const errors: AuthValidationError[] = [];

  if (typeof candidate.email !== 'string' || candidate.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (candidate.email.length > 320) {
    errors.push({ field: 'email', message: 'Email is too long' });
  }

  if (typeof candidate.password !== 'string' || candidate.password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (candidate.password.length > 1024) {
    errors.push({ field: 'password', message: 'Password is too long' });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const email = candidate.email as string;
  const password = candidate.password as string;

  return {
    success: true,
    data: {
      email: email.trim().toLowerCase(),
      password,
    },
  };
}
