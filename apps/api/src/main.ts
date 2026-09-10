import { randomUUID } from 'node:crypto';
import { Controller, Get, Module, MiddlewareConsumer, NestMiddleware, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

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

@Module({ controllers: [HealthController] })
class AppModule {
  configure(consumer: MiddlewareConsumer) { consumer.apply(RequestIdMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL }); }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(helmet());
  app.enableShutdownHooks();
  await app.listen(Number(process.env.API_PORT ?? 4000));
}
bootstrap();
