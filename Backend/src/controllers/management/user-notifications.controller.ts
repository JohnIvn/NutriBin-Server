import {
  Controller,
  Get,
  Post,
  InternalServerErrorException,
  Param,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { DatabaseService } from '../../service/database/database.service';

@Controller('management/user-notifications')
export class UserNotificationsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getAllNotifications() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query<{
        notification_id: string;
        customer_id: string;
        header: string;
        subheader: string;
        type: string;
        description: string;
        date: string;
        resolved: boolean;
        date_created: string;
      }>(`
        SELECT 
          un.notification_id,
          un.customer_id,
          un.header,
          un.subheader,
          un.type,
          un.description,
          un.date,
          un.resolved,
          un.date_created
        FROM user_notifications un
        ORDER BY un.date DESC
      `);
      return {
        ok: true,
        notifications: result.rows,
      };
    } catch (error) {
      console.error('Failed to fetch user notifications', error);
      throw new InternalServerErrorException(
        'Failed to fetch user notifications',
      );
    }
  }

  @Post()
  async createNotification(
    @Body('customer_id') customerId: string,
    @Body('header') header: string,
    @Body('subheader') subheader: string,
    @Body('description') description: string,
    @Body('type') type: string,
  ) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query<{ notification_id: string }>(
        `
        INSERT INTO user_notifications (customer_id, header, subheader, description, type, date, resolved)
        VALUES ($1, $2, $3, $4, $5, NOW(), false)
        RETURNING notification_id
        `,
        [
          customerId,
          header,
          subheader || null,
          description || null,
          type || 'info',
        ],
      );
      return {
        ok: true,
        notification_id: result.rows[0].notification_id,
      };
    } catch (error) {
      console.error('Failed to create user notification', error);
      throw new InternalServerErrorException(
        'Failed to create user notification',
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
        'UPDATE user_notifications SET resolved = $1 WHERE notification_id = $2',
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
        'DELETE FROM user_notifications WHERE notification_id = $1',
        [id],
      );
      return { ok: true };
    } catch (error) {
      console.error('Failed to delete notification', error);
      throw new InternalServerErrorException('Failed to delete notification');
    }
  }
}
