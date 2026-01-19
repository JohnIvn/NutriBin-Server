import {
  Controller,
  Get,
  Param,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';

@Controller('management/machine-health')
export class MachineHealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get(':machineId')
  async getMachineHealth(@Param('machineId') machineId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `SELECT
          m.machine_id,
          m.c1, m.c2, m.c3, m.c4, m.c5,
          m.s1, m.s2, m.s3, m.s4, m.s5, m.s6, m.s7, m.s8, m.s9,
          m.m1, m.m2, m.m3, m.m4, m.m5, m.m6, m.m7
         FROM machines m
         WHERE m.machine_id = $1
         LIMIT 1`,
        [machineId],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('Machine not found');
      }

      const row = result.rows[0] as Record<string, unknown>;

      const componentKeys = [
        'c1',
        'c2',
        'c3',
        'c4',
        'c5',
        's1',
        's2',
        's3',
        's4',
        's5',
        's6',
        's7',
        's8',
        's9',
        'm1',
        'm2',
        'm3',
        'm4',
        'm5',
        'm6',
        'm7',
      ];

      const total = componentKeys.length;
      let errorCount = 0;
      const components: Record<string, boolean | null> = {};

      for (const key of componentKeys) {
        const val = row[key];
        // treat multiple representations of true as an error: boolean true, 't', 'true', 1, '1'
        let isError = false;
        if (val === true) isError = true;
        else if (val !== null && val !== undefined) {
          const s = String(val).toLowerCase();
          if (s === 'true' || s === 't' || s === '1') isError = true;
        }

        components[key] = isError;
        if (isError) errorCount++;
      }

      const errorRate = total === 0 ? 0 : (errorCount / total) * 100;

      return {
        ok: true,
        health: {
          machine_id: row.machine_id,
          error_rate: errorRate.toFixed(2),
          total_components: total,
          error_count: errorCount,
          components,
          raw: row,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to compute machine health',
      );
    }
  }
}
