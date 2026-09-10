export type CreateOrganizationRequest = { name: string };
export type UpdateOrganizationRequest = { name: string };

export type OrganizationValidationError = { field: 'name'; message: string };

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
