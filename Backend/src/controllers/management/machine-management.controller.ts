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
          uc.customer_id as user_id,
          uc.first_name,
          uc.last_name,
          uc.email
         FROM machines m
         LEFT JOIN machine_customers mc ON m.machine_id = mc.machine_id
         LEFT JOIN user_customer uc ON mc.customer_id = uc.customer_id
         ORDER BY m.machine_id`,
      );

      return {
        ok: true,
        machines: result.rows,
      };
    } catch {
      throw new InternalServerErrorException('Failed to fetch machines list');
    }
  }

  @Get(':machineId')
  async getMachineDetails(@Param('machineId') machineId: string) {
    const client = this.databaseService.getClient();

    try {
      // Get machine owner info
      const machineResult = await client.query(
        `SELECT 
          m.machine_id,
          mc.customer_id as user_id,
          uc.first_name,
          uc.last_name,
          uc.email,
          m.C1, m.C2, m.C3, m.C4, m.C5,
          m.S1, m.S2, m.S3, m.S4, m.S5, m.S6, m.S7, m.S8, m.S9,
          m.M1, m.M2, m.M3, m.M4, m.M5, m.M6, m.M7
         FROM machines m
         LEFT JOIN machine_customers mc ON m.machine_id = mc.machine_id
         LEFT JOIN user_customer uc ON mc.customer_id = uc.customer_id
         WHERE m.machine_id = $1
         LIMIT 1`,
        [machineId],
      );

      if (machineResult.rows.length === 0) {
        throw new NotFoundException('Machine not found');
      }

      const machineInfo = machineResult.rows[0] as {
        machine_id: string;
        user_id: string | null;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
      };

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
          hydrogen,
          smoke,
          benzene,
          date_created
         FROM fertilizer_analytics
         WHERE machine_id = $1
         ORDER BY date_created DESC
         LIMIT 10`,
        [machineId],
      );

      // Get module analytics (error diagnostics)
      const moduleResult = await client.query(
        `SELECT 
          esp32,
          arduino_q,
          arduino_r3,
          ultrasonic,
          reed,
          moisture,
          temperature,
          humidity,
          gas,
          ph,
          npk,
          camera_1,
          camera_2,
          stepper_motor,
          heating_pad,
          exhaust_fan,
          dc_motor,
          grinder_motor,
          power_supply,
          servo_motor,
          date_created
         FROM module_analytics
        WHERE user_id = $1
        ORDER BY date_created DESC
        LIMIT 10`,
        [machineInfo.user_id],
      );

      // Calculate error rate from module analytics
      let errorRate = 0;
      if (moduleResult.rows.length > 0) {
        const latestModule = moduleResult.rows[0] as Record<string, unknown>;
        const totalModules = 20; // Total number of modules
        let workingModules = 0;

        Object.keys(latestModule).forEach((key) => {
          if (key !== 'date_created' && latestModule[key] === true) {
            workingModules++;
          }
        });

        errorRate = ((totalModules - workingModules) / totalModules) * 100;
      }

      return {
        ok: true,
        machine: {
          ...machineInfo,
          fertilizer_analytics: fertilizerResult.rows,
          module_analytics: moduleResult.rows,
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
}
