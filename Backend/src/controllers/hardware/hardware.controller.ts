import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../service/database/database.service';

@Controller('hardware')
export class HardwareController {
  private readonly logger = new Logger(HardwareController.name);

  constructor(private readonly databaseService: DatabaseService) {}

  @Post('sensor-data')
  async receiveSensorData(
    @Body()
    data: {
      user_id: string;
      machine_id: string;
      weight_kg?: number | string;
      nitrogen?: number | string;
      phosphorus?: number | string;
      potassium?: number | string;
      mq135?: number | string;
      soil_moisture?: number | string;
      temperature?: number | string;
      humidity?: number | string;
      reed_switch?: number | string;
      ph?: number | string;
      methane?: number | string;
      air_quality?: number | string;
      combustible_gases?: number | string;
      ultrasonic?: number | string;
    },
  ) {
    const client = this.databaseService.getClient();
    try {
      this.logger.log(`Received sensor data from machine: ${data.machine_id}`);

      // Resolve the machine_id to the customer's UUID via machine_customers
      const customerQuery = await client.query<{ customer_id: string }>(
        `SELECT customer_id FROM machine_customers WHERE machine_id = $1`,
        [data.machine_id],
      );

      if (customerQuery.rows.length === 0) {
        this.logger.warn(
          `No customer found for machine_id: ${data.machine_id}`,
        );
        throw new InternalServerErrorException(
          'No customer linked to this serial',
        );
      }

      const resolvedUserId = customerQuery.rows[0].customer_id;

      await client.query(
        `INSERT INTO fertilizer_analytics (
          user_id, 
          machine_id, 
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
          reed_switch
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          resolvedUserId,
          data.machine_id,
          (data.nitrogen ?? 0).toString(),
          (data.phosphorus ?? 0).toString(),
          (data.potassium ?? 0).toString(),
          (data.temperature ?? 0).toString(),
          (data.ph ?? 0).toString(),
          (data.humidity ?? 0).toString(),
          (data.soil_moisture ?? 0).toString(),
          (data.methane ?? 0).toString(),
          (data.air_quality ?? 0).toString(),
          (data.mq135 ?? 0).toString(),
          (data.combustible_gases ?? 0).toString(),
          (data.weight_kg ?? 0).toString(),
          (data.reed_switch ?? 0).toString(),
        ],
      );

      return {
        ok: true,
        message: 'Data saved successfully',
      };
    } catch (error) {
      this.logger.error('Error saving sensor data:', error);
      throw new InternalServerErrorException('Failed to save sensor data');
    }
  }

  @Post('status')
  async receiveStatus(
    @Body()
    data: {
      user_id: string;
      machine_id: string;
      npk_active?: boolean;
      weight_active?: boolean;
      mq135_active?: boolean;
      mq2_active?: boolean;
      mq4_active?: boolean;
      mq7_active?: boolean;
      soil_moisture_active?: boolean;
      dht_active?: boolean;
      reed_switch_active?: boolean;
      ph_active?: boolean;
    },
  ) {
    const client = this.databaseService.getClient();

    try {
      this.logger.log(
        `Received hardware status from machine: ${data.machine_id}`,
      );

      // Invert incoming boolean flags (ESP logic inverted).
      // Coerce strings/numbers to boolean so values like "false" are handled.
      const parseBool = (v?: any) => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
          const s = v.trim().toLowerCase();
          return ['true', '1', 't', 'yes', 'y'].includes(s);
        }
        if (typeof v === 'number') return v !== 0;
        return false;
      };

      const invert = (v?: any) => !parseBool(v);

      // Map incoming flags to machines table sensor columns (s1..s10)
      const result = await client.query(
        `UPDATE machines SET
           s1 = $1,
           s2 = $2,
           s3 = $3,
           s4 = $4,
           s5 = $5,
           s6 = $6,
           s7 = $7,
           s8 = $8,
           s9 = $9,
           s10 = $10
         WHERE machine_id = $11`,
        [
          invert(data.npk_active),
          invert(data.weight_active),
          invert(data.mq135_active),
          invert(data.mq2_active),
          invert(data.mq4_active),
          invert(data.mq7_active),
          invert(data.soil_moisture_active),
          invert(data.dht_active),
          invert(data.reed_switch_active),
          invert(data.ph_active),
          data.machine_id,
        ],
      );

      if (result.rowCount === 0) {
        this.logger.warn(
          `No machine row updated for machine_id=${data.machine_id}`,
        );
        throw new InternalServerErrorException(
          'Machine not found or not registered',
        );
      }

      return {
        ok: true,
        message: 'Status updated successfully',
      };
    } catch (error) {
      this.logger.error('Error updating machine status:', error);
      throw new InternalServerErrorException('Failed to update machine status');
    }
  }
}
