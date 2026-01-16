import { Controller, Get, All, Req } from '@nestjs/common';
import { AppService } from '../service/app.service';
import type { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @All('/test')
  testRoute(@Req() request: Request): object {
    console.log('Incoming request to /test');
    console.log('Method:', request.method);
    console.log('Headers:', request.headers);
    console.log('Query:', request.query);
    console.log('Body:', request.body);
    console.log('Params:', request.params);
    console.log('---');

    return {
      message: 'Test route received',
      method: request.method,
      path: request.path,
      timestamp: new Date().toISOString(),
    };
  }
}
