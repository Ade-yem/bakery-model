import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller.js';
import { TenantsService } from './tenants.service.js';
import { TenantTemplateSeederService } from './tenant-template-seeder.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [DatabaseModule, AuditModule],
  controllers: [TenantsController],
  providers: [TenantsService, TenantTemplateSeederService],
  exports: [TenantsService, TenantTemplateSeederService],
})
export class TenantsModule {}
