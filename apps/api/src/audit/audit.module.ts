import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { AuditController } from './audit.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
