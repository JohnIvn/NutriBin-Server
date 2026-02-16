import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './controllers/app.controller';
import { StaffAuthController } from './controllers/staff/staff-auth.controller';
import { StaffPhoneController } from './controllers/staff/staff-phone.controller';
import { StaffManagementController } from './controllers/management/staff-management.controller';
import { UserManagementController } from './controllers/management/user-management.controller';
import { RepairManagementController } from './controllers/management/repair-management.controller';
import { ArchiveManagementController } from './controllers/management/archive-management.controller';
import { MachineManagementController } from './controllers/management/machine-management.controller';
import { MachineMapController } from './controllers/management/machine-map.controller';
import { MachineHealthController } from './controllers/management/machine-health.controller';
import { StatusController } from './controllers/management/status.controller';
import { MachineNotificationsController } from './controllers/management/machine-notifications.controller';
import { SettingsController } from './controllers/settings/settings.controller';
import { AuthenticationController } from './controllers/settings/authentication.controller';
import { CodesController } from './controllers/codes.controller';
import { AnnouncementsController } from './controllers/announcements.controller';
import { SalesController } from './controllers/sales.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { LoginMonitorController } from './controllers/management/login-monitor.controller';
import { LoginRecordsController } from './controllers/management/login-records.controller';
import { MfaRecordsController } from './controllers/management/mfa-records.controller';
import { SerialManagementController } from './controllers/management/serial-management.controller';
import { DatabaseExportController } from './controllers/management/database-export.controller';
import { IprogSmsController } from './controllers/iprogsms.controller';
import { BackupController } from './controllers/backup.controller';
import { EmissionsController } from './controllers/emissions.controller';
import { FertilizerController } from './controllers/fertilizer.controller';
import { CameraLogsController } from './controllers/camera-logs.controller';
import { HardwareController } from './controllers/hardware/hardware.controller';
import { DataScienceController } from './controllers/data-science.controller';
import { SupportController } from './controllers/support.controller';

import { AppService } from './service/app.service';
import { DatabaseService } from './service/database/database.service';
import { BackupService } from './service/database/backup.service';
import { ScheduledBackupService } from './service/database/scheduled-backup.service';
import { StaffAuthService } from './service/auth/staff-auth.service';
import { BrevoService } from './service/email/brevo.service';
import { IprogSmsService } from './service/iprogsms/iprogsms.service';
import { LoginMonitorService } from './service/security/login-monitor.service';
import { VideoStreamGateway } from './service/video/video-stream.gateway';
import { SupportService } from './service/support/support.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [
    AppController,
    StaffAuthController,
    StaffPhoneController,
    StaffManagementController,
    UserManagementController,
    RepairManagementController,
    ArchiveManagementController,
    MachineManagementController,
    MachineMapController,
    MachineHealthController,
    MachineNotificationsController,
    StatusController,
    SettingsController,
    AuthenticationController,
    LoginMonitorController,
    LoginRecordsController,
    MfaRecordsController,
    SerialManagementController,
    DatabaseExportController,
    CodesController,
    AnnouncementsController,
    SalesController,
    DashboardController,
    IprogSmsController,
    BackupController,
    EmissionsController,
    FertilizerController,
    CameraLogsController,
    HardwareController,
    DataScienceController,
    SupportController,
  ],
  providers: [
    AppService,
    DatabaseService,
    BackupService,
    ScheduledBackupService,
    StaffAuthService,
    LoginMonitorService,
    BrevoService,
    IprogSmsService,
    VideoStreamGateway,
    SupportService,
  ],
})
export class AppModule {}
