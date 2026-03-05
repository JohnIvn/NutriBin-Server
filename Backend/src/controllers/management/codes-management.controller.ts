import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../service/database/database.service';

@Controller('management/codes')
export class CodesManagementController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getAllCodes() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        `SELECT 
          c.code_id, 
          c.user_id, 
          c.code, 
          c.purpose, 
          c.used, 
          c.created_at, 
          c.expires_at,
          COALESCE(s.email, cu.email) as email
         FROM codes c
         LEFT JOIN user_staff s ON c.user_id = s.staff_id
         LEFT JOIN user_customer cu ON c.user_id = cu.customer_id
         ORDER BY c.created_at DESC`,
      );

      return {
        ok: true,
        codes: result.rows,
      };
    } catch (error) {
      console.error('Failed to fetch codes', error);
      throw new InternalServerErrorException('Failed to fetch codes list');
    }
  }
}
