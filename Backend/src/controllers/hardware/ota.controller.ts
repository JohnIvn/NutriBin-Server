import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  FirmwareService,
  FirmwareRecord,
} from '../../service/firmware/firmware.service';
import { DatabaseService } from '../../service/database/database.service';

@Controller('ota')
export class OtaController {
  constructor(
    private readonly firmwareService: FirmwareService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFirmware(
    @UploadedFile() file: Express.Multer.File,
    @Body('version') version: string,
    @Body('type') type: 'esp32' | 'linux',
    @Body('releaseNotes') releaseNotes: string,
    @Body('notifyFleet') notifyFleet: string,
    @Body('createAnnouncement') createAnnouncement: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const result = await this.firmwareService.uploadFirmware(
      file,
      version,
      releaseNotes,
      [type], // Using target_models as type for now
      'admin',
      notifyFleet === 'true',
      createAnnouncement === 'true',
    );

    return result;
  }

  @Get('check')
  async checkUpdate(
    @Query('current_version') currentVersion: string,
    @Query('type') type: string,
  ) {
    const client = this.databaseService.getClient();
    const result = await client.query<
      Pick<FirmwareRecord, 'version' | 'file_url' | 'checksum'>
    >(
      `SELECT version, file_url, checksum 
       FROM firmware 
       WHERE $1 = ANY(target_models) 
       ORDER BY created_at DESC LIMIT 1`,
      [type],
    );

    if (result.rows.length === 0) {
      return { update: false };
    }

    const latest = result.rows[0];
    if (latest.version !== currentVersion) {
      return {
        update: true,
        version: latest.version,
        url: latest.file_url,
        checksum: latest.checksum,
      };
    }

    return { update: false };
  }

  @Get('history')
  async getOtaHistory(): Promise<FirmwareRecord[]> {
    const client = this.databaseService.getClient();
    const result = await client.query<FirmwareRecord>(
      `SELECT * FROM firmware 
       WHERE 'esp32' = ANY(target_models) OR 'linux' = ANY(target_models)
       ORDER BY created_at DESC`,
    );
    return result.rows;
  }

  @Delete('history/:id')
  async deleteFirmware(@Param('id') id: string) {
    return this.firmwareService.deleteFirmware(id);
  }
}
