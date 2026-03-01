import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ThingSpeakService {
  private readonly logger = new Logger(ThingSpeakService.name);
  private readonly baseUrl = 'https://api.thingspeak.com';

  /**
   * Updates a ThingSpeak channel with sensor data.
   * ThingSpeak fields (field1 to field8) should be mapped according to your channel configuration.
   */
  async updateChannel(
    apiKey: string,
    data: Record<string, string | number | boolean | undefined>,
  ) {
    try {
      if (!apiKey) {
        this.logger.warn('ThingSpeak API Key is missing for this update');
        return;
      }

      // Construct a query string for fields
      // Example mapping: nitrogen -> field1, phosphorus -> field2, etc.
      const params = new URLSearchParams();
      params.append('api_key', apiKey);

      if (data.nitrogen !== undefined)
        params.append('field1', String(data.nitrogen));
      if (data.phosphorus !== undefined)
        params.append('field2', String(data.phosphorus));
      if (data.potassium !== undefined)
        params.append('field3', String(data.potassium));
      if (data.temperature !== undefined)
        params.append('field4', String(data.temperature));
      if (data.ph !== undefined) params.append('field5', String(data.ph));
      if (data.humidity !== undefined)
        params.append('field6', String(data.humidity));
      if (data.soil_moisture !== undefined)
        params.append('field7', String(data.soil_moisture));
      if (data.weight_kg !== undefined)
        params.append('field8', String(data.weight_kg));

      const url = `${this.baseUrl}/update?${params.toString()}`;

      this.logger.log(`Updating ThingSpeak channel...`);
      const response = await axios.get<number | string>(url);

      if (response.data === 0 || response.data === '0') {
        this.logger.warn(
          'ThingSpeak update failed (returned 0). Check API key or rate limits.',
        );
      } else {
        this.logger.log(
          `ThingSpeak update successful, entry ID: ${String(response.data)}`,
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating ThingSpeak: ${errorMessage}`);
    }
  }
}
