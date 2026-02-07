import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../service/database/database.service';

@Controller('management/serials')
export class SerialManagementController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getAllSerials() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `SELECT 
          ms.machine_serial_id,
          ms.serial_number,
          ms.is_used,
          ms.is_active,
          ms.date_created,
          m.machine_id
         FROM machine_serial ms
         LEFT JOIN machines m ON ms.machine_serial_id = m.machine_id
         ORDER BY ms.date_created DESC`,
      );

      return {
        ok: true,
        serials: result.rows,
      };
    } catch {
      throw new InternalServerErrorException('Failed to fetch serials list');
    }
  }
}
