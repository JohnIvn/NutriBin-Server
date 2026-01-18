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
import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';

import { DatabaseService } from '../../service/database/database.service';
import { NodemailerService } from '../../service/email/nodemailer.service';

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
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: NodemailerService,
  ) {}

  private async ensureVerificationTable() {
    const client = this.databaseService.getClient();
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_email_verifications (
        verification_id SERIAL PRIMARY KEY,
        staff_id UUID NOT NULL,
        new_email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

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
  async createStaff(
    @Body()
    createData: {
      firstname?: string;
      lastname?: string;
      email?: string;
      birthday?: string;
      age?: number;
      contact?: string;
      address?: string;
      password?: string;
    },
  ) {
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
  async updateStaff(
    @Param('id') staffId: string,
    @Body()
    updateData: {
      firstname?: string;
      lastname?: string;
      email?: string;
      birthday?: string;
      age?: number;
      contact?: string;
      address?: string;
      emailVerificationCode?: string;
    },
  ) {
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
        emailVerificationCode,
      } = updateData;

      // Validate required fields
      if (!firstname || !lastname || !email) {
        throw new BadRequestException(
          'First name, last name, and email are required',
        );
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Verify staff exists and get current email
      const existingStaff = await client.query<StaffPublicRow>(
        `SELECT staff_id, first_name, last_name, birthday, age, contact_number, address, email, date_created, last_updated, status
         FROM user_staff WHERE staff_id = $1 LIMIT 1`,
        [staffId],
      );

      if (!existingStaff.rowCount) {
        throw new BadRequestException('Staff member not found');
      }

      const currentStaff = existingStaff.rows[0];
      const isEmailChanged = currentStaff.email !== normalizedEmail;

      if (isEmailChanged) {
        // Check email not used by another staff
        const conflictCheck = await client.query(
          'SELECT staff_id FROM user_staff WHERE email = $1 AND staff_id <> $2 LIMIT 1',
          [normalizedEmail, staffId],
        );

        if (conflictCheck.rowCount) {
          throw new ConflictException('Email already exists');
        }

        if (
          !emailVerificationCode ||
          typeof emailVerificationCode !== 'string'
        ) {
          throw new BadRequestException('Email verification code is required');
        }

        if (!/^\d{6}$/.test(emailVerificationCode.trim())) {
          throw new BadRequestException(
            'Email verification code must be a 6-digit number',
          );
        }

        await this.ensureVerificationTable();

        const verification = await client.query(
          `SELECT code, expires_at
           FROM staff_email_verifications
           WHERE staff_id = $1 AND new_email = $2
           ORDER BY created_at DESC
           LIMIT 1`,
          [staffId, normalizedEmail],
        );

        if (!verification.rowCount) {
          throw new BadRequestException(
            'No verification code found for this email',
          );
        }

        const record = verification.rows[0] as {
          code: string;
          expires_at: string;
        };
        const now = new Date();
        const expiresAt = new Date(record.expires_at);

        if (expiresAt < now) {
          throw new BadRequestException('Verification code has expired');
        }

        if (record.code !== emailVerificationCode.trim()) {
          throw new BadRequestException('Invalid verification code');
        }
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
        [
          firstname,
          lastname,
          normalizedEmail,
          birthday,
          age,
          contact,
          address,
          staffId,
        ],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Staff member not found');
      }

      if (isEmailChanged) {
        await client.query(
          'DELETE FROM staff_email_verifications WHERE staff_id = $1 AND new_email = $2',
          [staffId, normalizedEmail],
        );
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

  @Post(':id/email-verification')
  async sendEmailVerification(
    @Param('id') staffId: string,
    @Body('newEmail') newEmail: string,
  ) {
    const client = this.databaseService.getClient();

    if (!newEmail?.trim()) {
      throw new BadRequestException('New email is required');
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    try {
      // Ensure staff exists
      const staffResult = await client.query<StaffPublicRow>(
        `SELECT staff_id, email, first_name FROM user_staff WHERE staff_id = $1 LIMIT 1`,
        [staffId],
      );

      if (!staffResult.rowCount) {
        throw new NotFoundException('Staff member not found');
      }

      const staff = staffResult.rows[0];

      if (staff.email === normalizedEmail) {
        throw new BadRequestException('Email is unchanged');
      }

      // Check for conflicts
      const existingEmail = await client.query(
        'SELECT staff_id FROM user_staff WHERE email = $1 AND staff_id <> $2 LIMIT 1',
        [normalizedEmail, staffId],
      );

      if (existingEmail.rowCount) {
        throw new ConflictException('Email already exists');
      }

      await this.ensureVerificationTable();

      const code = String(randomInt(100000, 1000000));

      // Remove previous codes for this staff + email
      await client.query(
        'DELETE FROM staff_email_verifications WHERE staff_id = $1 AND new_email = $2',
        [staffId, normalizedEmail],
      );

      await client.query(
        `INSERT INTO staff_email_verifications (staff_id, new_email, code, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
        [staffId, normalizedEmail, code],
      );

      await this.mailer.sendMail({
        to: normalizedEmail,
        subject: 'Verify your new NutriBin staff email',
        html: `
          <h2>Email Change Verification</h2>
          <p>Hello ${staff.first_name},</p>
          <p>Use the verification code below to confirm your new email address for your staff profile.</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not request this change, please ignore this email.</p>
          <br />
          <p>Thanks,</p>
          <p>NutriBin Team</p>
        `,
      });

      return {
        ok: true,
        message: 'Verification code sent to the new email address',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to send verification code',
      );
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

  @Patch(':id/ban')
  async banStaff(@Param('id') staffId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<StaffPublicRow>(
        `UPDATE user_staff 
         SET status = 'banned',
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
        message: 'Staff member banned successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to ban staff member');
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
        'SELECT * FROM user_staff WHERE staff_id = $1',
        [staffId],
      );

      if (checkResult.rows.length === 0) {
        throw new NotFoundException('Staff member not found');
      }

      const staff = checkResult.rows[0] as {
        staff_id: string;
        first_name: string;
        last_name: string;
        birthday: string;
        age: number;
        contact_number: string | null;
        address: string | null;
        email: string;
        password: string;
        date_created: string;
        last_updated: string;
        status: string;
      };

      // Move staff to archive table
      await client.query(
        `INSERT INTO user_staff_archive 
         (staff_id, first_name, last_name, birthday, age, contact_number, address, email, password, date_created, last_updated, archive_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12)`,
        [
          staff.staff_id,
          staff.first_name,
          staff.last_name,
          staff.birthday,
          staff.age,
          staff.contact_number,
          staff.address,
          staff.email,
          staff.password,
          staff.date_created,
          staff.last_updated,
          staff.status,
        ],
      );

      // Delete the staff member from active table
      await client.query('DELETE FROM user_staff WHERE staff_id = $1', [
        staffId,
      ]);

      return {
        ok: true,
        message: 'Staff member archived successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to archive staff member');
    }
  }
}
