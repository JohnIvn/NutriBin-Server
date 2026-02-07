import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { DatabaseService } from '../service/database/database.service';

@Controller('camera-logs')
export class CameraLogsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getCameraLogs(@Query('limit') limit = 50) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(
        `
        SELECT 
          cl.camera_log_id,
          cl.machine_id,
          cl.details,
          cl.classification,
          cl.date_created,
          uc.first_name,
          uc.last_name
        FROM camera_logs cl
        LEFT JOIN user_customer uc ON cl.customer_id = uc.customer_id
        ORDER BY cl.date_created DESC
        LIMIT $1
      `,
        [limit],
      );

      return {
        ok: true,
        logs: result.rows,
      };
    } catch (error) {
      console.error('Camera Logs Fetch Error:', error);
      throw new InternalServerErrorException('Failed to fetch camera logs');
    }
  }

  @Get('summary')
  async getSummary() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(`
        SELECT 
          classification,
          COUNT(*) as count
        FROM camera_logs
        GROUP BY classification
      `);

      return {
        ok: true,
        summary: result.rows,
      };
    } catch (error) {
      console.error('Camera Summary Error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch camera log summary',
      );
    }
  }
}
