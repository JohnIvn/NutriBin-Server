import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

import { DatabaseService } from '../database/database.service';
import { NodemailerService } from '../email/nodemailer.service';
import type {
  StaffSignInDto,
  StaffSignUpDto,
} from '../../controllers/staff/staff-auth.dto';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

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

type StaffDbRow = StaffPublicRow & {
  password: string;
};

@Injectable()
export class StaffAuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: NodemailerService,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn(
        '⚠️  GOOGLE_CLIENT_ID not found in environment variables. Google Sign-In will not work.',
      );
    }
    this.googleClient = new OAuth2Client(clientId);
  }

  async signUp(dto: StaffSignUpDto) {
    const firstname = dto?.firstname?.trim();
    const lastname = dto?.lastname?.trim();
    const emailRaw = dto?.email;
    const password = dto?.password;
    const birthday = dto?.birthday?.trim();
    const age = dto?.age;

    if (!firstname) throw new BadRequestException('firstname is required');
    if (!lastname) throw new BadRequestException('lastname is required');
    if (!emailRaw?.trim()) throw new BadRequestException('email is required');
    if (!password) throw new BadRequestException('password is required');
    if (!birthday) throw new BadRequestException('birthday is required');
    if (age === undefined || age === null)
      throw new BadRequestException('age is required');

    const email = normalizeEmail(emailRaw);
    const contactNumber = dto?.contact?.trim() || null;
    const address = dto?.address?.trim() || null;

    const client = this.databaseService.getClient();

    const existing = await client.query<{ staff_id: string }>(
      'SELECT staff_id FROM user_staff WHERE email = $1 LIMIT 1',
      [email],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      throw new ConflictException(
        'A staff account with this email already exists',
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await client.query<StaffPublicRow>(
      `INSERT INTO user_staff (first_name, last_name, birthday, age, contact_number, address, email, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING staff_id, first_name, last_name, birthday, age, contact_number, address, email, date_created, last_updated, status`,
      [
        firstname,
        lastname,
        birthday,
        age,
        contactNumber,
        address,
        email,
        passwordHash,
      ],
    );

    const staff = created.rows[0];
    if (!staff) {
      throw new InternalServerErrorException('Failed to create staff account');
    }

    return {
      ok: true,
      staff,
    };
  }

  async signIn(dto: StaffSignInDto) {
    const emailRaw = dto?.email;
    const password = dto?.password;

    if (!emailRaw?.trim()) throw new BadRequestException('email is required');
    if (!password) throw new BadRequestException('password is required');

    const email = normalizeEmail(emailRaw);
    const client = this.databaseService.getClient();

    // First check user_admin table
    const adminResult = await client.query<{
      id: string;
      first_name: string;
      last_name: string;
      contact_number: string | null;
      address: string | null;
      email: string;
      password: string;
      date_created: string;
      last_updated: string;
      status: string;
    }>(
      `SELECT admin_id as id, first_name, last_name, contact_number, address, email, password, date_created, last_updated, status
       FROM user_admin
       WHERE email = $1
       LIMIT 1`,
      [email],
    );

    if (adminResult.rowCount) {
      const admin = adminResult.rows[0];
      const matches = await bcrypt.compare(password, admin.password);

      if (!matches) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }

      if (admin.status !== 'active') {
        return {
          ok: false,
          error:
            admin.status === 'banned'
              ? 'This admin account is banned'
              : 'This admin account is inactive',
        };
      }

      // Check if MFA is enabled for this admin
      const mfaResult = await client.query<{
        authentication_type: string;
        enabled: boolean;
      }>(
        `SELECT authentication_type, enabled FROM authentication WHERE admin_id = $1 LIMIT 1`,
        [admin.id],
      );

      if (
        mfaResult.rowCount &&
        mfaResult.rows[0].enabled &&
        mfaResult.rows[0].authentication_type === 'email'
      ) {
        // Generate MFA verification token
        const mfaToken = Array.from({ length: 32 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join('');

        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store the token using UPSERT pattern
        await client.query(
          `INSERT INTO authentication (admin_id, mfa_token, mfa_token_expiry, user_type, authentication_type, enabled)
           VALUES ($1, $2, $3, 'admin', 'email', true)
           ON CONFLICT (admin_id) DO UPDATE SET mfa_token = $2, mfa_token_expiry = $3`,
          [admin.id, mfaToken, tokenExpiry],
        );

        // Send verification email
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-mfa?token=${mfaToken}&adminId=${admin.id}`;
        const emailContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Login</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #FFF5E4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF5E4; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #CD5C08 0%, #A34906 100%); padding: 30px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 1px;">NutriBin</h1>
                      <p style="margin: 8px 0 0 0; color: #FFF5E4; font-size: 14px; font-weight: 500;">Multi-Factor Authentication</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <h2 style="margin: 0 0 20px 0; color: #CD5C08; font-size: 24px;">Verify Your Login 🔐</h2>
                      <p style="margin: 0 0 15px 0;">Hello <strong>${admin.first_name}</strong>,</p>
                      <p style="margin: 0 0 20px 0;">A login attempt was made to your NutriBin account. To complete the sign-in process, please verify your identity by clicking the button below.</p>
                      <div style="text-align: center; margin: 35px 0;">
                        <a href="${verificationLink}" style="display: inline-block; background-color: #CD5C08; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(205, 92, 8, 0.3);">Verify Login</a>
                      </div>
                      <div style="background-color: #FFF5E4; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #CD5C08;">⏱️ Time Sensitive</p>
                        <p style="margin: 0; color: #666; font-size: 14px;">This verification link will expire in <strong>24 hours</strong>.</p>
                      </div>
                      <div style="background-color: #FFF9F0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFA500;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FF8800;">⚠️ Security Alert</p>
                        <p style="margin: 0; color: #666; font-size: 14px;">If you didn't attempt to log in, please ignore this email and ensure your account password is secure.</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #FFF5E4; padding: 30px 40px; text-align: center; border-top: 2px solid #CD5C08;">
                      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;"><strong>NutriBin</strong> - Smart Nutrition Management</p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
                      <p style="margin: 15px 0 0 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} NutriBin. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
        await this.mailer.sendHtmlEmail(
          admin.email,
          'NutriBin - Verify Your Login',
          emailContent,
        );

        return {
          ok: true,
          requiresMFA: true,
          message: 'MFA verification email sent',
          adminId: admin.id,
        };
      }

      const safeAdmin = {
        admin_id: admin.id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        contact_number: admin.contact_number,
        address: admin.address,
        email: admin.email,
        date_created: admin.date_created,
        last_updated: admin.last_updated,
        status: admin.status,
        role: 'admin',
      };

      return {
        ok: true,
        staff: safeAdmin,
      };
    }

    // If not found in admin, check user_staff table
    const staffResult = await client.query<StaffDbRow>(
      `SELECT staff_id, first_name, last_name, contact_number, address, email, password, date_created, last_updated, status
       FROM user_staff
       WHERE email = $1
       LIMIT 1`,
      [email],
    );

    if (!staffResult.rowCount) {
      return {
        ok: false,
        error: 'Account not found',
      };
    }

    const staff = staffResult.rows[0];

    const matches = await bcrypt.compare(password, staff.password);
    if (!matches) {
      return {
        ok: false,
        error: 'Wrong password',
      };
    }

    if (staff.status !== 'active') {
      return {
        ok: false,
        error:
          staff.status === 'banned'
            ? 'This staff account is banned'
            : 'This staff account is inactive',
      };
    }

    // Check if MFA is enabled for this staff
    const mfaResult = await client.query<{
      authentication_type: string;
      enabled: boolean;
    }>(
      `SELECT authentication_type, enabled FROM authentication WHERE staff_id = $1 LIMIT 1`,
      [staff.staff_id],
    );

    if (
      mfaResult.rowCount &&
      mfaResult.rows[0].enabled &&
      mfaResult.rows[0].authentication_type === 'email'
    ) {
      // Generate MFA verification token
      const mfaToken = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join('');

      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store the token using UPSERT pattern
      await client.query(
        `INSERT INTO authentication (staff_id, mfa_token, mfa_token_expiry, user_type, authentication_type, enabled)
         VALUES ($1, $2, $3, 'staff', 'email', true)
         ON CONFLICT (staff_id) DO UPDATE SET mfa_token = $2, mfa_token_expiry = $3`,
        [staff.staff_id, mfaToken, tokenExpiry],
      );

      // Send verification email
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-mfa?token=${mfaToken}&staffId=${staff.staff_id}`;
      const emailContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Login</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #FFF5E4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF5E4; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #CD5C08 0%, #A34906 100%); padding: 30px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 1px;">NutriBin</h1>
                      <p style="margin: 8px 0 0 0; color: #FFF5E4; font-size: 14px; font-weight: 500;">Multi-Factor Authentication</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <h2 style="margin: 0 0 20px 0; color: #CD5C08; font-size: 24px;">Verify Your Login 🔐</h2>
                      <p style="margin: 0 0 15px 0;">Hello <strong>${staff.first_name}</strong>,</p>
                      <p style="margin: 0 0 20px 0;">A login attempt was made to your NutriBin account. To complete the sign-in process, please verify your identity by clicking the button below.</p>
                      <div style="text-align: center; margin: 35px 0;">
                        <a href="${verificationLink}" style="display: inline-block; background-color: #CD5C08; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(205, 92, 8, 0.3);">Verify Login</a>
                      </div>
                      <div style="background-color: #FFF5E4; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #CD5C08;">⏱️ Time Sensitive</p>
                        <p style="margin: 0; color: #666; font-size: 14px;">This verification link will expire in <strong>24 hours</strong>.</p>
                      </div>
                      <div style="background-color: #FFF9F0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFA500;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #FF8800;">⚠️ Security Alert</p>
                        <p style="margin: 0; color: #666; font-size: 14px;">If you didn't attempt to log in, please ignore this email and ensure your account password is secure.</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #FFF5E4; padding: 30px 40px; text-align: center; border-top: 2px solid #CD5C08;">
                      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;"><strong>NutriBin</strong> - Smart Nutrition Management</p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
                      <p style="margin: 15px 0 0 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} NutriBin. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
      await this.mailer.sendHtmlEmail(
        staff.email,
        'NutriBin - Verify Your Login',
        emailContent,
      );

      return {
        ok: true,
        requiresMFA: true,
        message: 'MFA verification email sent',
        staffId: staff.staff_id,
      };
    }

    const safeStaff = {
      staff_id: staff.staff_id,
      first_name: staff.first_name,
      last_name: staff.last_name,
      contact_number: staff.contact_number,
      address: staff.address,
      email: staff.email,
      date_created: staff.date_created,
      last_updated: staff.last_updated,
      status: staff.status,
      role: 'staff' as const,
    };

    return {
      ok: true,
      staff: safeStaff,
    };
  }

  async googleSignIn(credential: string) {
    try {
      // Verify the Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const email = normalizeEmail(payload.email);
      // Note: firstName and lastName from Google payload are not used in sign-in, only in sign-up
      // const firstName = payload.given_name || '';
      // const lastName = payload.family_name || '';

      const client = this.databaseService.getClient();

      // Check if user exists in user_admin table
      const adminResult = await client.query<{
        id: string;
        first_name: string;
        last_name: string;
        contact_number: string | null;
        address: string | null;
        email: string;
        date_created: string;
        last_updated: string;
        status: string;
      }>(
        `SELECT admin_id as id, first_name, last_name, contact_number, address, email, date_created, last_updated, status
         FROM user_admin
         WHERE email = $1
         LIMIT 1`,
        [email],
      );

      if (adminResult.rowCount) {
        const admin = adminResult.rows[0];

        if (admin.status !== 'active') {
          return {
            ok: false,
            error:
              admin.status === 'banned'
                ? 'This admin account is banned'
                : 'This admin account is inactive',
          };
        }

        const safeAdmin = {
          admin_id: admin.id,
          first_name: admin.first_name,
          last_name: admin.last_name,
          contact_number: admin.contact_number,
          address: admin.address,
          email: admin.email,
          date_created: admin.date_created,
          last_updated: admin.last_updated,
          status: admin.status,
          role: 'admin',
        };

        return {
          ok: true,
          staff: safeAdmin,
        };
      }

      // Check if user exists in user_staff table
      const staffResult = await client.query<StaffPublicRow>(
        `SELECT staff_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status
         FROM user_staff
         WHERE email = $1
         LIMIT 1`,
        [email],
      );

      if (staffResult.rowCount) {
        const staff = staffResult.rows[0];

        if (staff.status !== 'active') {
          return {
            ok: false,
            error:
              staff.status === 'banned'
                ? 'This staff account is banned'
                : 'This staff account is inactive',
          };
        }

        const safeStaff = {
          staff_id: staff.staff_id,
          first_name: staff.first_name,
          last_name: staff.last_name,
          contact_number: staff.contact_number,
          address: staff.address,
          email: staff.email,
          date_created: staff.date_created,
          last_updated: staff.last_updated,
          status: staff.status,
          role: 'staff' as const,
        };

        return {
          ok: true,
          staff: safeStaff,
        };
      }

      // Account not found - don't allow login
      return {
        ok: false,
        error:
          'No account found with this email. Please contact an administrator to create your account.',
      };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  async googleSignUp(credential: string) {
    try {
      // Verify the Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const email = normalizeEmail(payload.email);
      // Note: firstName and lastName are from Google payload but stored in DB with different names
      const firstName = payload.given_name || '';
      const lastName = payload.family_name || '';

      const client = this.databaseService.getClient();

      // Check if user already exists in user_admin table
      const adminResult = await client.query<{ id: string }>(
        `SELECT admin_id as id FROM user_admin WHERE email = $1 LIMIT 1`,
        [email],
      );

      if (adminResult.rowCount) {
        return {
          ok: false,
          error: 'An admin account with this email already exists',
        };
      }

      // Check if user already exists in user_staff table
      const staffResult = await client.query<StaffPublicRow>(
        `SELECT staff_id FROM user_staff WHERE email = $1 LIMIT 1`,
        [email],
      );

      if (staffResult.rowCount) {
        return {
          ok: false,
          error: 'A staff account with this email already exists',
        };
      }

      // Create new staff account
      const newStaff = await client.query<StaffPublicRow>(
        `INSERT INTO user_staff (first_name, last_name, email, password, birthday, age)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING staff_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status`,
        [
          firstName,
          lastName,
          email,
          '', // Empty password for Google sign-in users
          '1990-01-01', // Default birthday
          0, // Default age
        ],
      );

      const staff = newStaff.rows[0];
      if (!staff) {
        throw new InternalServerErrorException(
          'Failed to create staff account',
        );
      }

      const safeStaff = {
        staff_id: staff.staff_id,
        first_name: staff.first_name,
        last_name: staff.last_name,
        contact_number: staff.contact_number,
        address: staff.address,
        email: staff.email,
        date_created: staff.date_created,
        last_updated: staff.last_updated,
        status: staff.status,
        role: 'staff' as const,
      };

      return {
        ok: true,
        staff: safeStaff,
        newAccount: true,
      };
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create staff account with Google',
      );
    }
  }
}
