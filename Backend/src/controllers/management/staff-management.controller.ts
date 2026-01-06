import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';

type StaffPublicRow = {
  staff_id: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  address: string | null;
  email: string;
  date_created: string;
  last_updated: string;
  status: string;
};

@Controller('management/staff')
export class StaffManagementController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getAllStaff() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<StaffPublicRow>(
        `SELECT staff_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status
				 FROM user_staff
				 ORDER BY date_created DESC`,
      );

      return {
        ok: true,
        staff: result.rows,
      };
    } catch {
      throw new InternalServerErrorException('Failed to fetch staff list');
    }
  }

  @Put(':id')
  async updateStaff(@Param('id') staffId: string, @Body() updateData: any) {
    const client = this.databaseService.getClient();

    try {
      const {
        firstname,
        lastname,
        email,
        birthday,
        age,
        contact,
        address,
        gender,
      } = updateData;

      // Validate required fields
      if (!firstname || !lastname || !email) {
        throw new BadRequestException(
          'First name, last name, and email are required',
        );
      }

      // Update the staff record
      const result = await client.query<StaffPublicRow>(
        `UPDATE user_staff 
         SET first_name = $1, 
             last_name = $2, 
             email = $3, 
             birthday = $4, 
             age = $5, 
             contact_number = $6, 
             address = $7,
             last_updated = NOW()
         WHERE staff_id = $8
         RETURNING staff_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status`,
        [firstname, lastname, email, birthday, age, contact, address, staffId],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Staff member not found');
      }

      return {
        ok: true,
        staff: result.rows[0],
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update staff member');
    }
  }
}
