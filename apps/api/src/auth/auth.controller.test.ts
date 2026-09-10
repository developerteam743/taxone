import assert from 'node:assert/strict';
import test from 'node:test';
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
    cookie(name: string, value: string, options: Record<string, unknown>) {
      cookies.push({ name, value, options });
    },
    clearCookie(name: string, options: Record<string, unknown>) {
      cleared.push({ name, options });
    },
  };
  return { response, cookies, cleared };
}

test('logout revokes the refresh family and clears both auth cookies', async () => {
  const calls: Array<{ token: string | undefined; requestId: string; userAgent?: string; ipHash?: string }> = [];
  const service = {
    logout: async (
      token: string | undefined,
      requestMetadata: { requestId: string; userAgent?: string; ipHash?: string },
    ) => {
      calls.push({ token, ...requestMetadata });
    },
  };
  const controller = new AuthController(service as never);
  const { response, cleared } = makeResponse('other=value; taxone_refresh=refresh-token-value');

  const result = await controller.logout('req-test', 'test-agent', response as never);

  assert.equal(result, undefined);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.token, 'refresh-token-value');
  assert.equal(calls[0]?.requestId, 'req-test');
  assert.equal(calls[0]?.userAgent, 'test-agent');
  assert.equal(typeof calls[0]?.ipHash, 'string');
  assert.equal(calls[0]?.ipHash?.length, 64);
  assert.equal(cleared.length, 2);
  assert.deepEqual(cleared[0], {
    name: 'taxone_access',
    options: { httpOnly: true, secure: true, sameSite: 'strict', path: '/' },
  });
  assert.deepEqual(cleared[1], {
    name: 'taxone_refresh',
    options: { httpOnly: true, secure: true, sameSite: 'strict', path: '/api/v1/auth' },
  });
});

test('logout clears cookies even when no refresh cookie is present', async () => {
  const calls: Array<string | undefined> = [];
  const service = {
    logout: async (token: string | undefined) => {
      calls.push(token);
    },
  };
  const controller = new AuthController(service as never);
  const { response, cleared } = makeResponse();

  await controller.logout(undefined, undefined, response as never);

  assert.deepEqual(calls, [undefined]);
  assert.equal(cleared.length, 2);
});

test('logout treats a malformed refresh cookie as absent and still clears cookies', async () => {
  const calls: Array<string | undefined> = [];
  const service = {
    logout: async (token: string | undefined) => {
      calls.push(token);
    },
  };
  const controller = new AuthController(service as never);
  const { response, cleared } = makeResponse('taxone_refresh=%E0%A4%A');

  await controller.logout('req-test', 'test-agent', response as never);

  assert.deepEqual(calls, [undefined]);
  assert.equal(cleared.length, 2);
});
