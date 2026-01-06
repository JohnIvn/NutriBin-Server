import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { StaffAuthController } from './controllers/staff/staff-auth.controller';
import { StaffManagementController } from './controllers/management/staff-management.controller';

import { AppService } from './service/app.service';
import { DatabaseService } from './service/database/database.service';
import { StaffAuthService } from './service/auth/staff-auth.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    StaffAuthController,
    StaffManagementController,
  ],
  providers: [AppService, DatabaseService, StaffAuthService],
})
export class AppModule {}
