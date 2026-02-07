import {
  BadRequestException,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
  Body,
} from '@nestjs/common';
import { randomInt, randomUUID } from 'crypto';
import { DatabaseService } from '../../service/database/database.service';
import { IprogSmsService } from '../../service/iprogsms/iprogsms.service';

@Controller('staff/phone')
export class StaffPhoneController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly iprogSms: IprogSmsService,
  ) {}

  @Post('request')
  async requestPhoneVerification(@Body('phone') phone: string) {
    const client = this.databaseService.getClient();

    if (!phone || !String(phone).trim()) {
      throw new BadRequestException('Phone number is required');
    }

    const normalized = String(phone).trim();

    // Ensure phone is not already used by an existing staff account
    const existing = await client.query(
      'SELECT staff_id FROM user_staff WHERE contact_number = $1 LIMIT 1',
      [normalized],
    );

    if (existing.rowCount) {
      throw new ConflictException('Phone number already in use');
    }

    try {
      const code = String(randomInt(100000, 1000000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const userId = randomUUID();

      await client.query(
        `INSERT INTO codes (user_id, code, purpose, expires_at, used)
         VALUES ($1, $2, $3, $4, false)`,
        [userId, code, 'other', expiresAt],
      );

      // Send OTP via IprogSms
      try {
        await this.iprogSms.sendOtp(normalized, code);
      } catch (smsErr) {
        // swallow SMS errors but log to console (service logs too)
        console.error('Failed to send verification SMS:', smsErr);
      }

      return {
        ok: true,
        message: 'Verification code sent via SMS',
        code: code.toString(),
      };
    } catch (err) {
      console.error('Failed to send verification code:', err);
      throw new InternalServerErrorException(
        'Failed to send verification code',
      );
    }
  }

  @Post('verify')
  async verifyPhoneCode(@Body('code') code: string) {
    if (!code || !String(code).trim()) {
      throw new BadRequestException('Code is required');
    }

    const client = this.databaseService.getClient();

    const row = await client.query<{ code_id: string }>(
      `SELECT * FROM codes WHERE code = $1 AND purpose = $2 AND used = false AND expires_at > now() ORDER BY created_at DESC LIMIT 1`,
      [String(code).trim(), 'other'],
    );

    if (!row.rowCount) {
      return { valid: false, message: 'Invalid or expired code' };
    }

    const codeRow = row.rows[0];

    try {
      await client.query(`UPDATE codes SET used = true WHERE code_id = $1`, [
        codeRow.code_id,
      ]);
    } catch {
      // ignore update errors
    }

    return { valid: true, message: 'Code is valid' };
  }
}
