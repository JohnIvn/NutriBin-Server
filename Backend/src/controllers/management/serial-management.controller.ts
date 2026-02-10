import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../service/database/database.service';

@Controller('management/serials')
export class SerialManagementController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getAllSerials() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `SELECT 
          ms.machine_serial_id,
          ms.serial_number,
          ms.is_used,
          ms.is_active,
          ms.date_created,
          m.machine_id
         FROM machine_serial ms
         LEFT JOIN machines m ON ms.machine_serial_id = m.machine_id
         ORDER BY ms.date_created DESC`,
      );

      return {
        ok: true,
        serials: result.rows,
      };
    } catch {
      throw new InternalServerErrorException('Failed to fetch serials list');
    }
  }

  @Post()
  async createSerial(
    @Body()
    body: {
      serial_number?: string;
    },
  ) {
    const client = this.databaseService.getClient();

    if (!body?.serial_number || body.serial_number.trim() === '') {
      throw new BadRequestException('Serial number is required');
    }

    try {
      const serialNumber = String(body.serial_number).trim();

      // Check if serial already exists
      const existingSerial = await client.query(
        'SELECT * FROM machine_serial WHERE serial_number = $1',
        [serialNumber],
      );

      if (existingSerial.rows.length > 0) {
        throw new BadRequestException('Serial number already exists');
      }

      // Insert new serial
      const result = await client.query(
        `INSERT INTO machine_serial (serial_number, is_used, is_active, date_created)
         VALUES ($1, $2, $3, NOW())
         RETURNING machine_serial_id, serial_number, is_used, is_active, date_created`,
        [serialNumber, false, true],
      );

      return {
        ok: true,
        message: 'Serial created successfully',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        serial: result.rows[0],
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create serial');
    }
  }

  @Patch(':id')
  async updateSerial(
    @Param('id') id: string,
    @Body()
    body: {
      is_active?: boolean;
    },
  ) {
    const client = this.databaseService.getClient();

    try {
      // Check if serial exists
      const existingSerial = await client.query(
        'SELECT * FROM machine_serial WHERE machine_serial_id = $1',
        [id],
      );

      if (existingSerial.rows.length === 0) {
        throw new NotFoundException('Serial not found');
      }

      // Update serial
      const result = await client.query(
        `UPDATE machine_serial 
         SET is_active = $1
         WHERE machine_serial_id = $2
         RETURNING machine_serial_id, serial_number, is_used, is_active, date_created`,
        [body.is_active, id],
      );

      return {
        ok: true,
        message: 'Serial updated successfully',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        serial: result.rows[0],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update serial');
    }
  }

  @Delete(':id')
  async deleteSerial(@Param('id') id: string) {
    const client = this.databaseService.getClient();

    try {
      // Check if serial exists
      const existingSerial = await client.query(
        'SELECT * FROM machine_serial WHERE machine_serial_id = $1',
        [id],
      );

      if (existingSerial.rows.length === 0) {
        throw new NotFoundException('Serial not found');
      }

      // Delete serial
      await client.query(
        'DELETE FROM machine_serial WHERE machine_serial_id = $1',
        [id],
      );

      return {
        ok: true,
        message: 'Serial deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete serial');
    }
  }
}
