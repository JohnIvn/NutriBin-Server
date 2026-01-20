import { Controller, Get, Query } from '@nestjs/common';
import { DatabaseService } from '../../service/database/database.service';

@Controller('management/mfa-records')
export class MfaRecordsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async list(@Query('limit') limit?: string) {
    const client = this.db.getClient();
    const l = Math.min(Math.max(parseInt(limit as any) || 100, 1), 2000);

    // Combine admins, staff, and customers with their authentication row if present.
    const res = await client.query(
      `
      SELECT * FROM (
        SELECT
          'admin'::text AS user_type,
          ua.admin_id::text AS identifier,
          ua.first_name || ' ' || ua.last_name AS full_name,
          ua.email,
          a.authentication_type::text,
          a.enabled,
          a.mfa_token,
          a.mfa_token_expiry,
          a.date_created AS auth_date_created
        FROM user_admin ua
        LEFT JOIN authentication a ON ua.admin_id::text = a.admin_id

        UNION ALL

        SELECT
          'staff'::text AS user_type,
          us.staff_id::text AS identifier,
          us.first_name || ' ' || us.last_name AS full_name,
          us.email,
          a.authentication_type::text,
          a.enabled,
          a.mfa_token,
          a.mfa_token_expiry,
          a.date_created AS auth_date_created
        FROM user_staff us
        LEFT JOIN authentication a ON us.staff_id::text = a.staff_id

        UNION ALL

        SELECT
          'customer'::text AS user_type,
          uc.customer_id::text AS identifier,
          uc.first_name || ' ' || uc.last_name AS full_name,
          uc.email,
          a.authentication_type::text,
          a.enabled,
          a.mfa_token,
          a.mfa_token_expiry,
          a.date_created AS auth_date_created
        FROM user_customer uc
        LEFT JOIN authentication a ON a.customer_id = uc.customer_id
      ) combined
      ORDER BY full_name NULLS LAST
      LIMIT $1
    `,
      [l],
    );

    // Normalize rows: if authentication_type is null -> treat as 'N/A' and present MFA as 'nothing'
    const rows = res.rows.map((r) => ({
      ...r,
      authentication_type: r.authentication_type || 'N/A',
      enabled: r.enabled === true,
      auth_date_created: r.auth_date_created || null,
    }));

    return { ok: true, rows };
  }
}
