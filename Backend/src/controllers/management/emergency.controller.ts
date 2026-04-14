import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';

type EmergencyRow = {
  emergency_id: string;
  user_id: string;
  machine_id: string;
  is_active: boolean;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  date_created: Date;
};

@Controller('management/emergency')
export class EmergencyController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getAllEmergencies() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<EmergencyRow>(
        `SELECT 
          e.emergency_id,
          e.user_id,
          e.machine_id,
          e.is_active,
          uc.first_name,
          uc.last_name,
          uc.email,
          e.date_created
         FROM emergency e
         LEFT JOIN user_customer uc ON e.user_id = uc.customer_id
         ORDER BY e.date_created DESC`,
      );

      return result.rows;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to fetch emergencies: ${errorMessage}`,
      );
    }
  }

  @Get(':id')
  async getEmergencyById(@Param('id') id: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<EmergencyRow>(
        `SELECT 
          e.emergency_id,
          e.user_id,
          e.machine_id,
          e.is_active,
          uc.first_name,
          uc.last_name,
          uc.email,
          e.date_created
         FROM emergency e
         LEFT JOIN user_customer uc ON e.user_id = uc.customer_id
         WHERE e.emergency_id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException(`Emergency with ID ${id} not found`);
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to fetch emergency: ${errorMessage}`,
      );
    }
  }

  @Post()
  async createEmergency(@Body() body: { user_id: string; machine_id: string }) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<{ emergency_id: string }>(
        `INSERT INTO emergency (user_id, machine_id) 
         VALUES ($1, $2)
         RETURNING emergency_id`,
        [body.user_id, body.machine_id],
      );

      return {
        message: 'Emergency created successfully',
        emergency_id: result.rows[0].emergency_id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to create emergency: ${errorMessage}`,
      );
    }
  }

  @Delete(':id')
  async deleteEmergency(@Param('id') id: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `DELETE FROM emergency WHERE emergency_id = $1`,
        [id],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`Emergency with ID ${id} not found`);
      }

      return { message: 'Emergency deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to delete emergency: ${errorMessage}`,
      );
    }
  }
}
