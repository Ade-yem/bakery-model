import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

/**
 * Root application controller exposing root service check.
 */
@ApiTags('General')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Root welcome check endpoint.
   *
   * @returns Greeting message from AppService.
   */
  @Get()
  @ApiOperation({
    summary: 'API welcome and service root',
    description:
      'Returns the root greeting and status of the TallyBakery API service.',
  })
  @ApiOkResponse({
    description: 'The API service is available and operational.',
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
