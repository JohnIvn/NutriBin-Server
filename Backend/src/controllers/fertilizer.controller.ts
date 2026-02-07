import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../service/database/database.service';

@Controller('fertilizer')
export class FertilizerController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('production')
  async getProduction() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query<{ total: string }>(`
        SELECT COUNT(*) as total FROM fertilizer_analytics
      `);

      // Rough estimation: each reading represents a batch of ~0.75kg
      const totalCount = parseInt(result.rows[0].total);
      const productionKg = (totalCount * 0.75).toFixed(2);

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
  async getBatches() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query<{
        batch: string;
        nitrogen: string;
        phosporus: string;
        potassium: string;
      }>(`
        SELECT 
          SUBSTRING(fertilizer_analytics_id::text, 1, 6) as batch,
          nitrogen,
          phosphorus as phosporus,
          potassium
        FROM fertilizer_analytics
        ORDER BY date_created DESC
        LIMIT 5
      `);

      const formattedData = result.rows
        .map((row) => ({
          batch: `NB${row.batch.toUpperCase()}`,
          nitrogen: this.toNumber(row.nitrogen),
          phosporus: this.toNumber(row.phosporus),
          potassium: this.toNumber(row.potassium),
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
  async getAverages() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query<{
        nitrogen: string | null;
        phosphorus: string | null;
        potassium: string | null;
      }>(`
        SELECT 
          AVG(NULLIF(regexp_replace(nitrogen, '[^0-9.]', '', 'g'), '')::numeric) as nitrogen,
          AVG(NULLIF(regexp_replace(phosphorus, '[^0-9.]', '', 'g'), '')::numeric) as phosphorus,
          AVG(NULLIF(regexp_replace(potassium, '[^0-9.]', '', 'g'), '')::numeric) as potassium
        FROM fertilizer_analytics
      `);

      const row = result.rows[0];
      const data = [
        {
          name: 'Nitrogen',
          value: parseFloat(row.nitrogen || '0'),
          fill: '#C26A4A',
        },
        {
          name: 'Phosporus',
          value: parseFloat(row.phosphorus || '0'),
          fill: '#D97706',
        },
        {
          name: 'Potassium',
          value: parseFloat(row.potassium || '0'),
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
  async getStats() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query<{
        total_batches: string | null;
        active_devices: string | null;
        avg_ph: string | null;
        avg_moisture: string | null;
      }>(`
        SELECT 
          (SELECT COUNT(*) FROM fertilizer_analytics) as total_batches,
          (SELECT COUNT(DISTINCT machine_id) FROM fertilizer_analytics) as active_devices,
          (SELECT AVG(NULLIF(regexp_replace(ph, '[^0-9.]', '', 'g'), '')::numeric) FROM fertilizer_analytics) as avg_ph,
          (SELECT AVG(NULLIF(regexp_replace(moisture, '[^0-9.]', '', 'g'), '')::numeric) FROM fertilizer_analytics) as avg_moisture
        FROM fertilizer_analytics
        LIMIT 1
      `);

      const row = result.rows[0];
      const totalBatches = parseInt(row.total_batches || '0');

      return {
        ok: true,
        stats: {
          total_batches: totalBatches,
          active_devices: parseInt(row.active_devices || '0'),
          processed_waste: (totalBatches * 1.25).toFixed(1), // Estimated intake
          fertilizer_yield: (totalBatches * 0.75).toFixed(1), // Estimated output
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

  @Get('logs')
  async getLogs() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(`
        SELECT 
          fertilizer_analytics_id,
          machine_id,
          nitrogen,
          phosphorus,
          potassium,
          ph,
          moisture,
          temperature,
          date_created
        FROM fertilizer_analytics
        ORDER BY date_created DESC
        LIMIT 15
      `);

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
