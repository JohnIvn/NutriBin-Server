import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';

@Controller('management/status')
export class StatusController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('active-machines')
  async getActiveMachines() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `SELECT
           COUNT(*)::int AS total_count,
           COUNT(*) FILTER (WHERE is_active IS TRUE)::int AS active_count
         FROM machines`,
      );

      const row = result.rows[0] as Record<string, unknown>;

      const total =
        typeof row.total_count === 'string'
          ? parseInt(row.total_count, 10)
          : (row.total_count as number);
      const active =
        typeof row.active_count === 'string'
          ? parseInt(row.active_count, 10)
          : (row.active_count as number);

      const percent = total === 0 ? 0 : Math.round((active / total) * 100);

      return {
        ok: true,
        status: {
          active_machines: active,
          total_machines: total,
          percent_active: percent,
        },
      };
    } catch (error) {
      console.error('Failed to fetch machine status', error);
      throw new InternalServerErrorException('Failed to fetch machine status');
    }
  }
}
