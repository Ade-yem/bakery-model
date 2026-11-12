import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller.js';
import { SubscriptionsService } from './subscriptions.service.js';
import { FlutterwaveService } from './flutterwave.service.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [AuditModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, FlutterwaveService],
  exports: [SubscriptionsService, FlutterwaveService],
})
export class SubscriptionsModule {}
