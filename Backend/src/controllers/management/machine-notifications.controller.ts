import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { DatabaseService } from '../../service/database/database.service';

@Controller('management/machine-notifications')
export class MachineNotificationsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getAllNotifications() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(`
        SELECT 
          mn.notification_id,
          mn.machine_id,
          mn.header,
          mn.subheader,
          mn.type,
          mn.description,
          mn.date,
          mn.resolved,
          mn.date_created
        FROM machine_notifications mn
        ORDER BY mn.date DESC
      `);
      return {
        ok: true,
        notifications: result.rows,
      };
    } catch (error) {
      console.error('Failed to fetch machine notifications', error);
      throw new InternalServerErrorException(
        'Failed to fetch machine notifications',
      );
    }
  }

  @Patch(':id/resolve')
  async resolveNotification(
    @Param('id') id: string,
    @Body('resolved') resolved: boolean,
  ) {
    const client = this.databaseService.getClient();
    try {
      await client.query(
        'UPDATE machine_notifications SET resolved = $1 WHERE notification_id = $2',
        [resolved, id],
      );
      return { ok: true };
    } catch (error) {
      console.error('Failed to update notification', error);
      throw new InternalServerErrorException('Failed to update notification');
    }
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    const client = this.databaseService.getClient();
    try {
      await client.query(
        'DELETE FROM machine_notifications WHERE notification_id = $1',
        [id],
      );
      return { ok: true };
    } catch (error) {
      console.error('Failed to delete notification', error);
      throw new InternalServerErrorException('Failed to delete notification');
    }
  }
}
