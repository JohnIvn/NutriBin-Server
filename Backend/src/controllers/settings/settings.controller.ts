import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Body,
  Post,
} from '@nestjs/common';
import { randomInt } from 'crypto';

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

function mapStaff(row: StaffPublicRow) {
  return {
    staff_id: row.staff_id,
    first_name: row.first_name,
    last_name: row.last_name,
    birthday: row.birthday,
    age: row.age,
    contact_number: row.contact_number,
    address: row.address,
    email: row.email,
    date_created: row.date_created,
    last_updated: row.last_updated,
    status: row.status,
  };
}

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: NodemailerService,
  ) {}

  private async ensureResetTable() {
    const client = this.databaseService.getClient();
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_password_resets (
        reset_id SERIAL PRIMARY KEY,
        staff_id UUID NOT NULL,
        token VARCHAR(128) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  @Get(':staffId')
  async getProfile(@Param('staffId') staffId: string) {
    if (!staffId) {
      throw new BadRequestException('staffId is required');
    }

    const client = this.databaseService.getClient();

    try {
      // First check if it's an admin
      const adminResult = await client.query<{
        staff_id: string;
        first_name: string;
        last_name: string;
        birthday: string | null;
        age: number | null;
        contact_number: string | null;
        address: string | null;
        email: string;
        date_created: string;
        last_updated: string;
        status: string;
      }>(
        `SELECT admin_id as staff_id, first_name, last_name, NULL as birthday, NULL as age, contact_number, address, email, date_created, last_updated, status
         FROM user_admin
         WHERE admin_id = $1
         LIMIT 1`,
        [staffId],
      );

      if (adminResult.rowCount) {
        return {
          ok: true,
          staff: mapStaff(adminResult.rows[0] as StaffPublicRow),
        };
      }

      // If not admin, check staff table
      const result = await client.query<StaffPublicRow>(
        `SELECT staff_id, first_name, last_name, birthday, age, contact_number, address, email, date_created, last_updated, status
         FROM user_staff
         WHERE staff_id = $1
         LIMIT 1`,
        [staffId],
      );

      if (!result.rowCount) {
        throw new NotFoundException('Account not found');
      }

      return {
        ok: true,
        staff: mapStaff(result.rows[0]),
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to load settings');
    }
  }

  @Patch(':staffId')
  async updateProfile(
    @Param('staffId') staffId: string,
    @Body()
    body: {
      firstname?: string;
      lastname?: string;
      address?: string | null;
      age?: number;
      contact?: string | null;
    },
  ) {
    if (!staffId) {
      throw new BadRequestException('staffId is required');
    }

    const client = this.databaseService.getClient();

    try {
      // First check if it's an admin
      const adminCheck = await client.query(
        'SELECT admin_id FROM user_admin WHERE admin_id = $1',
        [staffId],
      );

      const isAdmin = (adminCheck.rowCount ?? 0) > 0;

      const updates: string[] = [];
      const values: (string | number | null)[] = [];

      if (body.firstname !== undefined) {
        updates.push(`first_name = $${updates.length + 1}`);
        values.push(body.firstname.trim());
      }

      if (body.lastname !== undefined) {
        updates.push(`last_name = $${updates.length + 1}`);
        values.push(body.lastname.trim());
      }

      if (body.address !== undefined) {
        updates.push(`address = $${updates.length + 1}`);
        values.push(body.address?.trim() || null);
      }

      if (body.contact !== undefined) {
        updates.push(`contact_number = $${updates.length + 1}`);
        values.push(body.contact?.trim() || null);
      }

      // Only update age for staff (not admin)
      if (body.age !== undefined && !isAdmin) {
        const parsedAge = Number(body.age);
        if (Number.isNaN(parsedAge)) {
          throw new BadRequestException('age must be a number');
        }
        updates.push(`age = $${updates.length + 1}`);
        values.push(parsedAge);
      }

      if (updates.length === 0) {
        throw new BadRequestException('No fields provided to update');
      }

      const setClause = `${updates.join(', ')}, last_updated = now()`;

      if (isAdmin) {
        // Update admin table
        const adminResult = await client.query<{
          staff_id: string;
          first_name: string;
          last_name: string;
          birthday: string | null;
          age: number | null;
          contact_number: string | null;
          address: string | null;
          email: string;
          date_created: string;
          last_updated: string;
          status: string;
        }>(
          `UPDATE user_admin
           SET ${setClause}
           WHERE admin_id = $${updates.length + 1}
           RETURNING admin_id as staff_id, first_name, last_name, NULL as birthday, NULL as age, contact_number, address, email, date_created, last_updated, status`,
          [...values, staffId],
        );

        if (!adminResult.rowCount) {
          throw new NotFoundException('Account not found');
        }

        return {
          ok: true,
          staff: mapStaff(adminResult.rows[0] as StaffPublicRow),
          message: 'Settings updated successfully',
        };
      } else {
        // Update staff table
        const result = await client.query<StaffPublicRow>(
          `UPDATE user_staff
           SET ${setClause}
           WHERE staff_id = $${updates.length + 1}
           RETURNING staff_id, first_name, last_name, birthday, age, contact_number, address, email, date_created, last_updated, status`,
          [...values, staffId],
        );

        if (!result.rowCount) {
          throw new NotFoundException('Account not found');
        }

        return {
          ok: true,
          staff: mapStaff(result.rows[0]),
          message: 'Settings updated successfully',
        };
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update settings');
    }
  }

  @Patch(':staffId/close')
  async closeAccount(@Param('staffId') staffId: string) {
    if (!staffId) {
      throw new BadRequestException('staffId is required');
    }

    const client = this.databaseService.getClient();

    try {
      // First check admin table
      const adminExisting = await client.query<{ status: string }>(
        'SELECT status FROM user_admin WHERE admin_id = $1 LIMIT 1',
        [staffId],
      );

      if (adminExisting.rowCount) {
        const currentStatus = adminExisting.rows[0].status;
        if (currentStatus === 'inactive') {
          throw new BadRequestException('Account is already inactive');
        }
        if (currentStatus === 'banned') {
          throw new BadRequestException('Banned accounts cannot be closed');
        }

        await client.query(
          'UPDATE user_admin SET status = $1, last_updated = now() WHERE admin_id = $2',
          ['inactive', staffId],
        );

        return {
          ok: true,
          message: 'Admin account has been deactivated',
        };
      }

      // If not admin, check staff table
      const existing = await client.query<{ status: string }>(
        'SELECT status FROM user_staff WHERE staff_id = $1 LIMIT 1',
        [staffId],
      );

      if (!existing.rowCount) {
        throw new NotFoundException('Account not found');
      }

      const currentStatus = existing.rows[0].status;
      if (currentStatus === 'inactive') {
        throw new BadRequestException('Account is already inactive');
      }
      if (currentStatus === 'banned') {
        throw new BadRequestException('Banned accounts cannot be closed');
      }

      await client.query(
        `UPDATE user_staff
         SET status = 'inactive', last_updated = now()
         WHERE staff_id = $1`,
        [staffId],
      );

      return {
        ok: true,
        message: 'Account has been deactivated',
        status: 'inactive',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to close account');
    }
  }

  @Post(':staffId/password-reset')
  async requestPasswordReset(@Param('staffId') staffId: string) {
    if (!staffId) {
      throw new BadRequestException('staffId is required');
    }

    const client = this.databaseService.getClient();

    try {
      // First check admin table
      let userResult = await client.query<{
        staff_id: string;
        first_name: string;
        email: string;
      }>(
        `SELECT admin_id as staff_id, first_name, email FROM user_admin WHERE admin_id = $1 LIMIT 1`,
        [staffId],
      );

      // If not admin, check staff table
      if (!userResult.rowCount) {
        userResult = await client.query<{
          staff_id: string;
          first_name: string;
          email: string;
        }>(
          `SELECT staff_id, first_name, email FROM user_staff WHERE staff_id = $1 LIMIT 1`,
          [staffId],
        );
      }

      if (!userResult.rowCount) {
        throw new NotFoundException('Account not found');
      }

      const staff = userResult.rows[0];

      await this.ensureResetTable();

      // Clear previous codes for this user
      await client.query(
        'DELETE FROM staff_password_resets WHERE staff_id = $1',
        [staffId],
      );

      const code = String(randomInt(100000, 1000000));

      await client.query(
        `INSERT INTO staff_password_resets (staff_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
        [staffId, code],
      );

      await this.mailer.sendPasswordResetCodeEmail(staff.email, code);

      return {
        ok: true,
        message: 'Password reset code sent to your email',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to request password reset',
      );
    }
  }

  @Post(':staffId/password-reset/verify')
  async verifyPasswordReset(
    @Param('staffId') staffId: string,
    @Body() body: { code?: string; newPassword?: string },
  ) {
    if (!staffId) throw new BadRequestException('staffId is required');
    const code = body?.code?.trim();
    const newPassword = body?.newPassword;

    if (!code || !/^\d{6}$/.test(code)) {
      throw new BadRequestException(
        'Verification code must be a 6-digit number',
      );
    }
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException(
        'New password must be at least 8 characters long',
      );
    }

    const client = this.databaseService.getClient();
    try {
      // Check if user exists in either admin or staff table
      let userResult = await client.query(
        'SELECT admin_id as staff_id FROM user_admin WHERE admin_id = $1 LIMIT 1',
        [staffId],
      );

      const isAdmin = (userResult.rowCount ?? 0) > 0;

      if (!userResult.rowCount) {
        userResult = await client.query(
          'SELECT staff_id FROM user_staff WHERE staff_id = $1 LIMIT 1',
          [staffId],
        );
      }

      if (!userResult.rowCount) {
        throw new NotFoundException('Account not found');
      }

      // Get latest reset record for this user
      const reset = await client.query<{ token: string; expires_at: string }>(
        `SELECT token, expires_at FROM staff_password_resets
         WHERE staff_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [staffId],
      );

      if (!reset.rowCount) {
        throw new BadRequestException('No password reset request found');
      }

      const record = reset.rows[0];
      const now = new Date();
      const expiresAt = new Date(record.expires_at);
      if (expiresAt < now) {
        throw new BadRequestException('Verification code has expired');
      }
      if (record.token !== code) {
        throw new BadRequestException('Invalid verification code');
      }

      // Update password
      // Use bcrypt without importing here; keep hashing in DB? We'll import bcrypt to be consistent
      // But since this file doesn't have bcrypt yet, add it
      return await (async () => {
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update password in the appropriate table
        if (isAdmin) {
          await client.query(
            'UPDATE user_admin SET password = $1, last_updated = NOW() WHERE admin_id = $2',
            [passwordHash, staffId],
          );
        } else {
          await client.query(
            'UPDATE user_staff SET password = $1, last_updated = NOW() WHERE staff_id = $2',
            [passwordHash, staffId],
          );
        }

        await client.query(
          'DELETE FROM staff_password_resets WHERE staff_id = $1',
          [staffId],
        );
        return { ok: true, message: 'Password has been reset successfully' };
      })();
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify password reset');
    }
  }
}
