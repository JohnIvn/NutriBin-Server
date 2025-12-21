import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

import { createUserCustomerTable } from './models/user-customer.model';
import { createUserStaffTable } from './models/user-staff.model';
import { createUserAdminTable } from './models/user-admin.model';
import { createTrashLogsTable } from './models/trash-logs.model';
import { createCameraLogsTable } from './models/camera-logs';
import { createFertilizerAnalyticsTable } from './models/fertilizer-analytics.model';
import { createMachinesTable } from './models/machines.model';
import { createModuleAnalyticsTable } from './models/module-analytics.model';
import { createRepairTable } from './models/repair.module';

dotenv.config();

console.log(chalk.bgBlue.black('[SERVICE] Database service loaded'));

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client: Client;

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error(
        chalk.red.bold(
          '[SUPABASE] DATABASE_URL is not defined in environment variables',
        ),
      );
      throw new Error('[SUPABASE] DATABASE_URL is missing');
    }

    this.client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    console.log(chalk.blueBright('[SUPABASE] Database client initialized.'));
  }

  async onModuleInit() {
    console.log(chalk.yellow('[SUPABASE] Connecting to the database...'));

    await this.client.connect();
    console.log(chalk.green('[SUPABASE] Connected to the database!'));

    console.log(chalk.cyan('[SUPABASE] Creating tables...'));
    await createUserCustomerTable(this.client);
    await createUserStaffTable(this.client);
    await createUserAdminTable(this.client);
    await createTrashLogsTable(this.client);
    await createCameraLogsTable(this.client);
    await createFertilizerAnalyticsTable(this.client);
    await createMachinesTable(this.client);
    await createModuleAnalyticsTable(this.client);
    await createRepairTable(this.client);

    console.log(chalk.bgGreen.black('[SUPABASE] All tables are ready!'));
  }

  getClient(): Client {
    return this.client;
  }
}
