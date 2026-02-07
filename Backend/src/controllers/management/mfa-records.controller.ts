import { Controller, Get, Query } from '@nestjs/common';
import { DatabaseService } from '../../service/database/database.service';

type RawMfaRecordRow = {
  user_type: string;
  identifier: string;
  full_name: string;
  email: string;
  authentication_type: string | null;
  enabled: boolean | null;
  mfa_token: string | null;
  mfa_token_expiry: string | null;
  auth_date_created: string | null;
};

@Controller('management/mfa-records')
export class MfaRecordsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async list(@Query('limit') limit?: string) {
    const client = this.db.getClient();
    const requestedLimit =
      typeof limit === 'string' ? Number.parseInt(limit, 10) : NaN;
    const normalizedLimit = Number.isFinite(requestedLimit)
      ? requestedLimit
      : 100;
    const l = Math.min(Math.max(normalizedLimit, 1), 2000);

    // Combine admins, staff, and customers with their authentication row if present.
    const res = await client.query<RawMfaRecordRow>(
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
      user_type: r.user_type,
      identifier: r.identifier,
      full_name: r.full_name,
      email: r.email,
      authentication_type: r.authentication_type || 'N/A',
      enabled: r.enabled === true,
      mfa_token: r.mfa_token,
      mfa_token_expiry: r.mfa_token_expiry,
      auth_date_created: r.auth_date_created || null,
    }));

    return { ok: true, rows };
  }
}
