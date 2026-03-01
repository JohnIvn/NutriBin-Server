import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MachinesMonitorService {
  private readonly logger = new Logger(MachinesMonitorService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  // Log when the service is instantiated to ensure scheduler is registered
  onModuleInit() {
    this.logger.log('MachinesMonitorService initialized');
  }

  // Run every 10 seconds and mark machines inactive if no data for 20s
  @Interval(10000)
  async checkMachines() {
    this.logger.debug('checkMachines triggered');
    const client = this.databaseService.getClient();
    if (!client) {
      this.logger.warn('Database client not available yet, skipping check');
      return;
    }
    try {
      const res = await client.query(
        `UPDATE machines SET is_active = false
         WHERE is_active = true
           AND (last_seen IS NULL OR last_seen < now() - INTERVAL '20 seconds')
         RETURNING machine_id`,
      );

      const count = res.rowCount ?? 0;
      if (count > 0) {
        this.logger.log(`Marked ${count} machine(s) inactive`);
      }
    } catch (error) {
      this.logger.error('Error checking machines activity:', error);
    }
  }
}
