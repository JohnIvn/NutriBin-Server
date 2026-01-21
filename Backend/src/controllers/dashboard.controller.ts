import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../service/database/database.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('summary')
  async summary() {
    const client = this.databaseService.getClient();

    try {
      const countsQ = await client.query(`
        SELECT
          (SELECT COUNT(*) FROM user_customer) AS total_customers,
          (SELECT COUNT(*) FROM user_staff) AS total_staff,
          (SELECT COUNT(*) FROM user_admin) AS total_admins,
          (SELECT COUNT(*) FROM machines) AS total_machines,
          (SELECT COUNT(*) FROM machines WHERE is_active = true) AS active_machines
      `);

      const sumsQ = await client.query(`
        SELECT
          COALESCE((SELECT SUM(amount) FROM sales), 0) AS total_sales,
          COALESCE((SELECT SUM(amount) FROM sales WHERE sale_date > now() - INTERVAL '24 hours'), 0) AS sales_last_24h,
          COALESCE((SELECT SUM(amount) FROM sales WHERE sale_date > now() - INTERVAL '7 days'), 0) AS sales_last_7d
      `);

      const recentSalesQ = await client.query(
        `SELECT sale_id, sale_date, amount, product, quantity, date_created FROM sales ORDER BY sale_date DESC NULLS LAST, date_created DESC LIMIT 10`,
      );

      return {
        ok: true,
        counts: countsQ.rows[0] || {},
        sums: sumsQ.rows[0] || {},
        recent_sales: recentSalesQ.rows || [],
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to fetch dashboard summary',
      );
    }
  }

  @Get('machines')
  async machines() {
    const client = this.databaseService.getClient();

    try {
      const res = await client.query(
        `SELECT machine_id, user_id, is_active, date_created FROM machines ORDER BY date_created DESC LIMIT 500`,
      );

      return { ok: true, machines: res.rows };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch machines');
    }
  }

  @Get('sales/recent')
  async recentSales() {
    const client = this.databaseService.getClient();

    try {
      const res = await client.query(
        `SELECT sale_id, sale_date, amount, product, quantity, customer_id, date_created FROM sales ORDER BY sale_date DESC NULLS LAST, date_created DESC LIMIT 50`,
      );

      return { ok: true, sales: res.rows };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch recent sales');
    }
  }
}
