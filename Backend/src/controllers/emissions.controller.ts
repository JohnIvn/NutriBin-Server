import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Query,
} from '@nestjs/common';
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
          CASE 
            WHEN uc.first_name IS NULL AND uc.last_name IS NULL THEN 'No Owner'
            ELSE TRIM(CONCAT(uc.first_name, ' ', uc.last_name))
          END as full_name,
          fa.methane,
          fa.hydrogen,
          fa.benzene,
          fa.smoke,
          fa.nitrogen,
          fa.date_created as last_reading
        FROM machines m
        LEFT JOIN machine_customers mc ON m.machine_id = mc.machine_id
        LEFT JOIN user_customer uc ON mc.customer_id = uc.customer_id
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

  @Get('history/:machineId')
  async getMachineEmissionsHistory(
    @Param('machineId') machineId: string,
    @Query('date') date?: string,
  ) {
    const client = this.databaseService.getClient();
    try {
      let query = `
        SELECT 
          nitrogen,
          methane,
          hydrogen,
          smoke,
          benzene,
          date_created
        FROM fertilizer_analytics
        WHERE machine_id = $1
      `;
      const params: any[] = [machineId];

      if (date) {
        query += ` AND DATE(date_created) = $2`;
        params.push(date);
      }

      query += ` ORDER BY date_created DESC LIMIT 100`;

      const result = await client.query(query, params);

      return {
        ok: true,
        history: result.rows,
      };
    } catch (error) {
      console.error('Machine Emissions History Error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch machine emissions history',
      );
    }
  }
}
