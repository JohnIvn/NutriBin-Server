import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../service/database/database.service';

type DashboardCounts = {
  total_customers: string;
  total_staff: string;
  total_admins: string;
  total_machines: string;
  active_machines: string;
};

type DashboardSums = {
  total_sales: number;
  sales_last_24h: number;
  sales_last_7d: number;
};

type DashboardSale = {
  sale_id: string;
  sale_date: string | null;
  amount: number;
  product: string | null;
  quantity: number;
  date_created: string;
  customer_id: string | null;
};

type MachineSummary = {
  machine_id: string;
  user_id: string | null;
  is_active: boolean;
  date_created: string;
};

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('summary')
  async summary() {
    const client = this.databaseService.getClient();

    try {
      const countsQ = await client.query<DashboardCounts>(`
        SELECT
          (SELECT COUNT(*) FROM user_customer) AS total_customers,
          (SELECT COUNT(*) FROM user_staff) AS total_staff,
          (SELECT COUNT(*) FROM user_admin) AS total_admins,
          (SELECT COUNT(*) FROM machines) AS total_machines,
          (SELECT COUNT(*) FROM machines WHERE is_active = true) AS active_machines
      `);

      const sumsQ = await client.query<DashboardSums>(`
        SELECT
          COALESCE((SELECT SUM(amount) FROM sales), 0) AS total_sales,
          COALESCE((SELECT SUM(amount) FROM sales WHERE sale_date > now() - INTERVAL '24 hours'), 0) AS sales_last_24h,
          COALESCE((SELECT SUM(amount) FROM sales WHERE sale_date > now() - INTERVAL '7 days'), 0) AS sales_last_7d
      `);

      const fertilizerQ = await client.query(`
        SELECT 
          COUNT(*) as total_batches,
          (COUNT(*) * 0.75) as production_kg
        FROM fertilizer_analytics
      `);

      const healthQ = await client.query(`
        SELECT 
          AVG(NULLIF(regexp_replace(ph, '[^0-9.]', '', 'g'), '')::numeric) as avg_ph,
          AVG(NULLIF(regexp_replace(moisture, '[^0-9.]', '', 'g'), '')::numeric) as avg_moisture,
          AVG(NULLIF(regexp_replace(methane, '[^0-9.]', '', 'g'), '')::numeric) as avg_methane,
          AVG(NULLIF(regexp_replace(smoke, '[^0-9.]', '', 'g'), '')::numeric) as avg_smoke
        FROM fertilizer_analytics
      `);

      const recentSalesQ = await client.query<DashboardSale>(
        `SELECT sale_id, sale_date, amount, product, quantity, date_created, customer_id FROM sales ORDER BY sale_date DESC NULLS LAST, date_created DESC LIMIT 10`,
      );

      return {
        ok: true,
        counts: countsQ.rows[0] || ({} as DashboardCounts),
        sums: sumsQ.rows[0] || ({} as DashboardSums),
        production: fertilizerQ.rows[0] || {
          total_batches: 0,
          production_kg: 0,
        },
        health: healthQ.rows[0] || {
          avg_ph: 0,
          avg_moisture: 0,
          avg_methane: 0,
          avg_smoke: 0,
        },
        recent_sales: recentSalesQ.rows || [],
      };
    } catch (error) {
      console.error('Failed to fetch dashboard summary', error);
      throw new InternalServerErrorException(
        'Failed to fetch dashboard summary',
      );
    }
  }

  @Get('machines')
  async machines() {
    const client = this.databaseService.getClient();

    try {
      const res = await client.query<MachineSummary>(
        `SELECT machine_id, user_id, is_active, date_created FROM machines ORDER BY date_created DESC LIMIT 500`,
      );

      return { ok: true, machines: res.rows };
    } catch (error) {
      console.error('Failed to fetch machines', error);
      throw new InternalServerErrorException('Failed to fetch machines');
    }
  }

  @Get('sales/recent')
  async recentSales() {
    const client = this.databaseService.getClient();

    try {
      const res = await client.query<DashboardSale>(
        `SELECT sale_id, sale_date, amount, product, quantity, customer_id, date_created FROM sales ORDER BY sale_date DESC NULLS LAST, date_created DESC LIMIT 50`,
      );

      return { ok: true, sales: res.rows };
    } catch (error) {
      console.error('Failed to fetch recent sales', error);
      throw new InternalServerErrorException('Failed to fetch recent sales');
    }
  }
}
