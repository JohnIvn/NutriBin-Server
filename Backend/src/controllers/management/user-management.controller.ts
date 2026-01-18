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

type UserPublicRow = {
  customer_id: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  address: string | null;
  email: string;
  date_created: string;
  last_updated: string;
  status: string;
};

@Controller('management/users')
export class UserManagementController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: NodemailerService,
  ) {}

  private async ensureVerificationTable() {
    const client = this.databaseService.getClient();
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_email_verifications (
        verification_id SERIAL PRIMARY KEY,
        customer_id UUID NOT NULL,
        new_email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  @Get()
  async getAllUsers() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<UserPublicRow>(
        `SELECT customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status
				 FROM user_customer
				 ORDER BY date_created DESC`,
      );

      return {
        ok: true,
        users: result.rows,
      };
    } catch {
      throw new InternalServerErrorException('Failed to fetch user list');
    }
  }

  @Get('check-email/:email')
  async checkEmailAvailability(@Param('email') email: string) {
    const client = this.databaseService.getClient();

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const result = await client.query(
        'SELECT customer_id FROM user_customer WHERE email = $1 LIMIT 1',
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
        'SELECT customer_id FROM user_customer WHERE contact_number = $1 LIMIT 1',
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
  async createUser(
    @Body()
    createData: {
      firstname?: string;
      lastname?: string;
      email?: string;
      contact?: string;
      address?: string;
      password?: string;
    },
  ) {
    const client = this.databaseService.getClient();

    try {
      const { firstname, lastname, email, contact, address, password } =
        createData;

      // Validate required fields
      if (!firstname || !lastname || !email) {
        throw new BadRequestException(
          'First name, last name, and email are required',
        );
      }

      if (!password) {
        throw new BadRequestException('Password is required');
      }

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();

      // Check if email already exists
      const existing = await client.query(
        'SELECT customer_id FROM user_customer WHERE email = $1',
        [normalizedEmail],
      );

      if (existing.rows.length > 0) {
        throw new ConflictException('Email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create new user
      const result = await client.query<UserPublicRow>(
        `INSERT INTO user_customer (first_name, last_name, contact_number, address, email, password)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status`,
        [
          firstname.trim(),
          lastname.trim(),
          contact?.trim() || null,
          address?.trim() || null,
          normalizedEmail,
          passwordHash,
        ],
      );

      return {
        ok: true,
        user: result.rows[0],
        message: 'User created successfully',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Put(':id')
  async updateUser(
    @Param('id') customerId: string,
    @Body()
    updateData: {
      firstname?: string;
      lastname?: string;
      email?: string;
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

      // Verify user exists and get current email
      const existingUser = await client.query<UserPublicRow>(
        `SELECT customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status
         FROM user_customer WHERE customer_id = $1 LIMIT 1`,
        [customerId],
      );

      if (!existingUser.rowCount) {
        throw new BadRequestException('User not found');
      }

      const currentUser = existingUser.rows[0];
      const isEmailChanged = currentUser.email !== normalizedEmail;

      if (isEmailChanged) {
        // Check email not used by another user
        const conflictCheck = await client.query(
          'SELECT customer_id FROM user_customer WHERE email = $1 AND customer_id <> $2 LIMIT 1',
          [normalizedEmail, customerId],
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
           FROM user_email_verifications
           WHERE customer_id = $1 AND new_email = $2
           ORDER BY created_at DESC
           LIMIT 1`,
          [customerId, normalizedEmail],
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

      // Update the user record
      const result = await client.query<UserPublicRow>(
        `UPDATE user_customer 
         SET first_name = $1, 
             last_name = $2, 
             email = $3, 
             contact_number = $4, 
             address = $5,
             last_updated = NOW()
         WHERE customer_id = $6
         RETURNING customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status`,
        [firstname, lastname, normalizedEmail, contact, address, customerId],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('User not found');
      }

      if (isEmailChanged) {
        await client.query(
          'DELETE FROM user_email_verifications WHERE customer_id = $1 AND new_email = $2',
          [customerId, normalizedEmail],
        );
      }

      return {
        ok: true,
        user: result.rows[0],
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  @Post(':id/email-verification')
  async sendEmailVerification(
    @Param('id') customerId: string,
    @Body('newEmail') newEmail: string,
  ) {
    const client = this.databaseService.getClient();

    if (!newEmail?.trim()) {
      throw new BadRequestException('New email is required');
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    try {
      // Ensure user exists
      const userResult = await client.query<UserPublicRow>(
        `SELECT customer_id, email, first_name FROM user_customer WHERE customer_id = $1 LIMIT 1`,
        [customerId],
      );

      if (!userResult.rowCount) {
        throw new NotFoundException('User not found');
      }

      const user = userResult.rows[0];

      if (user.email === normalizedEmail) {
        throw new BadRequestException('Email is unchanged');
      }

      // Check for conflicts
      const existingEmail = await client.query(
        'SELECT customer_id FROM user_customer WHERE email = $1 AND customer_id <> $2 LIMIT 1',
        [normalizedEmail, customerId],
      );

      if (existingEmail.rowCount) {
        throw new ConflictException('Email already exists');
      }

      await this.ensureVerificationTable();

      const code = String(randomInt(100000, 1000000));

      // Remove previous codes for this user + email
      await client.query(
        'DELETE FROM user_email_verifications WHERE customer_id = $1 AND new_email = $2',
        [customerId, normalizedEmail],
      );

      await client.query(
        `INSERT INTO user_email_verifications (customer_id, new_email, code, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
        [customerId, normalizedEmail, code],
      );

      await this.mailer.sendMail({
        to: normalizedEmail,
        subject: 'Verify your new NutriBin email',
        html: `
          <h2>Email Change Verification</h2>
          <p>Hello ${user.first_name},</p>
          <p>Use the verification code below to confirm your new email address for your NutriBin account.</p>
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
  async disableUser(@Param('id') customerId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<UserPublicRow>(
        `UPDATE user_customer 
         SET status = 'inactive',
             last_updated = NOW()
         WHERE customer_id = $1
         RETURNING customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status`,
        [customerId],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('User not found');
      }

      return {
        ok: true,
        user: result.rows[0],
        message: 'User disabled successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to disable user');
    }
  }

  @Patch(':id/ban')
  async banUser(@Param('id') customerId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<UserPublicRow>(
        `UPDATE user_customer 
         SET status = 'banned',
             last_updated = NOW()
         WHERE customer_id = $1
         RETURNING customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status`,
        [customerId],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('User not found');
      }

      return {
        ok: true,
        user: result.rows[0],
        message: 'User banned successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to ban user');
    }
  }

  @Patch(':id/enable')
  async enableUser(@Param('id') customerId: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<UserPublicRow>(
        `UPDATE user_customer 
         SET status = 'active',
             last_updated = NOW()
         WHERE customer_id = $1
         RETURNING customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status`,
        [customerId],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('User not found');
      }

      return {
        ok: true,
        user: result.rows[0],
        message: 'User enabled successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to enable user');
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') customerId: string) {
    const client = this.databaseService.getClient();

    try {
      // First check if the user exists
      const checkResult = await client.query(
        'SELECT * FROM user_customer WHERE customer_id = $1',
        [customerId],
      );

      if (checkResult.rows.length === 0) {
        throw new NotFoundException('User not found');
      }

      const user = checkResult.rows[0] as {
        customer_id: string;
        first_name: string;
        last_name: string;
        contact_number: string | null;
        address: string | null;
        email: string;
        password: string;
        date_created: string;
        last_updated: string;
        status: string;
      };

      // Move user to archive table
      await client.query(
        `INSERT INTO user_customer_archive 
         (customer_id, first_name, last_name, contact_number, address, email, password, date_created, last_updated, archive_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)`,
        [
          user.customer_id,
          user.first_name,
          user.last_name,
          user.contact_number,
          user.address,
          user.email,
          user.password,
          user.date_created,
          user.last_updated,
          user.status,
        ],
      );

      // Delete the user from active table
      await client.query('DELETE FROM user_customer WHERE customer_id = $1', [
        customerId,
      ]);

      return {
        ok: true,
        message: 'User archived successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to archive user');
    }
  }
}
