export type CreateOrganizationRequest = { name: string };
export type UpdateOrganizationRequest = { name: string };
export type CreateOrganizationInvitationRequest = { email: string; role?: 'ADMIN' | 'CA' | 'MEMBER' | 'CLIENT' };

export type OrganizationValidationError = { field: 'name'; message: string };
export type OrganizationInvitationValidationError = { field: 'email' | 'role'; message: string };

function validateOrganizationName(input: unknown): { success: true; name: string } | { success: false; errors: OrganizationValidationError[] } {
  if (typeof input !== 'string' || input.trim().length === 0) return { success: false, errors: [{ field: 'name', message: 'Organization name is required' }] };
  if (input.length > 200) return { success: false, errors: [{ field: 'name', message: 'Organization name is too long' }] };
  return { success: true, name: input.trim() };
}

export function validateCreateOrganizationRequest(input: unknown): { success: true; data: CreateOrganizationRequest } | { success: false; errors: OrganizationValidationError[] } {
  if (!input || typeof input !== 'object') return { success: false, errors: [{ field: 'name', message: 'Request body must be an object' }] };
  const candidate = input as Record<string, unknown>;
  const validation = validateOrganizationName(candidate.name);
  return validation.success ? { success: true, data: { name: validation.name } } : validation;
}

export function validateUpdateOrganizationRequest(input: unknown): { success: true; data: UpdateOrganizationRequest } | { success: false; errors: OrganizationValidationError[] } {
  if (!input || typeof input !== 'object') return { success: false, errors: [{ field: 'name', message: 'Request body must be an object' }] };
  const candidate = input as Record<string, unknown>;
  const validation = validateOrganizationName(candidate.name);
  return validation.success ? { success: true, data: { name: validation.name } } : validation;
}

export function validateCreateOrganizationInvitationRequest(input: unknown): { success: true; data: CreateOrganizationInvitationRequest } | { success: false; errors: OrganizationInvitationValidationError[] } {
  if (!input || typeof input !== 'object') return { success: false, errors: [{ field: 'email', message: 'Request body must be an object' }] };
  const candidate = input as Record<string, unknown>;
  const errors: OrganizationInvitationValidationError[] = [];
  if (typeof candidate.email !== 'string' || candidate.email.trim().length === 0) errors.push({ field: 'email', message: 'Email is required' });
  else if (candidate.email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email.trim())) errors.push({ field: 'email', message: 'Email is invalid' });
  if (candidate.role !== undefined && (typeof candidate.role !== 'string' || !['ADMIN', 'CA', 'MEMBER', 'CLIENT'].includes(candidate.role))) errors.push({ field: 'role', message: 'Role is invalid' });
  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: { email: (candidate.email as string).trim().toLowerCase(), role: (candidate.role as CreateOrganizationInvitationRequest['role']) ?? 'MEMBER' } };
}
