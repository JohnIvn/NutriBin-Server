import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../service/database/database.service';

type AnnouncementRow = {
  announcement_id: string;
  title: string;
  body: string;
  author: string | null;
  priority: string | null;
  notified: string[] | null;
  date_published: string | null;
  is_active: boolean;
  date_created: string;
};

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async listAnnouncements() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<AnnouncementRow>(
        `SELECT announcement_id, title, body, author, priority, notified, date_published, is_active, date_created
         FROM announcements
         WHERE is_active = true
         ORDER BY COALESCE(date_published::timestamptz, date_created) DESC
         LIMIT 100`,
      );

      return {
        ok: true,
        announcements: result.rows,
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch announcements');
    }
  }

  @Post()
  async createAnnouncement(
    @Body()
    body: {
      title?: string;
      body?: string;
      author?: string | null;
      priority?: 'high' | 'medium' | 'low' | null;
      notified?: string[] | null;
      date_published?: string | null;
    },
  ) {
    if (!body || !body.title || !body.body) {
      throw new BadRequestException('title and body are required');
    }

    const client = this.databaseService.getClient();

    try {
      const result = await client.query<AnnouncementRow>(
        `INSERT INTO announcements (title, body, author, priority, notified, date_published, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING announcement_id, title, body, author, priority, notified, date_published, is_active, date_created`,
        [
          body.title.trim(),
          body.body.trim(),
          body.author || null,
          body.priority || 'medium',
          body.notified || [],
          body.date_published || null,
        ],
      );

      return {
        ok: true,
        announcement: result.rows[0],
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to create announcement');
    }
  }

  @Patch(':id')
  async updateAnnouncement(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      body?: string;
      author?: string | null;
      priority?: 'high' | 'medium' | 'low' | null;
      notified?: string[] | null;
      date_published?: string | null;
      is_active?: boolean;
    },
  ) {
    if (!id) throw new BadRequestException('id is required');

    const client = this.databaseService.getClient();

    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (body.title !== undefined) {
        updates.push(`title = $${updates.length + 1}`);
        values.push(body.title?.trim() ?? null);
      }
      if (body.body !== undefined) {
        updates.push(`body = $${updates.length + 1}`);
        values.push(body.body?.trim() ?? null);
      }
      if (body.author !== undefined) {
        updates.push(`author = $${updates.length + 1}`);
        values.push(body.author ?? null);
      }
      if (body.priority !== undefined) {
        updates.push(`priority = $${updates.length + 1}`);
        values.push(body.priority ?? 'medium');
      }
      if (body.notified !== undefined) {
        updates.push(`notified = $${updates.length + 1}`);
        values.push(body.notified ?? []);
      }
      if (body.date_published !== undefined) {
        updates.push(`date_published = $${updates.length + 1}`);
        values.push(body.date_published ?? null);
      }
      if (body.is_active !== undefined) {
        updates.push(`is_active = $${updates.length + 1}`);
        values.push(body.is_active);
      }

      if (updates.length === 0) {
        throw new BadRequestException('No fields provided to update');
      }

      const query = `UPDATE announcements SET ${updates.join(', ')}, date_created = date_created WHERE announcement_id = $${
        updates.length + 1
      } RETURNING announcement_id, title, body, author, priority, notified, date_published, is_active, date_created`;

      const result = await client.query(query, [...values, id]);

      if (!result.rowCount)
        throw new NotFoundException('Announcement not found');

      return {
        ok: true,
        announcement: result.rows[0],
      };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      )
        throw err;
      throw new InternalServerErrorException('Failed to update announcement');
    }
  }

  @Delete(':id')
  async deleteAnnouncement(@Param('id') id: string) {
    if (!id) throw new BadRequestException('id is required');

    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `UPDATE announcements SET is_active = false WHERE announcement_id = $1 RETURNING announcement_id`,
        [id],
      );

      if (!result.rowCount)
        throw new NotFoundException('Announcement not found');

      return { ok: true };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete announcement');
    }
  }
}
