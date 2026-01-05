import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

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
  firstname: string;
  lastname: string;
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
  constructor(private readonly databaseService: DatabaseService) {}

  async signUp(dto: StaffSignUpDto) {
    const firstname = dto?.firstname?.trim();
    const lastname = dto?.lastname?.trim();
    const emailRaw = dto?.email;
    const password = dto?.password;
    const birthday = dto?.birthday;
    const age = dto?.age;

    if (!firstname) throw new BadRequestException('firstname is required');
    if (!lastname) throw new BadRequestException('lastname is required');
    if (!emailRaw?.trim()) throw new BadRequestException('email is required');
    if (!password) throw new BadRequestException('password is required');

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
      `INSERT INTO user_staff (firstname, lastname, birthday, age, contact_number, address, email, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING staff_id, firstname, lastname, birthday, age, contact_number, address, email, date_created, last_updated, status`,
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

    console.log("Logging in");
    console.log({email: emailRaw, password: password});
    if (!emailRaw?.trim()) throw new BadRequestException('email is required');
    if (!password) throw new BadRequestException('password is required');

    const email = normalizeEmail(emailRaw);
    const client = this.databaseService.getClient();

    const result = await client.query<StaffDbRow>(
      `SELECT staff_id, firstname, lastname, contact_number, address, email, password, date_created, last_updated, status
       FROM user_staff
       WHERE email = $1
       LIMIT 1`,
      [email],
    );

    console.log("Found Email")
    if (!result.rowCount) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const staff = result.rows[0];
    if (!staff) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const matches = await bcrypt.compare(password, staff.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const safeStaff: StaffPublicRow = {
      staff_id: staff.staff_id,
      firstname: staff.firstname,
      lastname: staff.lastname,
      contact_number: staff.contact_number,
      address: staff.address,
      email: staff.email,
      date_created: staff.date_created,
      last_updated: staff.last_updated,
      status: staff.status,
    };

    return {
      ok: true,
      staff: safeStaff,
    };
  }
}
