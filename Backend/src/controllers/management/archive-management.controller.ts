import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';

type UserArchiveRow = {
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

type StaffArchiveRow = {
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

@Controller('management/archives')
export class ArchiveManagementController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('users')
  async getUserArchives() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<UserArchiveRow>(
        `SELECT customer_id, first_name, last_name, contact_number, address, email, date_created, last_updated, status
         FROM user_customer_archive
         ORDER BY date_created DESC`,
      );

      return {
        ok: true,
        archives: result.rows,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to fetch user archive list',
      );
    }
  }

  @Get('staff')
  async getStaffArchives() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<StaffArchiveRow>(
        `SELECT staff_id, first_name, last_name, birthday, age, contact_number, address, email, date_created, last_updated, status
         FROM user_staff_archive
         ORDER BY date_created DESC`,
      );

      return {
        ok: true,
        archives: result.rows,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to fetch staff archive list',
      );
    }
  }
}
