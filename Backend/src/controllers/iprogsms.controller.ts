import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { IprogSmsService } from '../service/iprogsms/iprogsms.service';

@Controller('sms/iprogsms')
export class IprogSmsController {
  constructor(private readonly iprog: IprogSmsService) {}

  @Post('send')
  @HttpCode(200)
  async send(@Body() body: { phone: string | string[]; message: string }) {
    const result = await this.iprog.sendSms({
      to: body.phone,
      body: body.message,
    });
    return result;
  }
}
