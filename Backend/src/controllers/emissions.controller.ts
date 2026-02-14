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
  async getEmissionsSummary(@Query('date') date?: string) {
    const client = this.databaseService.getClient();
    try {
      const selectedDate = date || new Date().toISOString().split('T')[0];

      // Get hourly averages for the selected date
      const result = await client.query(
        `
        SELECT 
          AVG(CASE WHEN methane ~ '^[0-9.]+$' THEN methane::numeric ELSE NULL END) as methane,
          AVG(CASE WHEN air_quality ~ '^[0-9.]+$' THEN air_quality::numeric ELSE NULL END) as air_quality,
          AVG(CASE WHEN carbon_monoxide ~ '^[0-9.]+$' THEN carbon_monoxide::numeric ELSE NULL END) as carbon_monoxide,
          AVG(CASE WHEN combustible_gases ~ '^[0-9.]+$' THEN combustible_gases::numeric ELSE NULL END) as combustible_gases,
          AVG(CASE WHEN nitrogen ~ '^[0-9.]+$' THEN nitrogen::numeric ELSE NULL END) as nitrogen,
          DATE_TRUNC('hour', date_created) as time
        FROM fertilizer_analytics
        WHERE DATE(date_created) = $1
        GROUP BY time
        ORDER BY time ASC
      `,
        [selectedDate],
      );

      // Also get the latest reading for global context if the requested date is today
      let latest = null;
      if (selectedDate === new Date().toISOString().split('T')[0]) {
        const latestResult = await client.query(`
          SELECT 
            nitrogen, methane, air_quality, carbon_monoxide, combustible_gases, date_created
          FROM fertilizer_analytics
          ORDER BY date_created DESC
          LIMIT 1
        `);
        latest = latestResult.rows[0] as unknown;
      }

      return {
        ok: true,
        data: result.rows,
        latest,
        selectedDate,
      };
    } catch (error) {
      console.error('Emissions Summary Error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch emissions summary',
      );
    }
  }

  @Get('devices')
  async getDeviceEmissions(@Query('date') date?: string) {
    const client = this.databaseService.getClient();
    try {
      const selectedDate = date || new Date().toISOString().split('T')[0];

      // Fetch the latest reading for each machine on the selected date
      const result = await client.query(
        `
        SELECT DISTINCT ON (m.machine_id)
          m.machine_id,
          CASE 
            WHEN uc.first_name IS NULL AND uc.last_name IS NULL THEN 'No Owner'
            ELSE TRIM(CONCAT(uc.first_name, ' ', uc.last_name))
          END as full_name,
          fa.methane,
          fa.air_quality,
          fa.combustible_gases,
          fa.carbon_monoxide,
          fa.nitrogen,
          fa.date_created as last_reading
        FROM machines m
        LEFT JOIN machine_customers mc ON m.machine_id = mc.machine_id
        LEFT JOIN user_customer uc ON mc.customer_id = uc.customer_id
        LEFT JOIN fertilizer_analytics fa ON m.machine_id = fa.machine_id AND DATE(fa.date_created) = $1
        ORDER BY m.machine_id, fa.date_created DESC
      `,
        [selectedDate],
      );

      return {
        ok: true,
        devices: result.rows,
        selectedDate,
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
          air_quality,
          carbon_monoxide,
          combustible_gases,
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
