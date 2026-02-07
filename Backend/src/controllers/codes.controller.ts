import { Body, BadRequestException, Controller, Post } from '@nestjs/common';
import { DatabaseService } from '../service/database/database.service';

@Controller('codes')
export class CodesController {
  constructor(private readonly db: DatabaseService) {}

  @Post('check')
  async checkCode(
    @Body()
    body: {
      email?: string;
      code?: string;
      purpose?: string;
    },
  ) {
    if (!body?.email || !body?.code || !body?.purpose) {
      throw new BadRequestException('Email, code and purpose are required');
    }

    const client = this.db.getClient();
    const email = String(body.email).trim().toLowerCase();
    const code = String(body.code).trim();
    const purpose = String(body.purpose).trim();

    // Try to find a staff with this email
    const staff = await client.query(
      'SELECT staff_id FROM user_staff WHERE email = $1',
      [email],
    );
    const userId = staff.rows[0]?.staff_id;

    if (!userId) {
      // If no user, look up codes by code + purpose (non-consuming)
      const codeRow = await client.query(
        `SELECT * FROM codes WHERE code = $1 AND purpose = $2 AND used = false AND expires_at > now() ORDER BY created_at DESC LIMIT 1`,
        [code, purpose],
      );
      if (!codeRow.rowCount) {
        return { valid: false, message: 'Invalid or expired code' };
      }
      return { valid: true, message: 'Code is valid' };
    }

    const codeRow = await client.query(
      `SELECT * FROM codes WHERE user_id = $1 AND code = $2 AND purpose = $3 AND used = false AND expires_at > now() ORDER BY created_at DESC LIMIT 1`,
      [userId, code, purpose],
    );

    if (!codeRow.rowCount) {
      return { valid: false, message: 'Invalid or expired code' };
    }

    return { valid: true, message: 'Code is valid' };
  }
}
