import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller.js';

function makeResponse(cookieHeader?: string) {
  const cookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  const cleared: Array<{ name: string; options: Record<string, unknown> }> = [];
  const response = {
    req: {
      headers: {
        ...(cookieHeader !== undefined ? { cookie: cookieHeader } : {}),
        'x-forwarded-for': '203.0.113.10',
      },
      socket: { remoteAddress: '127.0.0.1' },
    },
    cookie(name: string, value: string, options: Record<string, unknown>) { cookies.push({ name, value, options }); },
    clearCookie(name: string, options: Record<string, unknown>) { cleared.push({ name, options }); },
  };
  return { response, cookies, cleared };
}

function controller(mfa: Record<string, unknown> = {}) {
  return new AuthController({} as never, mfa as never);
}

test('logout revokes the refresh family and clears both auth cookies', async () => {
  const calls: Array<{ token: string | undefined; requestId: string; userAgent?: string; ipHash?: string }> = [];
  const service = {
    logout: async (token: string | undefined, requestMetadata: { requestId: string; userAgent?: string; ipHash?: string }) => { calls.push({ token, ...requestMetadata }); },
  };
  const authController = new AuthController(service as never, {} as never);
  const { response, cleared } = makeResponse('other=value; taxone_refresh=refresh-token-value');

  const result = await authController.logout('req-test', 'test-agent', response as never);

  assert.equal(result, undefined);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.token, 'refresh-token-value');
  assert.equal(calls[0]?.requestId, 'req-test');
  assert.equal(calls[0]?.userAgent, 'test-agent');
  assert.equal(typeof calls[0]?.ipHash, 'string');
  assert.equal(calls[0]?.ipHash?.length, 64);
  assert.equal(cleared.length, 2);
});

test('logout clears cookies even when no refresh cookie is present', async () => {
  const calls: Array<string | undefined> = [];
  const service = { logout: async (token: string | undefined) => { calls.push(token); } };
  const authController = new AuthController(service as never, {} as never);
  const { response, cleared } = makeResponse();

  await authController.logout(undefined, undefined, response as never);

  assert.deepEqual(calls, [undefined]);
  assert.equal(cleared.length, 2);
});

test('logout treats a malformed refresh cookie as absent and still clears cookies', async () => {
  const calls: Array<string | undefined> = [];
  const service = { logout: async (token: string | undefined) => { calls.push(token); } };
  const authController = new AuthController(service as never, {} as never);
  const { response, cleared } = makeResponse('taxone_refresh=%E0%A4%A');

  await authController.logout('req-test', 'test-agent', response as never);

  assert.deepEqual(calls, [undefined]);
  assert.equal(cleared.length, 2);
});

test('MFA enrollment uses the authenticated user context', async () => {
  const calls: string[] = [];
  const authController = controller({ beginEnrollment: async (userId: string) => { calls.push(userId); return { secret: 'secret', otpauthUri: 'otpauth://totp/TaxOne:test', recoveryCodes: ['CODE'] }; } });
  const request = { user: { userId: 'authenticated-user', organizationId: 'org-1', sessionId: 'session-1' } };

  const result = await authController.beginMfaEnrollment(request as never);

  assert.deepEqual(calls, ['authenticated-user']);
  assert.equal(result.recoveryCodes[0], 'CODE');
});

test('MFA enrollment confirmation uses the authenticated user context and request metadata', async () => {
  const calls: Array<{ userId: string; code: string; requestId: string; userAgent?: string }> = [];
  const authController = controller({ confirmEnrollment: async (userId: string, code: string, metadata: { requestId: string; userAgent?: string }) => { calls.push({ userId, code, requestId: metadata.requestId, userAgent: metadata.userAgent }); } });
  const { response } = makeResponse();
  const request = { user: { userId: 'authenticated-user', organizationId: 'org-1', sessionId: 'session-1' } };

  await authController.confirmMfaEnrollment(request as never, { code: '123456' }, 'req-123', 'test-agent', response as never);

  assert.deepEqual(calls, [{ userId: 'authenticated-user', code: '123456', requestId: 'req-123', userAgent: 'test-agent' }]);
});

test('MFA enrollment confirmation rejects malformed codes before calling the service', async () => {
  let called = false;
  const authController = controller({ confirmEnrollment: async () => { called = true; } });
  const { response } = makeResponse();
  const request = { user: { userId: 'authenticated-user', organizationId: 'org-1', sessionId: 'session-1' } };

  await assert.rejects(() => authController.confirmMfaEnrollment(request as never, { code: '12345' }, 'req-123', 'test-agent', response as never), BadRequestException);
  assert.equal(called, false);
});
