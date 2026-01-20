import { Body, Controller, Post, Headers } from '@nestjs/common';
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
      siteVisited?: string;
      success?: boolean;
    },
    @Headers() headers: Record<string, any>,
  ) {
    // Derive siteVisited from headers if not explicitly provided.
    let derivedSite: string | undefined = body.siteVisited;
    try {
      const origin = (headers?.origin || headers?.referer || headers?.host || '') as string;
      if (!derivedSite && origin) {
        if (
          origin.includes('nutribin-admin.up.railway.app') ||
          origin.includes('nutribin-server-backend-production.up.railway.app')
        ) {
          derivedSite = 'admin/staff portal';
        } else if (
          origin.includes('nutribin.up.railway.app') ||
          origin.includes('nutribin-user-backend-production.up.railway.app')
        ) {
          derivedSite = 'user website';
        }
      }
    } catch (e) {
      derivedSite = body.siteVisited;
    }

    const result = await this.monitor.recordLogin({
      staffId: body.staffId,
      adminId: body.adminId,
      customerId: body.customerId,
      userType: body.userType as any,
      ip: body.ip,
      siteVisited: derivedSite ?? body.siteVisited,
      success: typeof body.success === 'boolean' ? body.success : true,
    });

    return { ok: true, ...result };
  }
}
