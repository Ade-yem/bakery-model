import { Module } from '@nestjs/common';
import { FlutterwaveWebhookController } from './flutterwave-webhook.controller.js';
import { FlutterwaveSignatureGuard } from './flutterwave-signature.guard.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';

@Module({
  imports: [SubscriptionsModule],
  controllers: [FlutterwaveWebhookController],
  providers: [FlutterwaveSignatureGuard],
})
export class WebhooksModule {}
