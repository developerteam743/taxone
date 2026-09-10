import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { apiError } from './api-error.js';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const requestId = response.getHeader('x-request-id')?.toString() ?? 'unknown';

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const details = typeof exceptionResponse === 'object' && exceptionResponse !== null
      ? exceptionResponse as Record<string, unknown>
      : undefined;

    const message = status >= 500
      ? 'An unexpected error occurred.'
      : typeof exceptionResponse === 'string'
        ? exceptionResponse
        : Array.isArray(details?.message)
          ? 'Request validation failed.'
          : typeof details?.message === 'string'
            ? details.message
            : 'Request failed.';

    response.status(status).json(apiError(
      status >= 500 ? 'INTERNAL_ERROR' : `HTTP_${status}`,
      message,
      requestId,
      status < 500 && details?.message !== undefined ? { path: request.url, issues: details.message } : undefined,
    ));
  }
}
