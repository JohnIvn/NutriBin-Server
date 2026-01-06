import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { DatabaseService } from '../../service/database/database.service';

type StaffPublicRow = {
  staff_id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  age: number;
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
        `SELECT staff_id, first_name, last_name, birthday, age, contact_number, address, email, date_created, last_updated, status
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

  @Get('check-email/:email')
  async checkEmailAvailability(@Param('email') email: string) {
    const client = this.databaseService.getClient();

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const result = await client.query(
        'SELECT staff_id FROM user_staff WHERE email = $1 LIMIT 1',
        [normalizedEmail],
      );

      return {
        ok: true,
        available: result.rows.length === 0,
      };
    } catch {
      throw new InternalServerErrorException('Failed to check email');
    }
  }

  @Get('check-phone/:phone')
  async checkPhoneAvailability(@Param('phone') phone: string) {
    const client = this.databaseService.getClient();

    try {
      const normalizedPhone = phone.trim();

      const result = await client.query(
        'SELECT staff_id FROM user_staff WHERE contact_number = $1 LIMIT 1',
        [normalizedPhone],
      );

      return {
        ok: true,
        available: result.rows.length === 0,
      };
    } catch {
      throw new InternalServerErrorException('Failed to check phone number');
    }
  }

  @Post()
  async createStaff(@Body() createData: any) {
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
        password,
      } = createData;

      // Validate required fields
      if (!firstname || !lastname || !email) {
        throw new BadRequestException(
          'First name, last name, and email are required',
        );
      }

      if (!password) {
        throw new BadRequestException('Password is required');
      }

      if (!birthday) {
        throw new BadRequestException('Birthday is required');
      }

      if (age === undefined || age === null) {
        throw new BadRequestException('Age is required');
      }

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();

      // Check if email already exists
      const existing = await client.query(
        'SELECT staff_id FROM user_staff WHERE email = $1',
        [normalizedEmail],
      );

      if (existing.rows.length > 0) {
        throw new ConflictException('Email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create new staff member
      const result = await client.query<StaffPublicRow>(
        `INSERT INTO user_staff (first_name, last_name, birthday, age, contact_number, address, email, password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING staff_id, first_name, last_name, birthday, age, contact_number, address, email, date_created, last_updated, status`,
        [
          firstname.trim(),
          lastname.trim(),
          birthday.trim(),
          age,
          contact?.trim() || null,
          address?.trim() || null,
          normalizedEmail,
          passwordHash,
        ],
      );

      return {
        ok: true,
        staff: result.rows[0],
        message: 'Staff member created successfully',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create staff member');
    }
  }

  @Put(':id')
  async updateStaff(@Param('id') staffId: string, @Body() updateData: any) {
    const client = this.databaseService.getClient();

    try {
      const { firstname, lastname, email, birthday, age, contact, address } =
        updateData;

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
         RETURNING staff_id, first_name, last_name, birthday, age, contact_number, address, email, date_created, last_updated, status`,
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

  @Patch(':id/disable')
  async disableStaff(@Param('id') staffId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<StaffPublicRow>(
        `UPDATE user_staff 
         SET status = 'inactive',
             last_updated = NOW()
         WHERE staff_id = $1
         RETURNING staff_id, first_name, last_name, birthday, age, contact_number, address, email, date_created, last_updated, status`,
        [staffId],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('Staff member not found');
      }

      return {
        ok: true,
        staff: result.rows[0],
        message: 'Staff member disabled successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to disable staff member');
    }
  }

  @Patch(':id/enable')
  async enableStaff(@Param('id') staffId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<StaffPublicRow>(
        `UPDATE user_staff 
         SET status = 'active',
             last_updated = NOW()
         WHERE staff_id = $1
         RETURNING staff_id, first_name, last_name, birthday, age, contact_number, address, email, date_created, last_updated, status`,
        [staffId],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('Staff member not found');
      }

      return {
        ok: true,
        staff: result.rows[0],
        message: 'Staff member enabled successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to enable staff member');
    }
  }

  @Delete(':id')
  async deleteStaff(@Param('id') staffId: string) {
    const client = this.databaseService.getClient();

    try {
      // First check if the staff member exists
      const checkResult = await client.query(
        'SELECT staff_id FROM user_staff WHERE staff_id = $1',
        [staffId],
      );

      if (checkResult.rows.length === 0) {
        throw new NotFoundException('Staff member not found');
      }

      // Delete the staff member
      await client.query('DELETE FROM user_staff WHERE staff_id = $1', [
        staffId,
      ]);

      return {
        ok: true,
        message: 'Staff member deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete staff member');
    }
  }
}
