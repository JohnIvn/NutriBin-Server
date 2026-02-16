import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../service/database/database.service';
import { BrevoService } from '../../service/email/brevo.service';

type RepairRow = {
  repair_id: string;
  user_id: string | null;
  machine_id: string | null;
  status: string;
  date_created: string;
  first_name?: string | null;
  last_name?: string | null;
  description?: string | null;
  c1?: boolean;
  c2?: boolean;
  c3?: boolean;
  c4?: boolean;
  s1?: boolean;
  s2?: boolean;
  s3?: boolean;
  s4?: boolean;
  s5?: boolean;
  s6?: boolean;
  s7?: boolean;
  s8?: boolean;
  s9?: boolean;
  s10?: boolean;
  s11?: boolean;
  m1?: boolean;
  m2?: boolean;
  m3?: boolean;
  m4?: boolean;
  m5?: boolean;
};

type CustomerEmailRow = {
  email: string | null;
  first_name: string | null;
};

const repairComponentColumns = [
  'c1',
  'c2',
  'c3',
  'c4',
  's1',
  's2',
  's3',
  's4',
  's5',
  's6',
  's7',
  's8',
  's9',
  's10',
  's11',
  'm1',
  'm2',
  'm3',
  'm4',
  'm5',
] as const;

@Controller('management/repair')
export class RepairManagementController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailer: BrevoService,
  ) {}

  @Get()
  async getAllRepairs() {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<RepairRow>(
        `SELECT 
          r.repair_id, 
          r.user_id, 
          r.machine_id, 
          r.repair_status as status, 
          r.date_created, 
          uc.first_name, 
          uc.last_name, 
          r.description
         FROM repair r
         LEFT JOIN user_customer uc ON r.user_id = uc.customer_id
         ORDER BY r.date_created DESC`,
      );

      return {
        ok: true,
        repairs: result.rows,
      };
    } catch (error) {
      console.error('GetAllRepairs Error:', error);
      throw new InternalServerErrorException('Failed to fetch repair list');
    }
  }

  @Get(':id')
  async getRepairById(@Param('id') id: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query<RepairRow>(
        `SELECT 
          r.repair_id, 
          r.user_id, 
          r.machine_id, 
          r.repair_status as status, 
          r.date_created, 
          uc.first_name, 
          uc.last_name, 
          r.description, 
          ${repairComponentColumns.map((c) => `m.${c}`).join(', ')}
         FROM repair r
         LEFT JOIN user_customer uc ON r.user_id = uc.customer_id
         LEFT JOIN machines m ON r.machine_id = m.machine_id
         WHERE r.repair_id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('Repair not found');
      }

      return {
        ok: true,
        repair: result.rows[0],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('GetRepairById Error:', error);
      throw new InternalServerErrorException('Failed to fetch repair');
    }
  }

  @Post()
  async createRepair(
    @Body()
    createData: {
      user_id?: string;
      machine_id?: string;
      description?: string;
      repair_status?: string;
    },
  ) {
    const client = this.databaseService.getClient();

    try {
      const { user_id, machine_id, description, repair_status } = createData;

      if (!machine_id) {
        throw new BadRequestException('machine_id is required');
      }

      const result = await client.query<RepairRow>(
        `INSERT INTO repair (user_id, machine_id, description, repair_status)
         VALUES ($1, $2, $3, $4)
         RETURNING repair_id, user_id, machine_id, repair_status as status, date_created`,
        [
          user_id || null,
          machine_id,
          description || null,
          repair_status || 'active',
        ],
      );

      return {
        ok: true,
        repair: result.rows[0],
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('CreateRepair Error:', error);
      throw new InternalServerErrorException('Failed to create repair');
    }
  }

  @Put(':id')
  async updateRepair(
    @Param('id') id: string,
    @Body()
    updateData: {
      user_id?: string;
      machine_id?: string;
      description?: string;
      repair_status?: string;
    },
  ) {
    const client = this.databaseService.getClient();

    try {
      const { user_id, machine_id, description, repair_status } = updateData;

      const result = await client.query<RepairRow>(
        `UPDATE repair
         SET user_id = $1, machine_id = $2, description = $3, repair_status = $4
         WHERE repair_id = $5
         RETURNING repair_id, user_id, machine_id, repair_status as status, date_created`,
        [user_id, machine_id, description, repair_status, id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('Repair not found');
      }

      return {
        ok: true,
        repair: result.rows[0],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('UpdateRepair Error:', error);
      throw new InternalServerErrorException('Failed to update repair');
    }
  }

  @Patch(':id/status')
  async updateRepairStatus(
    @Param('id') id: string,
    @Body() statusData: { status: string },
  ) {
    const client = this.databaseService.getClient();

    try {
      const { status } = statusData;

      if (!['active', 'accepted', 'cancelled', 'postponed'].includes(status)) {
        throw new BadRequestException('Invalid status value');
      }

      const result = await client.query<RepairRow>(
        `UPDATE repair
         SET repair_status = $1
         WHERE repair_id = $2
         RETURNING repair_id, user_id, machine_id, repair_status as status, description, date_created`,
        [status, id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('Repair not found');
      }

      const repair = result.rows[0];

      // Notify user by email for relevant status changes
      try {
        if (
          ['accepted', 'cancelled', 'postponed'].includes(
            (status || '').toLowerCase(),
          ) &&
          repair.user_id
        ) {
          const userRes = await client.query<CustomerEmailRow>(
            'SELECT email, first_name FROM user_customer WHERE customer_id = $1 LIMIT 1',
            [repair.user_id],
          );
          if (userRes.rows.length) {
            const user = userRes.rows[0];
            const to = user.email;
            const machineId = repair.machine_id || '';
            const issueType = repair.description || 'Repair request';

            if (to) {
              await this.mailer.sendRepairNotification(to, {
                machineId,
                issueType,
                status: status,
                description: repair.description ?? undefined,
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to send repair notification email:', err);
      }

      return {
        ok: true,
        repair,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('UpdateRepairStatus Error:', error);
      throw new InternalServerErrorException('Failed to update repair status');
    }
  }

  @Delete(':id')
  async deleteRepair(@Param('id') id: string) {
    const client = this.databaseService.getClient();

    try {
      const result = await client.query(
        'DELETE FROM repair WHERE repair_id = $1 RETURNING repair_id',
        [id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('Repair not found');
      }

      return {
        ok: true,
        message: 'Repair deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('DeleteRepair Error:', error);
      throw new InternalServerErrorException('Failed to delete repair');
    }
  }
}
