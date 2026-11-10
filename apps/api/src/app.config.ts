import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1', {
    exclude: ['api/auth/(.*)', 'docs/(.*)', 'health/(.*)'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TallyBakery API')
    .setDescription(
      'Multi-tenant operations and reconciliation API for TallyBakery.',
    )
    .setVersion('1.0')
    .addCookieAuth('better-auth.session_token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/openapi.json',
  });
}
