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

  constructor(private readonly databaseService: DatabaseService) {
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
    const adminResult = await client.query<any>(
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

    const safeStaff: any = {
      staff_id: staff.staff_id,
      first_name: staff.first_name,
      last_name: staff.last_name,
      contact_number: staff.contact_number,
      address: staff.address,
      email: staff.email,
      date_created: staff.date_created,
      last_updated: staff.last_updated,
      status: staff.status,
      role: 'staff',
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
      const firstName = payload.given_name || '';
      const lastName = payload.family_name || '';

      const client = this.databaseService.getClient();

      // Check if user exists in user_admin table
      const adminResult = await client.query<any>(
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

        const safeStaff: any = {
          staff_id: staff.staff_id,
          first_name: staff.first_name,
          last_name: staff.last_name,
          contact_number: staff.contact_number,
          address: staff.address,
          email: staff.email,
          date_created: staff.date_created,
          last_updated: staff.last_updated,
          status: staff.status,
          role: 'staff',
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
}
