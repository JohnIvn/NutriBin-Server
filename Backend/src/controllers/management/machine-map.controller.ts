import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../service/database/database.service';

@Controller('management/machine-map')
export class MachineMapController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getMachineMapData() {
    const client = this.databaseService.getClient();

    try {
      const query = `
        SELECT 
          m.machine_id,
          m.c1, m.c2, m.c3, m.c4, m.c5,
          m.s1, m.s2, m.s3, m.s4, m.s5, m.s6, m.s7, m.s8, m.s9,
          m.m1, m.m2, m.m3, m.m4, m.m5, m.m6, m.m7,
          uc.customer_id,
          uc.first_name,
          uc.last_name,
          uc.address,
          (SELECT COUNT(*) FROM repair r WHERE r.machine_id = m.machine_id AND r.repair_status IN ('active', 'accepted'))::int > 0 as has_repair_ticket
        FROM machines m
        LEFT JOIN machine_customers mc ON m.machine_id = mc.machine_id
        LEFT JOIN user_customer uc ON mc.customer_id = uc.customer_id
        WHERE uc.address IS NOT NULL
      `;

      const result = await client.query(query);

      const machinesMap = new Map<string, any>();

      for (const row of result.rows) {
        // Calculate health from components
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

        let hasError = false;
        for (const key of componentKeys) {
          const val = row[key];
          if (
            val === true ||
            val === 't' ||
            val === 'true' ||
            val === 1 ||
            val === '1'
          ) {
            hasError = true;
            break;
          }
        }

        const isHealthy = !hasError && !row.has_repair_ticket;

        if (!machinesMap.has(row.machine_id)) {
          machinesMap.set(row.machine_id, {
            machine_id: row.machine_id,
            status: isHealthy ? 'healthy' : 'needs_repair',
            locations: [],
          });
        }

        const machine = machinesMap.get(row.machine_id);
        machine.locations.push({
          customer_id: row.customer_id,
          customer_name: `${row.first_name} ${row.last_name}`,
          address: row.address,
        });
      }

      // Add hasMultipleLocations flag
      const machines = Array.from(machinesMap.values()).map((m) => ({
        ...m,
        hasMultipleLocations: m.locations.length > 1,
      }));

      return {
        ok: true,
        data: machines,
      };
    } catch (error) {
      console.error('Error fetching machine map data:', error);
      throw new InternalServerErrorException(
        'Failed to fetch machine map data',
      );
    }
  }
}
