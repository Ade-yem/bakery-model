import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { configureApp } from './app.config.js';
import { AppModule } from './app.module.js';
import type { EnvironmentVariables } from './config/environment.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();

  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  await app.listen(configService.get('PORT', { infer: true }));
}
await bootstrap();
