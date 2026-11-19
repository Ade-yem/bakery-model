import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { configureApp } from './app.config.js';
import { AppModule } from './app.module.js';
import type { EnvironmentVariables } from './config/environment.js';

let cachedHandler:
  | ((req: IncomingMessage, res: ServerResponse) => void)
  | undefined;

async function createApp() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();
  return app;
}

async function getServerlessHandler() {
  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance() as (
      req: IncomingMessage,
      res: ServerResponse,
    ) => void;
  }
  return cachedHandler;
}

/**
 * Vercel serverless entrypoint that lazily initializes and caches the NestJS Express app.
 *
 * @param req - Incoming HTTP request.
 * @param res - Outgoing HTTP response.
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const expressHandler = await getServerlessHandler();
  expressHandler(req, res);
}

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  await app.listen(configService.get('PORT', { infer: true }));
}

if (!process.env.VERCEL) {
  await bootstrap();
}
