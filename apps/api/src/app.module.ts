import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { validateEnvironment } from './config/environment.js';
import { DatabaseModule } from './database/database.module.js';
import { MeModule } from './me/me.module.js';
import { AuditModule } from './audit/audit.module.js';
import { TenantsModule } from './tenants/tenants.module.js';
import { BranchesModule } from './branches/branches.module.js';
import { DepartmentsModule } from './departments/departments.module.js';
import { StaffModule } from './staff/staff.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { AccessControlApiModule } from './access-control/access-control.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    DatabaseModule,
    AuthModule,
    MeModule,
    AuditModule,
    TenantsModule,
    BranchesModule,
    DepartmentsModule,
    StaffModule,
    CatalogModule,
    SuppliersModule,
    CustomersModule,
    AccessControlApiModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
