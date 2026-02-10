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
      weight_kg: number;
      nitrogen: number;
      phosphorus: number;
      potassium: number;
      mq135: number;
      soil_moisture: number;
      temperature: number;
      humidity: number;
      reed_switch: number;
      ph: number;
      methane: number;
      hydrogen: number;
      benzene: number;
    },
  ) {
    const client = this.databaseService.getClient();
    try {
      this.logger.log(`Received sensor data from machine: ${data.machine_id}`);

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
          hydrogen,
          smoke,
          benzene,
          weight_kg,
          reed_switch
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          data.user_id,
          data.machine_id,
          data.nitrogen.toString(),
          data.phosphorus.toString(),
          data.potassium.toString(),
          data.temperature.toString(),
          data.ph.toString(),
          data.humidity.toString(),
          data.soil_moisture.toString(),
          data.methane.toString(),
          data.hydrogen.toString(),
          data.mq135.toString(), // Mapping mq135 to smoke column as it's a gas sensor
          data.benzene.toString(),
          data.weight_kg.toString(),
          data.reed_switch.toString(),
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
