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
}
