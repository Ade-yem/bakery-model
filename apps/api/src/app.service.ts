import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello there 🤗, This is TalleyBakery API service. Welcome 🫡';
  }
}
