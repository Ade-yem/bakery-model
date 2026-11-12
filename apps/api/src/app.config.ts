import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1', {
    exclude: ['api/auth/(.*)', 'docs/(.*)', 'health/(.*)'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TallyBakery API')
    .setDescription(
      'Multi-tenant operations and reconciliation API for TallyBakery shift-based bakeries.',
    )
    .setVersion('1.0')
    .addCookieAuth('better-auth.session_token')
    .addTag('Identity', 'Session discovery and caller profile')
    .addTag('Tenants', 'Organization onboarding and tenancy setup')
    .addTag('Branches', 'Physical facility branches and settings')
    .addTag('Departments', 'Department catalog and operational scopes')
    .addTag('Staff', 'Staff invitations, role assignments, and access ceilings')
    .addTag(
      'Access Control',
      'Permission catalog and dynamic tenant role management',
    )
    .addTag(
      'Catalog',
      'Inventory items (raw materials, finished goods, packaging)',
    )
    .addTag('Customers', 'Customer directory and credit ceilings')
    .addTag('Suppliers', 'Vendor directory and procurement contacts')
    .addTag('Audit', 'Immutable operational audit events log')
    .addTag('Health', 'Process liveness and database readiness probes')
    .addTag('Subscriptions', 'Billing plans, checkout, and license tiers')
    .addTag('Webhooks', 'Asynchronous provider event receivers')
    .addTag('General', 'API root service status')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/openapi.json',
  });
}
