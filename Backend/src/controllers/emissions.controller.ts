import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../service/database/database.service';

@Controller('emissions')
export class EmissionsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('summary')
  async getEmissionsSummary() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(`
        SELECT 
          nitrogen,
          methane,
          hydrogen,
          smoke,
          benzene,
          date_created
        FROM fertilizer_analytics
        ORDER BY date_created DESC
        LIMIT 20
      `);

      return {
        ok: true,
        data: result.rows.reverse(),
      };
    } catch (error) {
      console.error('Emissions Summary Error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch emissions summary',
      );
    }
  }

  @Get('devices')
  async getDeviceEmissions() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(`
        SELECT DISTINCT ON (m.machine_id)
          m.machine_id,
          fa.methane,
          fa.hydrogen,
          fa.benzene,
          fa.smoke,
          fa.nitrogen,
          fa.date_created as last_reading
        FROM machines m
        LEFT JOIN fertilizer_analytics fa ON m.machine_id = fa.machine_id
        ORDER BY m.machine_id, fa.date_created DESC
      `);

      return {
        ok: true,
        devices: result.rows,
      };
    } catch (error) {
      console.error('Device Emissions Error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch device emissions',
      );
    }
  }
}
