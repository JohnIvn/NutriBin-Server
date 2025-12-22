import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';

type StaffPublicRow = {
	staff_id: string;
	f_name: string;
	l_name: string;
	contact_number: string | null;
	address: string | null;
	email: string;
	date_created: string;
	last_updated: string;
	status: string;
};

@Controller('management/staff')
export class StaffManagementController {
	constructor(private readonly databaseService: DatabaseService) {}

	@Get()
	async getAllStaff() {
		const client = this.databaseService.getClient();

		try {
			const result = await client.query<StaffPublicRow>(
				`SELECT staff_id, f_name, l_name, contact_number, address, email, date_created, last_updated, status
				 FROM user_staff
				 ORDER BY date_created DESC`,
			);

			return {
				ok: true,
				staff: result.rows,
			};
		} catch (error) {
			throw new InternalServerErrorException('Failed to fetch staff list');
		}
	}
}
