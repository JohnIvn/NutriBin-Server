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
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomInt } from 'crypto';

import { DatabaseService } from '../../service/database/database.service';
import { BrevoService } from '../../service/email/brevo.service';
import { IprogSmsService } from '../../service/iprogsms/iprogsms.service';
import supabaseService from '../../service/storage/supabase.service';

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
    private readonly mailer: BrevoService,
    private readonly iprogSms: IprogSmsService,
  ) {}

  private async resolveAvatarUrl(userId: string) {
    const bucket = 'avatars';
    const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
    for (const e of exts) {
      try {
        const url = await supabaseService.getSignedUrl(
          bucket,
          `avatars/${userId}.${e}`,
          60,
        );
        if (url) return url;
      } catch (err) {
        // ignore and continue
      }
    }
    // fallback to a public URL for common extension (may 404 if missing)
    return (
      supabaseService.getPublicUrl('avatars', `avatars/${userId}.jpg`) || null
    );
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
        const base = mapStaff(adminResult.rows[0] as StaffPublicRow);
        const avatar = await this.resolveAvatarUrl(base.staff_id);
        return {
          ok: true,
          staff: { ...base, avatar },
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
      const base = mapStaff(result.rows[0]);
      const avatar = await this.resolveAvatarUrl(base.staff_id);
      return {
        ok: true,
        staff: { ...base, avatar },
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

      // Clear previous codes for this user and purpose
      await client.query(
        `DELETE FROM codes WHERE user_id = $1 AND purpose = 'password_reset' AND used = false`,
        [staffId],
      );

      const code = String(randomInt(100000, 1000000));

      await client.query(
        `INSERT INTO codes (user_id, code, purpose, expires_at)
         VALUES ($1, $2, 'password_reset', NOW() + INTERVAL '15 minutes')`,
        [staffId, code],
      );

      try {
        await this.mailer.sendPasswordResetCodeEmail(staff.email, code);
      } catch (mailErr) {
        // Log the detailed mail error for production debugging
        console.error('password reset email error:', mailErr);
        // Throw a clearer error so the client sees a specific failure
        throw new InternalServerErrorException(
          'Failed to send password reset email',
        );
      }

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

      // Log the underlying error so it's visible in server logs for debugging
      console.error('requestPasswordReset error:', error);

      throw new InternalServerErrorException(
        'Failed to request password reset',
      );
    }
  }

  @Get(':staffId/password-reset')
  async requestPasswordResetGet(@Param('staffId') staffId: string) {
    // Compatibility: allow GET requests in deployment environments
    // that might be invoking this endpoint via a browser or proxy.
    return this.requestPasswordReset(staffId);
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

      // Get latest code record for this user and purpose
      const codeResult = await client.query<{
        code: string;
        expires_at: string;
        code_id: string;
      }>(
        `SELECT code, expires_at, code_id FROM codes
         WHERE user_id = $1 AND purpose = 'password_reset' AND used = false
         ORDER BY created_at DESC
         LIMIT 1`,
        [staffId],
      );

      if (!codeResult.rowCount) {
        throw new BadRequestException('No password reset request found');
      }

      const record = codeResult.rows[0];
      const now = new Date();
      const expiresAt = new Date(record.expires_at);
      if (expiresAt < now) {
        throw new BadRequestException('Verification code has expired');
      }
      if (record.code !== code) {
        throw new BadRequestException(
          'The verification code you entered is incorrect.',
        );
      }

      // Update password
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

        // Mark code as used
        await client.query('UPDATE codes SET used = true WHERE code_id = $1', [
          record.code_id,
        ]);
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

  @Post(':staffId/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadPhoto(
    @Param('staffId') staffId: string,
    @UploadedFile() file: any,
  ) {
    if (!staffId) throw new BadRequestException('staffId is required');
    if (!file) throw new BadRequestException('No file uploaded');

    try {
      const bucket = 'avatars';

      const orig = file.originalname || '';
      const extMatch = orig.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
      const path = `avatars/${staffId}.${ext}`;

      // upload buffer
      await supabaseService.uploadBuffer(
        bucket,
        path,
        file.buffer,
        file.mimetype,
      );

      const publicUrl = supabaseService.getPublicUrl(bucket, path);

      return {
        ok: true,
        url: publicUrl,
        message: 'Photo uploaded',
      };
    } catch (err) {
      console.error('uploadPhoto error', err);
      throw new InternalServerErrorException('Failed to upload photo');
    }
  }

  @Delete(':staffId/photo')
  async deletePhoto(@Param('staffId') staffId: string) {
    if (!staffId) throw new BadRequestException('staffId is required');

    try {
      const bucket = 'avatars';
      const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
      const paths = exts.map((e) => `avatars/${staffId}.${e}`);

      await supabaseService.remove(bucket, paths);

      return { ok: true, message: 'Photo removed' };
    } catch (err) {
      console.error('deletePhoto error', err);
      throw new InternalServerErrorException('Failed to remove photo');
    }
  }

  @Post(':staffId/mfa')
  async setMfaSetting(
    @Param('staffId') staffId: string,
    @Body() body: { method?: 'email' | 'sms' | 'none'; enabled?: boolean },
  ) {
    if (!staffId) throw new BadRequestException('staffId is required');

    const method = body?.method || 'none';
    const enabled = body?.enabled === true;

    const client = this.databaseService.getClient();

    try {
      // Determine whether it's an admin or staff
      let userResult = await client.query(
        'SELECT admin_id FROM user_admin WHERE admin_id = $1 LIMIT 1',
        [staffId],
      );

      const isAdmin = (userResult.rowCount ?? 0) > 0;

      if (!isAdmin) {
        userResult = await client.query(
          'SELECT staff_id FROM user_staff WHERE staff_id = $1 LIMIT 1',
          [staffId],
        );
      }

      if (!userResult.rowCount)
        throw new NotFoundException('Account not found');

      const authType =
        method === 'sms' ? 'sms' : method === 'email' ? 'email' : 'N/A';

      if (isAdmin) {
        await client.query(
          `INSERT INTO authentication (admin_id, user_type, authentication_type, enabled)
           VALUES ($1, 'admin', $2, $3)
           ON CONFLICT (admin_id) DO UPDATE SET authentication_type = $2, enabled = $3`,
          [staffId, authType, enabled],
        );
      } else {
        await client.query(
          `INSERT INTO authentication (staff_id, user_type, authentication_type, enabled)
           VALUES ($1, 'staff', $2, $3)
           ON CONFLICT (staff_id) DO UPDATE SET authentication_type = $2, enabled = $3`,
          [staffId, authType, enabled],
        );
      }

      return { ok: true, message: 'MFA settings updated' };
    } catch (err) {
      console.error('setMfaSetting error:', err);
      throw new InternalServerErrorException('Failed to update MFA settings');
    }
  }

  @Post(':staffId/phone/verify/request')
  async requestPhoneVerification(
    @Param('staffId') staffId: string,
    @Body() body: { newPhone?: string },
  ) {
    if (!staffId) throw new BadRequestException('staffId is required');
    const newPhone = body?.newPhone?.trim();
    if (!newPhone) throw new BadRequestException('newPhone is required');

    const client = this.databaseService.getClient();

    try {
      // Check that phone isn't already used by another account
      const existing = await client.query(
        `SELECT staff_id FROM user_staff WHERE contact_number = $1 LIMIT 1`,
        [newPhone],
      );
      const existingAdmin = await client.query(
        `SELECT admin_id FROM user_admin WHERE contact_number = $1 LIMIT 1`,
        [newPhone],
      );

      if (existing.rowCount || existingAdmin.rowCount) {
        return { ok: false, message: 'Phone number already in use' };
      }

      // Clear previous phone verification codes for this user
      await client.query(
        `DELETE FROM codes WHERE user_id = $1 AND purpose = 'other' AND used = false`,
        [staffId],
      );

      const code = String(randomInt(100000, 1000000));

      await client.query(
        `INSERT INTO codes (user_id, code, purpose, expires_at)
         VALUES ($1, $2, 'other', NOW() + INTERVAL '15 minutes')`,
        [staffId, code],
      );

      try {
        await this.iprogSms.sendSms({
          to: newPhone,
          body: `Your NutriBin verification code is: ${code}`,
        });
      } catch (smsErr) {
        console.error('Failed to send phone verification SMS:', smsErr);
        throw new InternalServerErrorException(
          'Failed to send verification SMS',
        );
      }

      return { ok: true, message: 'Verification code sent via SMS' };
    } catch (err) {
      console.error('requestPhoneVerification error:', err);
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(
        'Failed to request phone verification',
      );
    }
  }

  @Post(':staffId/phone/verify')
  async verifyPhoneChange(
    @Param('staffId') staffId: string,
    @Body() body: { code?: string; newPhone?: string },
  ) {
    if (!staffId) throw new BadRequestException('staffId is required');
    const code = body?.code?.trim();
    const newPhone = body?.newPhone?.trim();

    if (!code || !/^[0-9]{6}$/.test(code)) {
      throw new BadRequestException(
        'Verification code must be a 6-digit number',
      );
    }
    if (!newPhone) {
      throw new BadRequestException('newPhone is required');
    }

    const client = this.databaseService.getClient();
    try {
      // Get latest code record for this user and purpose
      const codeResult = await client.query<{
        code: string;
        expires_at: string;
        code_id: string;
      }>(
        `SELECT code, expires_at, code_id FROM codes
         WHERE user_id = $1 AND purpose = 'other' AND used = false
         ORDER BY created_at DESC
         LIMIT 1`,
        [staffId],
      );

      if (!codeResult.rowCount) {
        throw new BadRequestException('No phone verification request found');
      }

      const record = codeResult.rows[0];
      const now = new Date();
      const expiresAt = new Date(record.expires_at);
      if (expiresAt < now) {
        throw new BadRequestException('Verification code has expired');
      }
      if (record.code !== code) {
        throw new BadRequestException(
          'The verification code you entered is incorrect.',
        );
      }

      // Update phone number for admin or staff
      let userResult = await client.query(
        'SELECT admin_id as staff_id FROM user_admin WHERE admin_id = $1 LIMIT 1',
        [staffId],
      );
      const isAdmin = (userResult.rowCount ?? 0) > 0;

      if (isAdmin) {
        await client.query(
          'UPDATE user_admin SET contact_number = $1, last_updated = NOW() WHERE admin_id = $2',
          [newPhone, staffId],
        );
        const updated = await client.query(
          `SELECT admin_id as staff_id, first_name, last_name, NULL as birthday, NULL as age, contact_number, address, email, date_created, last_updated, status
           FROM user_admin WHERE admin_id = $1 LIMIT 1`,
          [staffId],
        );
        await client.query('UPDATE codes SET used = true WHERE code_id = $1', [
          record.code_id,
        ]);
        return {
          ok: true,
          staff: updated.rows[0],
          message: 'Phone number updated',
        };
      } else {
        await client.query(
          'UPDATE user_staff SET contact_number = $1, last_updated = NOW() WHERE staff_id = $2',
          [newPhone, staffId],
        );
        const updated = await client.query(
          `SELECT staff_id, first_name, last_name, birthday, age, contact_number, address, email, date_created, last_updated, status
           FROM user_staff WHERE staff_id = $1 LIMIT 1`,
          [staffId],
        );
        await client.query('UPDATE codes SET used = true WHERE code_id = $1', [
          record.code_id,
        ]);
        return {
          ok: true,
          staff: updated.rows[0],
          message: 'Phone number updated',
        };
      }
    } catch (error) {
      console.error('verifyPhoneChange error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to verify phone change');
    }
  }
}
