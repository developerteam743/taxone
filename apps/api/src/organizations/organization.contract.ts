export type CreateOrganizationRequest = { name: string };

export type OrganizationValidationError = { field: 'name'; message: string };

export function validateCreateOrganizationRequest(input: unknown): { success: true; data: CreateOrganizationRequest } | { success: false; errors: OrganizationValidationError[] } {
  if (!input || typeof input !== 'object') return { success: false, errors: [{ field: 'name', message: 'Request body must be an object' }] };
  const candidate = input as Record<string, unknown>;
  if (typeof candidate.name !== 'string' || candidate.name.trim().length === 0) return { success: false, errors: [{ field: 'name', message: 'Organization name is required' }] };
  if (candidate.name.length > 200) return { success: false, errors: [{ field: 'name', message: 'Organization name is too long' }] };
  return { success: true, data: { name: candidate.name.trim() } };
}
