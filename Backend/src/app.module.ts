import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { StaffAuthController } from './controllers/staff/staff-auth.controller';
import { StaffManagementController } from './controllers/management/staff-management.controller';
import { UserManagementController } from './controllers/management/user-management.controller';
import { RepairManagementController } from './controllers/management/repair-management.controller';
import { ArchiveManagementController } from './controllers/management/archive-management.controller';
import { MachineManagementController } from './controllers/management/machine-management.controller';
import { SettingsController } from './controllers/settings/settings.controller';
import { AuthenticationController } from './controllers/settings/authentication.controller';
import { AnnouncementsController } from './controllers/announcements.controller';
import { SalesController } from './controllers/sales.controller';

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
    UserManagementController,
    RepairManagementController,
    ArchiveManagementController,
    MachineManagementController,
    SettingsController,
    AuthenticationController,
    AnnouncementsController,
    SalesController,
  ],
  providers: [AppService, DatabaseService, StaffAuthService, NodemailerService],
})
export class AppModule {}
