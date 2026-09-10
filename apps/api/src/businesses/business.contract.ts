export type CreateBusinessRequest = { clientId: string; name: string; tradeName?: string; pan?: string; gstin?: string };
export type UpdateBusinessRequest = { name?: string; tradeName?: string; pan?: string; gstin?: string };
export type BusinessValidationError = { field: 'clientId' | 'name' | 'tradeName' | 'pan' | 'gstin'; message: string };

function optionalString(candidate: Record<string, unknown>, field: 'tradeName' | 'pan' | 'gstin', maxLength: number, pattern?: RegExp): BusinessValidationError | undefined {
  const value = candidate[field];
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim().length === 0) return { field, message: `${field} must be a non-empty string` };
  if (value.length > maxLength) return { field, message: `${field} is too long` };
  if (pattern && !pattern.test(value.trim())) return { field, message: `${field} is invalid` };
  return undefined;
}

function validateFields(input: unknown, requireClientId: boolean, requireName: boolean): { success: true; data: CreateBusinessRequest | UpdateBusinessRequest } | { success: false; errors: BusinessValidationError[] } {
  if (!input || typeof input !== 'object') return { success: false, errors: [{ field: 'name', message: 'Request body must be an object' }] };
  const candidate = input as Record<string, unknown>;
  const errors: BusinessValidationError[] = [];
  if (requireClientId && (typeof candidate.clientId !== 'string' || candidate.clientId.trim().length === 0)) errors.push({ field: 'clientId', message: 'Client ID is required' });
  else if (candidate.clientId !== undefined && (typeof candidate.clientId !== 'string' || candidate.clientId.trim().length === 0)) errors.push({ field: 'clientId', message: 'Client ID must be a non-empty string' });
  if (requireName && (typeof candidate.name !== 'string' || candidate.name.trim().length === 0)) errors.push({ field: 'name', message: 'Business name is required' });
  else if (candidate.name !== undefined && (typeof candidate.name !== 'string' || candidate.name.trim().length === 0)) errors.push({ field: 'name', message: 'Business name must be a non-empty string' });
  else if (typeof candidate.name === 'string' && candidate.name.length > 200) errors.push({ field: 'name', message: 'Business name is too long' });
  if (typeof candidate.tradeName === 'string' && candidate.tradeName.length > 200) errors.push({ field: 'tradeName', message: 'tradeName is too long' });
  const tradeNameError = optionalString(candidate, 'tradeName', 200);
  const panError = optionalString(candidate, 'pan', 10, /^[A-Za-z]{5}\d{4}[A-Za-z]$/);
  const gstinError = optionalString(candidate, 'gstin', 15, /^[0-9]{2}[A-Za-z0-9]{13}$/);
  if (tradeNameError) errors.push(tradeNameError);
  if (panError) errors.push({ ...panError, message: panError.message === 'pan is invalid' ? 'PAN is invalid' : panError.message });
  if (gstinError) errors.push({ ...gstinError, message: gstinError.message === 'gstin is invalid' ? 'GSTIN is invalid' : gstinError.message });
  if (!requireName && candidate.name === undefined && candidate.tradeName === undefined && candidate.pan === undefined && candidate.gstin === undefined) errors.push({ field: 'name', message: 'At least one business field is required' });
  if (errors.length) return { success: false, errors };
  return { success: true, data: {
    ...(candidate.clientId !== undefined ? { clientId: (candidate.clientId as string).trim() } : {}),
    ...(candidate.name !== undefined ? { name: (candidate.name as string).trim() } : {}),
    ...(candidate.tradeName !== undefined ? { tradeName: (candidate.tradeName as string).trim() } : {}),
    ...(candidate.pan !== undefined ? { pan: (candidate.pan as string).trim().toUpperCase() } : {}),
    ...(candidate.gstin !== undefined ? { gstin: (candidate.gstin as string).trim().toUpperCase() } : {}),
  } as CreateBusinessRequest | UpdateBusinessRequest };
}

export function validateCreateBusinessRequest(input: unknown): { success: true; data: CreateBusinessRequest } | { success: false; errors: BusinessValidationError[] } {
  const result = validateFields(input, true, true);
  return result.success ? { success: true, data: result.data as CreateBusinessRequest } : result;
}

export function validateUpdateBusinessRequest(input: unknown): { success: true; data: UpdateBusinessRequest } | { success: false; errors: BusinessValidationError[] } {
  const result = validateFields(input, false, false);
  return result.success ? { success: true, data: result.data as UpdateBusinessRequest } : result;
}
