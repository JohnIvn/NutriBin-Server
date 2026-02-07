import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class LoginMonitorService {
  private readonly logger = new Logger(LoginMonitorService.name);
  // Threshold and window are configurable here
  private readonly WINDOW_SECONDS = 60; // time window in seconds
  private readonly THRESHOLD = 3; // number of successful logins in window to ban

  constructor(private readonly databaseService: DatabaseService) {}

  async recordLogin(params: {
    staffId?: string;
    adminId?: string;
    customerId?: string;
    userType?: 'customer' | 'staff' | 'admin' | string;
    siteVisited?: string;
    ip?: string;
    success?: boolean;
  }) {
    const client = this.databaseService.getClient();
    const {
      staffId,
      adminId,
      customerId,
      userType = 'N/A',
      ip,
      // siteVisited may be undefined; we'll infer below if missing
      siteVisited,
      success = true,
    } = params;

    // If siteVisited is not provided, infer from userType
    let siteVisitedValue = siteVisited;
    if (!siteVisitedValue) {
      if (userType === 'admin' || userType === 'staff') {
        siteVisitedValue = 'admin/staff portal';
      } else if (userType === 'customer') {
        siteVisitedValue = 'user website';
      } else {
        siteVisitedValue = 'unknown';
      }
    }

    try {
      await client.query(
        `INSERT INTO login_attempts (staff_id, admin_id, customer_id, user_type, site_visited, ip_address, success) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          staffId || null,
          adminId || null,
          customerId || null,
          userType,
          siteVisitedValue || null,
          ip || null,
          success,
        ],
      );

      if (!success) return { banned: false };

      // Determine which id column to use for counting
      let countRes;
      if (adminId) {
        countRes = await client.query(
          `SELECT COUNT(*)::int as cnt FROM login_attempts WHERE admin_id = $1 AND success = true AND date_created > (now() - $2::interval)`,
          [adminId, `${this.WINDOW_SECONDS} seconds`],
        );
      } else if (staffId) {
        countRes = await client.query(
          `SELECT COUNT(*)::int as cnt FROM login_attempts WHERE staff_id = $1 AND success = true AND date_created > (now() - $2::interval)`,
          [staffId, `${this.WINDOW_SECONDS} seconds`],
        );
      } else if (customerId) {
        countRes = await client.query(
          `SELECT COUNT(*)::int as cnt FROM login_attempts WHERE customer_id = $1::uuid AND success = true AND date_created > (now() - $2::interval)`,
          [customerId, `${this.WINDOW_SECONDS} seconds`],
        );
      } else {
        // No id provided; nothing to do
        return { banned: false };
      }

      const cnt = countRes.rows[0]?.cnt ?? 0;

      const idForLog = adminId || staffId || customerId || 'unknown';

      if (cnt >= this.THRESHOLD) {
        await this.banUser(idForLog, userType);
        this.logger.warn(
          `User ${idForLog} (${userType}) banned after ${cnt} quick logins`,
        );
        return { banned: true };
      }

      return { banned: false };
    } catch (error) {
      this.logger.error('Error recording login attempt', error);
      throw error;
    }
  }

  private async banUser(userId: string, userType: string) {
    const client = this.databaseService.getClient();

    try {
      // Ensure the account is marked banned so sign-in checks (which look at user.status)
      if (userType === 'customer') {
        await client.query(
          `UPDATE user_customer SET status = 'banned' WHERE customer_id = $1::uuid`,
          [userId],
        );
        await client.query(
          `UPDATE authentication SET enabled = false WHERE customer_id = $1::uuid`,
          [userId],
        );
      } else if (userType === 'staff') {
        await client.query(
          `UPDATE user_staff SET status = 'banned' WHERE staff_id = $1`,
          [userId],
        );
        await client.query(
          `UPDATE authentication SET enabled = false WHERE staff_id = $1`,
          [userId],
        );
      } else if (userType === 'admin') {
        await client.query(
          `UPDATE user_admin SET status = 'banned' WHERE admin_id = $1`,
          [userId],
        );
        await client.query(
          `UPDATE authentication SET enabled = false WHERE admin_id = $1`,
          [userId],
        );
      } else {
        // Fallback: try matching any of the id columns
        await client.query(
          `UPDATE user_admin SET status = 'banned' WHERE admin_id = $1`,
          [userId],
        );
        await client.query(
          `UPDATE user_staff SET status = 'banned' WHERE staff_id = $1`,
          [userId],
        );
        await client.query(
          `UPDATE user_customer SET status = 'banned' WHERE customer_id = $1::uuid`,
          [userId],
        );
        await client.query(
          `UPDATE authentication SET enabled = false WHERE admin_id = $1 OR staff_id = $1 OR customer_id = $1::uuid`,
          [userId],
        );
      }
    } catch (error) {
      this.logger.error('Failed to ban user', error);
      // swallow - do not crash caller; log for investigation
    }
  }
}
