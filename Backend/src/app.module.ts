import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';

import { AppService } from './service/app.service';
import { DatabaseService } from './service/database/database.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
