import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { DatabaseService } from './database.service';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = this.databaseService.getClient();
      await client.query('SELECT 1');
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Database Check failed',
        this.getStatus(key, false, { message: error.message }),
      );
    }
  }
}
