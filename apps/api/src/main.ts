import { randomUUID } from 'node:crypto';
import { Controller, Get, Module, MiddlewareConsumer, NestMiddleware, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger, LoggerModule } from 'nestjs-pino';
import type { Request, Response, NextFunction } from 'express';
import { ApiExceptionFilter } from './common/api-exception.filter.js';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { MfaService } from './auth/mfa-service.js';
import { AccessTokenGuard } from './auth/access-token.guard.js';

class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incoming = req.header('x-request-id');
    const requestId = incoming && /^[A-Za-z0-9._-]{1,128}$/.test(incoming) ? incoming : randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}

@Controller('api/v1')
class HealthController {
  @Get('health') health() { return { status: 'ok' }; }
  @Get('ready') ready() { return { status: 'ready' }; }
}

@Module({
  imports: [LoggerModule.forRoot({
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? 'info',
      customProps: (req) => ({ requestId: req.headers['x-request-id'] }),
      redact: { paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.x-api-key', 'req.headers.x-auth-token', 'password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'challengeToken', 'secret', 'encryptedSecret', 'apiKey'], censor: '[REDACTED]' },
    },
  })],
  controllers: [HealthController, AuthController],
  providers: [AuthService, MfaService, AccessTokenGuard],
})
class AppModule {
  configure(consumer: MiddlewareConsumer) { consumer.apply(RequestIdMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL }); }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
  await app.listen(Number(process.env.API_PORT ?? 4000));
}
bootstrap();
