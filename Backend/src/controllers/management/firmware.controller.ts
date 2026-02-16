import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirmwareService } from '../../service/firmware/firmware.service';
import { DatabaseService } from '../../service/database/database.service';

@Controller('management/firmware')
export class FirmwareController {
  constructor(
    private readonly firmwareService: FirmwareService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get('history')
  async getHistory() {
    return this.firmwareService.getAllFirmware();
  }

  @Get('latest')
  async getLatest(@Query('model') model?: string) {
    return this.firmwareService.getLatestFirmware(model);
  }

  @Get('propagation')
  async getPropagation() {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(`
        SELECT 
          m.machine_id,
          ms.serial_number as name,
          ms.machine_serial_id as id,
          m.firmware_version as current,
          m.target_firmware_version as target,
          m.update_status as status,
          m.last_update_attempt as last
        FROM machines m
        JOIN machine_serial ms ON m.machine_id = ms.machine_serial_id
        WHERE m.update_status != 'success' OR m.last_update_attempt > NOW() - INTERVAL '24 hours'
        ORDER BY m.last_update_attempt DESC
      `);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to fetch propagation status',
      );
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFirmware(
    @UploadedFile() file: Express.Multer.File,
    @Body('version') version: string,
    @Body('releaseNotes') releaseNotes: string,
    @Body('targetModels') targetModels: string | string[],
    @Body('checksum') checksum: string,
    @Body('uploadedBy') uploadedBy: string,
  ) {
    const models =
      typeof targetModels === 'string'
        ? JSON.parse(targetModels)
        : targetModels;
    return this.firmwareService.uploadFirmware(
      file,
      version,
      releaseNotes,
      models,
      checksum,
      uploadedBy,
    );
  }

  @Delete(':id')
  async deleteFirmware(@Param('id') id: string) {
    return this.firmwareService.deleteFirmware(id);
  }
}
