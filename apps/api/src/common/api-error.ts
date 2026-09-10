export type ApiError = {
  code: string;
  message: string;
  requestId: string;
  details?: Record<string, unknown>;
};

export function apiError(
  code: string,
  message: string,
  requestId: string,
  details?: Record<string, unknown>,
): ApiError {
  return details === undefined ? { code, message, requestId } : { code, message, requestId, details };
}
