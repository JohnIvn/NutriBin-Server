import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { DatabaseService } from '../service/database/database.service';

@Controller('data-science')
export class DataScienceController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('machines')
  async getMachines() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(`
        SELECT DISTINCT m.machine_id, m.machine_id as name
        FROM machines m
        INNER JOIN fertilizer_analytics fa ON m.machine_id = fa.machine_id
        ORDER BY m.machine_id
      `);
      return {
        ok: true,
        machines: result.rows,
      };
    } catch (error) {
      console.error('Data Science Machines Error:', error);
      throw new InternalServerErrorException('Failed to fetch machines');
    }
  }

  @Get('analytics')
  async getAnalytics(@Query('machine_id') machineId?: string) {
    const client = this.databaseService.getClient();
    try {
      const filter = machineId ? `WHERE machine_id = $1` : '';
      const params = machineId ? [machineId] : [];

      // Get metadata for summary
      const metadataResult = await client.query(`
        SELECT COUNT(DISTINCT machine_id) as total_machines,
        COUNT(*) as total_readings
        FROM fertilizer_analytics
      `);

      const result = await client.query(
        `
        SELECT 
          AVG(NULLIF(regexp_replace(nitrogen, '[^0-9.]', '', 'g'), '')::numeric) as avg_n,
          AVG(NULLIF(regexp_replace(phosphorus, '[^0-9.]', '', 'g'), '')::numeric) as avg_p,
          AVG(NULLIF(regexp_replace(potassium, '[^0-9.]', '', 'g'), '')::numeric) as avg_k,
          AVG(NULLIF(regexp_replace(ph, '[^0-9.]', '', 'g'), '')::numeric) as avg_ph,
          AVG(NULLIF(regexp_replace(moisture, '[^0-9.]', '', 'g'), '')::numeric) as avg_moisture
        FROM fertilizer_analytics
        ${filter}
      `,
        params,
      );

      const currentResult = await client.query(
        `
        SELECT 
          regexp_replace(nitrogen, '[^0-9.]', '', 'g') as nitrogen,
          regexp_replace(phosphorus, '[^0-9.]', '', 'g') as phosphorus,
          regexp_replace(potassium, '[^0-9.]', '', 'g') as potassium,
          regexp_replace(ph, '[^0-9.]', '', 'g') as ph,
          regexp_replace(moisture, '[^0-9.]', '', 'g') as moisture,
          date_created
        FROM fertilizer_analytics 
        ${filter}
        ORDER BY date_created DESC 
        LIMIT 1
      `,
        params,
      );

      const crops = [
        { name: 'Rice', n: 100, p: 50, k: 50, ph_min: 5.5, ph_max: 6.5 },
        { name: 'Corn', n: 125, p: 65, k: 80, ph_min: 5.8, ph_max: 7.0 },
        { name: 'Tomato', n: 85, p: 55, k: 100, ph_min: 6.0, ph_max: 6.8 },
        { name: 'Lettuce', n: 120, p: 40, k: 65, ph_min: 6.0, ph_max: 7.0 },
        { name: 'Potato', n: 100, p: 80, k: 125, ph_min: 4.8, ph_max: 5.5 },
        { name: 'Carrot', n: 60, p: 80, k: 100, ph_min: 6.0, ph_max: 6.8 },
        { name: 'Cabbage', n: 140, p: 50, k: 80, ph_min: 6.5, ph_max: 7.5 },
      ];

      if (currentResult.rows.length === 0) {
        return {
          ok: true,
          averages: result.rows[0],
          recommendations: [],
          summary: {
            total_machines: parseInt(metadataResult.rows[0].total_machines),
            total_readings: parseInt(metadataResult.rows[0].total_readings)
          },
          formula:
            'Crop Suitability Index (CSI) based on NPK variance and pH range compatibility.',
        };
      }

      const current = {
        n: parseFloat(currentResult.rows[0].nitrogen),
        p: parseFloat(currentResult.rows[0].phosphorus),
        k: parseFloat(currentResult.rows[0].potassium),
        ph: parseFloat(currentResult.rows[0].ph),
      };

      const recommendations = crops
        .map((crop) => {
          // NPK Distance (Lower is better)
          const distance = Math.sqrt(
            Math.pow(current.n - crop.n, 2) +
              Math.pow(current.p - crop.p, 2) +
              Math.pow(current.k - crop.k, 2),
          );

          // pH Match (Binary/Penalty)
          const phPenalty =
            current.ph >= crop.ph_min && current.ph <= crop.ph_max ? 0 : 20;

          // Similarity score (0-100)
          const baseScore = Math.max(0, 100 - distance / 2);
          const finalScore = Math.max(0, baseScore - phPenalty);

          return {
            name: crop.name,
            score: Math.round(finalScore),
            ideal_npk: `${crop.n}-${crop.p}-${crop.k}`,
            ph_range: `${crop.ph_min}-${crop.ph_max}`,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      return {
        ok: true,
        summary: {
          total_machines: parseInt(metadataResult.rows[0].total_machines),
          total_readings: parseInt(metadataResult.rows[0].total_readings)
        },
        current_readings: current,
        averages: result.rows[0],
        recommendations,
        formula: 'CSI = Max(0, 100 - (sqrt(ΔN² + ΔP² + ΔK²) / 2) - pH_Penalty)',
        description:
          'The recommendation system uses a Euclidean distance algorithm in a 3D NPK space, penalizing crops whose required pH range does not match current soil acidity.',
      };
    } catch (error) {
      console.error('Data Science Analytics Error:', error);
      throw new InternalServerErrorException(
        'Failed to process data science metrics',
      );
    }
  }
}
