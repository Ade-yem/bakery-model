import { Module } from '@nestjs/common';
import { AccessControlController } from './access-control.controller.js';

@Module({
  controllers: [AccessControlController],
})
export class AccessControlApiModule {}
