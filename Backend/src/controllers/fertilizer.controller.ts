import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { DatabaseService } from '../service/database/database.service';

interface FertilizerTrendRow {
  label: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
}

@Controller('fertilizer')
export class FertilizerController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('production')
  async getProduction(@Query('date') date?: string) {
    const client = this.databaseService.getClient();
    try {
      const dateFilter = date ? `WHERE DATE(date_created) = $1` : '';
      const params = date ? [date] : [];

      const result = await client.query<{
        total: string;
        total_weight: string | null;
      }>(
        `SELECT COUNT(*) as total, SUM(NULLIF(regexp_replace(weight_kg, '[^0-9.]', '', 'g'), '')::numeric) as total_weight FROM fertilizer_analytics ${dateFilter}`,
        params,
      );

      // Rough estimation fallback: each reading represents a batch of ~0.75kg
      const totalCount = parseInt(result.rows[0].total);
      const totalWeight = parseFloat(result.rows[0].total_weight || '0');
      const productionKg =
        totalWeight > 0
          ? totalWeight.toFixed(2)
          : (totalCount * 0.75).toFixed(2);

      return {
        ok: true,
        production_kg: productionKg,
      };
    } catch (error) {
      console.error('Fertilizer Production Error:', error);
      throw new InternalServerErrorException('Failed to fetch production data');
    }
  }

  @Get('batches')
  async getBatches(@Query('date') date?: string) {
    const client = this.databaseService.getClient();
    try {
      const dateFilter = date ? `WHERE DATE(date_created) = $1` : '';
      const params = date ? [date] : [];

      const result = await client.query<{
        batch: string;
        nitrogen: string;
        phosporus: string;
        potassium: string;
        weight: string;
      }>(
        `
        SELECT 
          machine_id as batch,
          nitrogen,
          phosphorus as phosporus,
          potassium,
          weight_kg as weight
        FROM fertilizer_analytics
        ${dateFilter}
        ORDER BY date_created DESC
        LIMIT 10
      `,
        params,
      );

      const formattedData = result.rows
        .map((row) => ({
          batch: row.batch.toUpperCase(),
          nitrogen: this.toNumber(row.nitrogen),
          phosporus: this.toNumber(row.phosporus),
          potassium: this.toNumber(row.potassium),
          weight: this.toNumber(row.weight),
        }))
        .reverse();

      return {
        ok: true,
        batches: formattedData,
      };
    } catch (error) {
      console.error('Fertilizer Batches Error:', error);
      throw new InternalServerErrorException('Failed to fetch batch data');
    }
  }

  @Get('averages')
  async getAverages(@Query('date') date?: string) {
    const client = this.databaseService.getClient();
    try {
      const dateFilter = date ? `WHERE DATE(date_created) = $1` : '';
      const params = date ? [date] : [];

      const result = await client.query<{
        nitrogen: string | null;
        phosphorus: string | null;
        potassium: string | null;
      }>(
        `
        SELECT 
          AVG(NULLIF(regexp_replace(nitrogen, '[^0-9.]', '', 'g'), '')::numeric) as nitrogen,
          AVG(NULLIF(regexp_replace(phosphorus, '[^0-9.]', '', 'g'), '')::numeric) as phosphorus,
          AVG(NULLIF(regexp_replace(potassium, '[^0-9.]', '', 'g'), '')::numeric) as potassium
        FROM fertilizer_analytics
        ${dateFilter}
      `,
        params,
      );

      const row = result.rows[0];
      const data = [
        {
          name: 'Nitrogen',
          value: parseFloat(row.nitrogen || '1'),
          fill: '#C26A4A',
        },
        {
          name: 'Phosporus',
          value: parseFloat(row.phosphorus || '1'),
          fill: '#D97706',
        },
        {
          name: 'Potassium',
          value: parseFloat(row.potassium || '1'),
          fill: '#739072',
        },
      ];

      return {
        ok: true,
        averages: data,
      };
    } catch (error) {
      console.error('Fertilizer Averages Error:', error);
      throw new InternalServerErrorException('Failed to fetch averages data');
    }
  }

  @Get('stats')
  async getStats(@Query('date') date?: string) {
    const client = this.databaseService.getClient();
    try {
      const dateFilter = date ? `WHERE DATE(date_created) = $1` : '';
      const params = date ? [date] : [];

      const result = await client.query<{
        total_batches: string | null;
        active_devices: string | null;
        avg_ph: string | null;
        avg_moisture: string | null;
        total_weight: string | null;
      }>(
        `
        SELECT 
          COUNT(*) as total_batches,
          COUNT(DISTINCT machine_id) as active_devices,
          AVG(NULLIF(regexp_replace(ph, '[^0-9.]', '', 'g'), '')::numeric) as avg_ph,
          AVG(NULLIF(regexp_replace(moisture, '[^0-9.]', '', 'g'), '')::numeric) as avg_moisture,
          SUM(NULLIF(regexp_replace(weight_kg, '[^0-9.]', '', 'g'), '')::numeric) as total_weight
        FROM fertilizer_analytics
        ${dateFilter}
      `,
        params,
      );

      const row = result.rows[0];
      const totalBatches = parseInt(row.total_batches || '0');
      const totalWeight = parseFloat(row.total_weight || '0');

      return {
        ok: true,
        stats: {
          total_batches: totalBatches,
          active_devices: parseInt(row.active_devices || '0'),
          processed_waste: (totalBatches * 1.25).toFixed(1), // Estimated intake
          fertilizer_yield:
            totalWeight > 0
              ? totalWeight.toFixed(1)
              : (totalBatches * 0.75).toFixed(1), // Estimated output fallback
          avg_ph: parseFloat(row.avg_ph || '0').toFixed(1),
          avg_moisture: parseFloat(row.avg_moisture || '0').toFixed(1),
        },
      };
    } catch (error) {
      console.error('Fertilizer Stats Error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch fertilizer stats',
      );
    }
  }

  @Get('trends')
  async getTrends(@Query('date') date?: string) {
    const client = this.databaseService.getClient();
    try {
      // If date is provided, show hourly trends for that day
      // If not, show daily trends for the last 7 days
      let query = '';
      let params: any[] = [];

      if (date) {
        query = `
          SELECT 
            TO_CHAR(DATE_TRUNC('hour', date_created), 'HH24:00') as label,
            AVG(NULLIF(regexp_replace(nitrogen, '[^0-9.]', '', 'g'), '')::numeric) as nitrogen,
            AVG(NULLIF(regexp_replace(phosphorus, '[^0-9.]', '', 'g'), '')::numeric) as phosphorus,
            AVG(NULLIF(regexp_replace(potassium, '[^0-9.]', '', 'g'), '')::numeric) as potassium
          FROM fertilizer_analytics
          WHERE DATE(date_created) = $1
          GROUP BY DATE_TRUNC('hour', date_created)
          ORDER BY DATE_TRUNC('hour', date_created) ASC
        `;
        params = [date];
      } else {
        query = `
          SELECT 
            TO_CHAR(DATE_TRUNC('day', date_created), 'Mon DD') as label,
            AVG(NULLIF(regexp_replace(nitrogen, '[^0-9.]', '', 'g'), '')::numeric) as nitrogen,
            AVG(NULLIF(regexp_replace(phosphorus, '[^0-9.]', '', 'g'), '')::numeric) as phosphorus,
            AVG(NULLIF(regexp_replace(potassium, '[^0-9.]', '', 'g'), '')::numeric) as potassium
          FROM fertilizer_analytics
          WHERE date_created >= NOW() - INTERVAL '7 days'
          GROUP BY DATE_TRUNC('day', date_created)
          ORDER BY DATE_TRUNC('day', date_created) ASC
        `;
      }

      const result = await client.query<FertilizerTrendRow>(query, params);

      return {
        ok: true,
        trends: result.rows.map((row) => ({
          label: row.label,
          nitrogen: parseFloat(row.nitrogen || '0').toFixed(1),
          phosphorus: parseFloat(row.phosphorus || '0').toFixed(1),
          potassium: parseFloat(row.potassium || '0').toFixed(1),
        })),
      };
    } catch (error) {
      console.error('Fertilizer Trends Error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch fertilizer trends',
      );
    }
  }

  @Get('logs')
  async getLogs(@Query('date') date?: string) {
    const client = this.databaseService.getClient();
    try {
      const dateFilter = date ? `WHERE DATE(f.date_created) = $1` : '';
      const params = date ? [date] : [];

      const result = await client.query(
        `
        SELECT 
          f.fertilizer_analytics_id,
          f.machine_id,
          f.nitrogen,
          f.phosphorus,
          f.potassium,
          f.ph,
          f.moisture,
          f.temperature,
          f.weight_kg as weight,
          f.reed_switch,
          f.date_created,
          CASE 
            WHEN uc.first_name IS NULL AND uc.last_name IS NULL THEN 'No Owner'
            ELSE TRIM(CONCAT(uc.first_name, ' ', uc.last_name))
          END as machine_name
        FROM fertilizer_analytics f
        LEFT JOIN machine_customers mc ON f.machine_id = mc.machine_id
        LEFT JOIN user_customer uc ON mc.customer_id = uc.customer_id
        ${dateFilter}
        ORDER BY f.date_created DESC
        LIMIT 30
      `,
        params,
      );

      return {
        ok: true,
        logs: result.rows,
      };
    } catch (error) {
      console.error('Fertilizer Logs Error:', error);
      throw new InternalServerErrorException('Failed to fetch fertilizer logs');
    }
  }

  private toNumber(val: string | null): number {
    if (!val) return 0;
    const num = parseFloat(val.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }
}
