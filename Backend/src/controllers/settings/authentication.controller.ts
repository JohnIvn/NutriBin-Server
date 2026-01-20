import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Body,
  Post,
} from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';
import { BrevoService } from '../../service/email/brevo.service';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: BrevoService,
  ) {}

  @Get(':userId/mfa')
  async getMFASettings(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const client = this.databaseService.getClient();

    try {
      // Check if userId is admin or staff
      let isAdmin = false;
      const adminCheckResult = await client.query(
        'SELECT admin_id FROM user_admin WHERE admin_id = $1 LIMIT 1',
        [userId],
      );

      if (adminCheckResult.rows.length > 0) {
        isAdmin = true;
      }

      // Query authentication table based on user type
      const column = isAdmin ? 'admin_id' : 'staff_id';
      const result = await client.query<{ authentication_type: string }>(
        `SELECT authentication_type FROM authentication WHERE ${column} = $1 LIMIT 1`,
        [userId],
      );

      return {
        ok: true,
        mfaType:
          result.rows.length > 0 ? result.rows[0].authentication_type : 'N/A',
      };
    } catch {
      throw new InternalServerErrorException('Failed to load MFA settings');
    }
  }

  @Patch(':userId/mfa')
  async updateMFASettings(
    @Param('userId') userId: string,
    @Body() body: { mfaType?: string },
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    if (!body.mfaType || !['N/A', 'email'].includes(body.mfaType)) {
      throw new BadRequestException('mfaType must be "N/A" or "email"');
    }

    const client = this.databaseService.getClient();

    try {
      // Check if userId is admin or staff
      let isAdmin = false;
      const adminCheckResult = await client.query(
        'SELECT admin_id FROM user_admin WHERE admin_id = $1 LIMIT 1',
        [userId],
      );

      if (adminCheckResult.rows.length > 0) {
        isAdmin = true;
      }

      // Determine which column to use
      const idColumn = isAdmin ? 'admin_id' : 'staff_id';
      const userType = isAdmin ? 'admin' : 'staff';

      // Check if record exists
      const existing = await client.query(
        `SELECT authentication_id FROM authentication WHERE ${idColumn} = $1 LIMIT 1`,
        [userId],
      );

      // Determine if MFA should be enabled
      const enabled = body.mfaType !== 'N/A';

      if (existing.rows.length > 0) {
        // Update existing record - always update to the new type (including "N/A" for disabled)
        await client.query(
          `UPDATE authentication SET authentication_type = $1, user_type = $2, enabled = $3 WHERE ${idColumn} = $4`,
          [body.mfaType, userType, enabled, userId],
        );
      } else {
        // Insert new record with appropriate ID column
        const query = isAdmin
          ? `INSERT INTO authentication (admin_id, authentication_type, user_type, enabled) VALUES ($1, $2, $3, $4)`
          : `INSERT INTO authentication (staff_id, authentication_type, user_type, enabled) VALUES ($1, $2, $3, $4)`;

        await client.query(query, [userId, body.mfaType, userType, enabled]);
      }

      return {
        ok: true,
        message: 'MFA settings updated successfully',
        mfaType: body.mfaType,
      };
    } catch (error) {
      console.error('Error updating MFA settings:', error);
      throw new InternalServerErrorException('Failed to update MFA settings');
    }
  }

  @Post('verify-mfa')
  async verifyMFA(
    @Body() body: { token?: string; staffId?: string; adminId?: string },
  ) {
    if (!body.token) {
      throw new BadRequestException('token is required');
    }
    if (!body.staffId && !body.adminId) {
      throw new BadRequestException('staffId or adminId is required');
    }

    const client = this.databaseService.getClient();

    try {
      const userId = body.adminId || body.staffId;

      console.log(`[MFA] Verifying token for userId=${userId}`);

      // Try to find authentication row by either admin_id or staff_id
      const result = await client.query<{
        mfa_token: string | null;
        mfa_token_expiry: string | null;
        admin_id: string | null;
        staff_id: string | null;
      }>(
        `SELECT mfa_token, mfa_token_expiry, admin_id, staff_id FROM authentication WHERE admin_id = $1 OR staff_id = $1 LIMIT 1`,
        [userId],
      );

      console.log(`[MFA] Query result:`, result.rows);

      if (result.rows.length === 0) {
        console.log(`[MFA] No record found for userId=${userId}`);
        throw new BadRequestException('No MFA record found');
      }

      const record = result.rows[0];
      console.log(`[MFA] Record mfa_token: ${record.mfa_token}, Provided: ${body.token}`);

      // Determine if this authentication row belongs to an admin
      const isAdmin = record.admin_id === userId;

      if (!record.mfa_token) {
        throw new BadRequestException('No MFA token found for this account');
      }

      if (record.mfa_token !== body.token) {
        throw new BadRequestException('Invalid MFA token');
      }

      if (record.mfa_token_expiry && new Date(record.mfa_token_expiry) < new Date()) {
        throw new BadRequestException('MFA token has expired');
      }

      console.log(`[MFA] Token verified successfully for ${userId}`);

      // Fetch user data to return after successful verification
      let userQuery = '';
      if (isAdmin) {
        userQuery = `SELECT admin_id as id, first_name, last_name, contact_number, address, email, date_created, last_updated, status FROM user_admin WHERE admin_id = $1`;
      } else {
        userQuery = `SELECT staff_id as id, first_name, last_name, contact_number, address, email, date_created, last_updated, status FROM user_staff WHERE staff_id = $1`;
      }

      const userResult = await client.query<{
        id: string;
        first_name: string;
        last_name: string;
        contact_number: string | null;
        address: string | null;
        email: string;
        date_created: string;
        last_updated: string;
        status: string;
      }>(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        throw new BadRequestException('User not found');
      }

      const user = userResult.rows[0];
      const safeUser = {
        [isAdmin ? 'admin_id' : 'staff_id']: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        contact_number: user.contact_number,
        address: user.address,
        email: user.email,
        date_created: user.date_created,
        last_updated: user.last_updated,
        status: user.status,
        role: isAdmin ? 'admin' : 'staff',
      };

      // Determine which column matched for clearing the token
      const matchedColumn = record.admin_id === userId ? 'admin_id' : 'staff_id';

      // Clear the token AFTER fetching user data (don't await, let it clear in background)
      const updateQuery = `UPDATE authentication SET mfa_token = NULL, mfa_token_expiry = NULL WHERE ${matchedColumn} = $1`;
      client.query(updateQuery, [userId]).catch((err) =>
        console.error('Error clearing MFA token:', err),
      );

      return {
        ok: true,
        message: 'MFA verification successful',
        staff: safeUser,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error verifying MFA:', error);
      throw new InternalServerErrorException('Failed to verify MFA');
    }
  }
}
