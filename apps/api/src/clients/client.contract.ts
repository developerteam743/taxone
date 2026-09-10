export type CreateClientRequest = { name: string; email?: string; phone?: string; pan?: string };
export type UpdateClientRequest = CreateClientRequest;
export type ClientValidationError = { field: 'name' | 'email' | 'phone' | 'pan'; message: string };

function optionalString(candidate: Record<string, unknown>, field: 'email' | 'phone' | 'pan', maxLength: number, pattern?: RegExp): ClientValidationError | undefined {
  const value = candidate[field];
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim().length === 0) return { field, message: `${field} must be a non-empty string` };
  if (value.length > maxLength) return { field, message: `${field} is too long` };
  if (pattern && !pattern.test(value.trim())) return { field, message: `${field} is invalid` };
  return undefined;
}

function validateClient(input: unknown): { success: true; data: CreateClientRequest } | { success: false; errors: ClientValidationError[] } {
  if (!input || typeof input !== 'object') return { success: false, errors: [{ field: 'name', message: 'Request body must be an object' }] };
  const candidate = input as Record<string, unknown>;
  const errors: ClientValidationError[] = [];
  if (typeof candidate.name !== 'string' || candidate.name.trim().length === 0) errors.push({ field: 'name', message: 'Client name is required' });
  else if (candidate.name.length > 200) errors.push({ field: 'name', message: 'Client name is too long' });
  const emailError = optionalString(candidate, 'email', 320, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  const phoneError = optionalString(candidate, 'phone', 32, /^[+()\-\s\d.]{7,32}$/);
  const panError = optionalString(candidate, 'pan', 10, /^[A-Za-z]{5}\d{4}[A-Za-z]$/);
  if (emailError) errors.push({ ...emailError, message: emailError.field === 'email' && emailError.message === 'email is invalid' ? 'Email is invalid' : emailError.message });
  if (phoneError) errors.push(phoneError);
  if (panError) errors.push({ ...panError, message: panError.message === 'pan is invalid' ? 'PAN is invalid' : panError.message });
  if (errors.length) return { success: false, errors };
  return { success: true, data: {
    name: (candidate.name as string).trim(),
    ...(candidate.email !== undefined ? { email: (candidate.email as string).trim().toLowerCase() } : {}),
    ...(candidate.phone !== undefined ? { phone: (candidate.phone as string).trim() } : {}),
    ...(candidate.pan !== undefined ? { pan: (candidate.pan as string).trim().toUpperCase() } : {}),
  } };
}

export function validateCreateClientRequest(input: unknown) { return validateClient(input); }
export function validateUpdateClientRequest(input: unknown) { return validateClient(input); }
