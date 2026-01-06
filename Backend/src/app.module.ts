import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { StaffAuthController } from './controllers/staff/staff-auth.controller';
import { StaffManagementController } from './controllers/management/staff-management.controller';
import { RepairManagementController } from './controllers/management/repair-management.controller';
import { SettingsController } from './controllers/settings/settings.controller';

import { AppService } from './service/app.service';
import { DatabaseService } from './service/database/database.service';
import { StaffAuthService } from './service/auth/staff-auth.service';
import { NodemailerService } from './service/email/nodemailer.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    StaffAuthController,
    StaffManagementController,
    RepairManagementController,
    SettingsController,
  ],
  providers: [AppService, DatabaseService, StaffAuthService, NodemailerService],
})
export class AppModule {}
