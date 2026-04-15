import {
  Controller,
  Get,
  Param,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';

type MachineRow = {
  machine_id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  [key: string]: string | number | boolean | null;
};

type AnalyticsRow = {
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  temperature: number | null;
  ph: number | null;
  humidity: number | null;
  moisture: number | null;
  methane: number | null;
  air_quality: number | null;
  carbon_monoxide: number | null;
  combustible_gases: number | null;
  weight_kg: number | null;
  reed_switch: boolean | null;
  date_created: Date | null;
};

@Controller('management/machines')
export class MachineManagementController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getAllMachines() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<MachineRow>(
        `SELECT 
          m.machine_id,
          m.firmware_version,
          m.update_status,
          m.is_active,
          m.wifi_ssid,
          m.ip_address,
          m.last_seen,
          uc.customer_id as user_id,
          uc.first_name,
          uc.last_name,
          uc.email,
          CASE 
            WHEN uc.first_name IS NULL AND uc.last_name IS NULL THEN 'No Owner'
            ELSE TRIM(CONCAT(uc.first_name, ' ', uc.last_name))
          END as machine_name
         FROM machines m
         LEFT JOIN machine_customers mc ON m.machine_id = mc.machine_id
         LEFT JOIN user_customer uc ON mc.customer_id = uc.customer_id
         ORDER BY m.machine_id, uc.first_name`,
      );

      const machines = result.rows.map((machine) => {
        const lastSeen = machine.last_seen
          ? new Date(machine.last_seen as string)
          : null;
        const now = new Date();
        const isOffline =
          !lastSeen || now.getTime() - lastSeen.getTime() > 5 * 60 * 1000; // 5 minutes threshold

        return {
          ...machine,
          wifi_ssid: isOffline
            ? 'Offline'
            : machine.wifi_ssid || 'Not Connected',
          ip_address: isOffline ? 'Offline' : machine.ip_address || '0.0.0.0',
        };
      });

      return {
        ok: true,
        machines: machines,
      };
    } catch {
      throw new InternalServerErrorException('Failed to fetch machines list');
    }
  }

  @Get(':machineId')
  async getMachineDetails(@Param('machineId') machineId: string) {
    const client = this.databaseService.getClient();

    try {
      // Get all users associated with the machine and the machine details
      const machineResult = await client.query<MachineRow>(
        `SELECT 
          m.machine_id,
          m.is_active,
          m.last_seen,
          m.firmware_version,
          m.wifi_ssid,
          m.ip_address,
          m.update_status,
          mc.customer_id as user_id,
          uc.first_name,
          uc.last_name,
          uc.email,
          m.c1, m.c2, m.c3, m.c4,
          m.s1, m.s2, m.s3, m.s4, m.s5, m.s6, m.s7, m.s8, m.s9, m.s10, m.s11,
          m.m1, m.m2, m.m3, m.m4, m.m5
         FROM machines m
         LEFT JOIN machine_customers mc ON m.machine_id = mc.machine_id
         LEFT JOIN user_customer uc ON mc.customer_id = uc.customer_id
         WHERE m.machine_id = $1`,
        [machineId],
      );

      if (machineResult.rows.length === 0) {
        throw new NotFoundException('Machine not found');
      }

      // Extract machine info from the first row and all users
      const machineRow = machineResult.rows[0];
      const lastSeen = machineRow.last_seen
        ? new Date(machineRow.last_seen as string)
        : null;
      const now = new Date();
      const isOffline =
        !lastSeen || now.getTime() - lastSeen.getTime() > 5 * 60 * 1000; // 5 minutes threshold

      const machineInfo = {
        ...machineRow,
        wifi_ssid: isOffline
          ? 'Offline'
          : machineRow.wifi_ssid || 'Not Connected',
        ip_address: isOffline ? 'Offline' : machineRow.ip_address || '0.0.0.0',
      };
      const users = machineResult.rows
        .filter((row) => row.user_id)
        .map((row) => ({
          user_id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
        }));

      // Get fertilizer analytics (NPK data)
      const fertilizerResult = await client.query(
        `SELECT 
          nitrogen,
          phosphorus,
          potassium,
          temperature,
          ph,
          humidity,
          moisture,
          methane,
          air_quality,
          carbon_monoxide,
          combustible_gases,
          weight_kg,
          reed_switch,
          date_created
         FROM fertilizer_analytics
         WHERE machine_id = $1
         ORDER BY date_created DESC`,
        [machineId],
      );

      // Calculate component status from machines table
      const machineComponents = machineInfo as Record<string, any>;
      let workingComponents = 0;
      let totalComponents = 0;

      // Count microcontrollers (c1-c4)
      for (let i = 1; i <= 4; i++) {
        const key = `c${i}`;
        totalComponents++;
        if (machineComponents[key] === true) {
          workingComponents++;
        }
      }

      // Count sensors (s1-s11)
      for (let i = 1; i <= 11; i++) {
        const key = `s${i}`;
        totalComponents++;
        if (machineComponents[key] === true) {
          workingComponents++;
        }
      }

      // Count motors (m1-m5)
      for (let i = 1; i <= 5; i++) {
        const key = `m${i}`;
        totalComponents++;
        if (machineComponents[key] === true) {
          workingComponents++;
        }
      }

      const errorRate =
        ((totalComponents - workingComponents) / totalComponents) * 100;

      return {
        ok: true,
        machine: {
          ...machineInfo,
          users,
          fertilizer_analytics: fertilizerResult.rows as unknown,
          error_rate: errorRate.toFixed(2),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch machine details');
    }
  }

  @Get(':machineId/latest-analytics')
  async getMachineLatestAnalytics(@Param('machineId') machineId: string) {
    const client = this.databaseService.getClient();

    try {
      // Get the latest fertilizer analytics entry for the machine
      const result = await client.query<AnalyticsRow>(
        `SELECT 
          nitrogen,
          phosphorus,
          potassium,
          temperature,
          ph,
          humidity,
          moisture,
          methane,
          air_quality,
          carbon_monoxide,
          combustible_gases,
          weight_kg,
          reed_switch,
          date_created
         FROM fertilizer_analytics
         WHERE machine_id = $1
         ORDER BY date_created DESC
         LIMIT 1`,
        [machineId],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('No analytics data found for this machine');
      }

      return {
        ok: true,
        data: result.rows[0],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch latest analytics',
      );
    }
  }
}
