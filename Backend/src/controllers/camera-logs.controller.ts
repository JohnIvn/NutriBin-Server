import {
  Controller,
  Get,
  Post,
  Body,
  InternalServerErrorException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../service/database/database.service';

interface CameraLog {
  camera_log_id: string;
  machine_id: string;
  user_id: string;
  customer_id: string;
  classification: string;
  details: string;
  date_created: Date;
}

// Map detected objects to valid classification sizes
const classificationMap: { [key: string]: string } = {
  // Large objects
  bed: 'large',
  table: 'large',
  couch: 'large',
  sofa: 'large',
  desk: 'large',
  wardrobe: 'large',
  cabinet: 'large',
  refrigerator: 'large',
  // Medium objects
  chair: 'medium',
  box: 'medium',
  bag: 'medium',
  container: 'medium',
  // Small objects
  cup: 'small',
  bottle: 'small',
  phone: 'small',
  book: 'small',
  pen: 'small',
  key: 'small',
};

function mapClassification(objectType: string): string {
  const normalized = objectType.toLowerCase().trim();
  return classificationMap[normalized] || 'N/A';
}

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

  @Post()
  async createCameraLog(
    @Body()
    body: {
      machine_id: string;
      user_id: string;
      customer_id?: string;
      classification: string;
      details: any;
    },
  ) {
    const client = this.databaseService.getClient();
    try {
      if (!body.machine_id || !body.user_id || !body.classification) {
        throw new BadRequestException(
          'Missing required fields: machine_id, user_id, classification',
        );
      }

      const mappedClassification = mapClassification(body.classification);

      const result = await client.query<CameraLog>(
        `
        INSERT INTO camera_logs 
          (machine_id, user_id, customer_id, classification, details, date_created)
        VALUES 
          ($1, $2, $3, $4, $5, now())
        RETURNING *
        `,
        [
          body.machine_id,
          body.user_id,
          body.customer_id || body.user_id,
          mappedClassification,
          JSON.stringify(body.details),
        ],
      );

      return {
        ok: true,
        log: result.rows[0],
      };
    } catch (error) {
      console.error('Camera Log Creation Error:', error);
      throw new InternalServerErrorException('Failed to create camera log');
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
