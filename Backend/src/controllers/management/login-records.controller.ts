import { Controller, Get, Query } from '@nestjs/common';
import { DatabaseService } from '../../service/database/database.service';

@Controller('management/login-records')
export class LoginRecordsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async list(@Query('limit') limit?: string) {
    const client = this.db.getClient();
    const parsedLimitRaw = parseInt(limit ?? '', 10);
    const parsedLimit = Number.isNaN(parsedLimitRaw) ? 100 : parsedLimitRaw;
    const l = Math.min(Math.max(parsedLimit, 1), 1000);

    const res = await client.query(
      `
      SELECT
        la.attempt_id,
        la.staff_id,
        la.admin_id,
        la.customer_id,
        la.user_type,
        la.attempt_type,
        la.site_visited,
        la.ip_address,
        la.success,
        la.date_created,
        COALESCE(ua.first_name || ' ' || ua.last_name, us.first_name || ' ' || us.last_name, uc.first_name || ' ' || uc.last_name) AS full_name,
        COALESCE(ua.email, us.email, uc.email) AS email
      FROM auth_attempts la
      LEFT JOIN user_admin ua ON ua.admin_id::text = la.admin_id
      LEFT JOIN user_staff us ON us.staff_id::text = la.staff_id
      LEFT JOIN user_customer uc ON uc.customer_id = la.customer_id
      ORDER BY la.date_created DESC
      LIMIT $1
    `,
      [l],
    );

    return { ok: true, rows: res.rows };
  }
}
