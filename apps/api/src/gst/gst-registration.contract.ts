export type CreateGstRegistrationRequest = {
  businessId: string;
  gstin: string;
  legalName: string;
  registrationType?: string;
  status?: string;
  effectiveFrom?: string;
};

export type GstRegistrationValidationError = { field: 'businessId' | 'gstin' | 'legalName' | 'registrationType' | 'status' | 'effectiveFrom'; message: string };

const GSTIN_PATTERN = /^[0-9]{2}[A-Z0-9]{13}$/;

export function validateCreateGstRegistrationRequest(input: unknown): { success: true; data: CreateGstRegistrationRequest } | { success: false; errors: GstRegistrationValidationError[] } {
  if (!input || typeof input !== 'object') return { success: false, errors: [{ field: 'businessId', message: 'Request body must be an object' }] };
  const candidate = input as Record<string, unknown>;
  const errors: GstRegistrationValidationError[] = [];
  if (typeof candidate.businessId !== 'string' || candidate.businessId.trim().length === 0 || candidate.businessId.length > 128) errors.push({ field: 'businessId', message: 'Business ID is required' });
  if (typeof candidate.gstin !== 'string' || candidate.gstin.trim().length !== 15 || !GSTIN_PATTERN.test(candidate.gstin.trim().toUpperCase())) errors.push({ field: 'gstin', message: 'GSTIN is invalid' });
  if (typeof candidate.legalName !== 'string' || candidate.legalName.trim().length === 0 || candidate.legalName.length > 200) errors.push({ field: 'legalName', message: 'Legal name is required and must be at most 200 characters' });
  for (const field of ['registrationType', 'status'] as const) {
    if (candidate[field] !== undefined && (typeof candidate[field] !== 'string' || candidate[field].trim().length === 0 || candidate[field].length > 64)) errors.push({ field, message: `${field} must be a non-empty string of at most 64 characters` });
  }
  if (candidate.effectiveFrom !== undefined) {
    if (typeof candidate.effectiveFrom !== 'string' || Number.isNaN(Date.parse(candidate.effectiveFrom))) errors.push({ field: 'effectiveFrom', message: 'effectiveFrom must be a valid ISO date' });
  }
  if (errors.length) return { success: false, errors };
  return { success: true, data: {
    businessId: (candidate.businessId as string).trim(),
    gstin: (candidate.gstin as string).trim().toUpperCase(),
    legalName: (candidate.legalName as string).trim(),
    ...(candidate.registrationType !== undefined ? { registrationType: (candidate.registrationType as string).trim().toUpperCase() } : {}),
    ...(candidate.status !== undefined ? { status: (candidate.status as string).trim().toUpperCase() } : {}),
    ...(candidate.effectiveFrom !== undefined ? { effectiveFrom: new Date(candidate.effectiveFrom as string).toISOString() } : {}),
  } };
}
