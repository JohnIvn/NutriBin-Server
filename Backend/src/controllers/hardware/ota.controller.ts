import {
  Controller,
  Post,
  Get,
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
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    // We reuse the firmware service but might need to distinguish type in DB if not already there
    // For this advanced task, we'll assume we track 'target_models' or similar to filter by type
    return this.firmwareService.uploadFirmware(
      file,
      version,
      releaseNotes,
      [type], // Using target_models as type for now
      'admin',
      true,
      false,
    );
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
}
