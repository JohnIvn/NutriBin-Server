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
  async getCameraLogs(
    @Query('limit') limit = 100,
    @Query('classification') classification?: string,
  ) {
    const client = this.databaseService.getClient();
    try {
      let query = `
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
      `;

      const params: any[] = [limit];
      if (classification && classification !== 'all') {
        query += ` WHERE cl.classification = $2`;
        params.push(classification);
      }

      query += ` ORDER BY cl.date_created DESC LIMIT $1`;

      const result = await client.query(query, params);

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
      const summaryResult = await client.query(`
        SELECT 
          classification,
          COUNT(*) as count
        FROM camera_logs
        GROUP BY classification
      `);

      const trendResult = await client.query(`
        SELECT 
          DATE_TRUNC('day', date_created) as date,
          COUNT(*) as count
        FROM camera_logs
        WHERE date_created > NOW() - INTERVAL '7 days'
        GROUP BY DATE_TRUNC('day', date_created)
        ORDER BY date ASC
      `);

      return {
        ok: true,
        summary: summaryResult.rows,
        trends: trendResult.rows,
      };
    } catch (error) {
      console.error('Camera Summary Error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch camera log summary',
      );
    }
  }
}
