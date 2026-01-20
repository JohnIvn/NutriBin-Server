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
      const candidates = [
        headers?.origin,
        headers?.referer,
        headers?.host,
        headers?.['x-forwarded-host'],
        headers?.['x-original-host'],
        headers?.['x-forwarded-for'],
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!derivedSite && candidates) {
        // Prioritize explicit admin indicators
        if (/(admin|staff|server-backend)/.test(candidates)) {
          derivedSite = 'admin/staff portal';
        } else if (/(nutribin|user|frontend|up\.railway\.app)/.test(candidates)) {
          derivedSite = 'user website';
        }
      }
    } catch (e) {
      // noop - leave derivedSite as provided or undefined
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
