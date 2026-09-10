import assert from 'node:assert/strict';
import test from 'node:test';
import { apiError } from './api-error.js';

test('apiError returns a stable machine-readable shape', () => {
  assert.deepEqual(apiError('VALIDATION_ERROR', 'Request validation failed.', 'req-123'), {
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed.',
    requestId: 'req-123',
  });
});

test('apiError preserves structured details when supplied', () => {
  assert.deepEqual(apiError('VALIDATION_ERROR', 'Request validation failed.', 'req-123', {
    path: '/api/v1/example',
    issues: ['field is required'],
  }), {
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed.',
    requestId: 'req-123',
    details: { path: '/api/v1/example', issues: ['field is required'] },
  });
});
