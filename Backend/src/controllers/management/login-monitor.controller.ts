import { Body, Controller, Post } from '@nestjs/common';
import { LoginMonitorService } from '../../service/security/login-monitor.service';

@Controller('management/login-monitor')
export class LoginMonitorController {
  constructor(private readonly monitor: LoginMonitorService) {}

  @Post('login-event')
  async loginEvent(
    @Body()
    body: {
      staffId?: string;
      adminId?: string;
      customerId?: string;
      userType?: string;
      ip?: string;
      success?: boolean;
    },
  ) {
    const result = await this.monitor.recordLogin({
      staffId: body.staffId,
      adminId: body.adminId,
      customerId: body.customerId,
      userType: body.userType as any,
      ip: body.ip,
      success: typeof body.success === 'boolean' ? body.success : true,
    });

    return { ok: true, ...result };
  }
}
