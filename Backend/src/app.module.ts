import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { StaffAuthController } from './controllers/staff/staff-auth.controller';
import { StaffManagementController } from './controllers/management/staff-management.controller';
import { UserManagementController } from './controllers/management/user-management.controller';
import { RepairManagementController } from './controllers/management/repair-management.controller';
import { ArchiveManagementController } from './controllers/management/archive-management.controller';
import { MachineManagementController } from './controllers/management/machine-management.controller';
import { MachineHealthController } from './controllers/management/machine-health.controller';
import { StatusController } from './controllers/management/status.controller';
import { SettingsController } from './controllers/settings/settings.controller';
import { AuthenticationController } from './controllers/settings/authentication.controller';
import { CodesController } from './controllers/codes.controller';
import { AnnouncementsController } from './controllers/announcements.controller';
import { SalesController } from './controllers/sales.controller';
import { LoginMonitorController } from './controllers/management/login-monitor.controller';
import { LoginRecordsController } from './controllers/management/login-records.controller';
import { MfaRecordsController } from './controllers/management/mfa-records.controller';

import { AppService } from './service/app.service';
import { DatabaseService } from './service/database/database.service';
import { StaffAuthService } from './service/auth/staff-auth.service';
import { BrevoService } from './service/email/brevo.service';
import { TwilioService } from './service/twilio/twilio.service';
import { LoginMonitorService } from './service/security/login-monitor.service';

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
    MachineHealthController,
    StatusController,
    SettingsController,
    AuthenticationController,
    LoginMonitorController,
    LoginRecordsController,
    MfaRecordsController,
    CodesController,
    AnnouncementsController,
    SalesController,
  ],
  providers: [
    AppService,
    DatabaseService,
    StaffAuthService,
    LoginMonitorService,
    BrevoService,
    TwilioService,
  ],
})
export class AppModule {}
